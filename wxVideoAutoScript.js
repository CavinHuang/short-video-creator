const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const axios = require('axios')

class WxVideoAutoScript {
  url = 'https://channels.weixin.qq.com/platform'
  browser
  async initBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars','--window-size=1920,1080'],
      ignoreDefaultArgs: ['--enable-automation']
    })
    this.browser = browser
    const page = await browser.newPage()
    // 设置页面分辨率
    await page.setViewport({ width: 1920, height: 1080 })

    // 导航到url
    await page.goto(this.url, { waitUntil: 'domcontentloaded' })
    this.handleWxVideo(page)
  }

  async handleWxVideo(page) {
    // const res = await page.$eval('body', (e) => {
    //   console.log(e)
    //   // const loginArea = e.querySelector('.qrcode-area').querySelector('span').innerText
    //   // console.log("🚀 ~ file: wxVideoAutoScript.js ~ line 27 ~ WxVideoAutoScript ~ awaitpage.$eval ~ loginArea", loginArea)
    //   return e
    // })
    await page.waitForResponse(response => {
      return response.url().includes('auth/auth_login_code')
    }).then(async () => {
      const needLogin = await page.evaluate(()=>{
        const qrcode = document.querySelector('.qrcode-area').querySelector('.tip span').innerHTML;
        return qrcode
      });
      if (needLogin) {
        this.doLogin(page)
      }
    })
  }

  pushToWechat(imgUrl) {
    console.log('推送')
    const url = 'http://www.pushplus.plus/send'
    axios.post(url, {
      title: '视频平台自动登录',
      token: 'ff5a16716e7c4489a5043570bb448ca1',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <img src="${imgUrl}" />
</body>
</html>`
    })
  }

  async doLogin(page) {
    console.log('需要登录')
    const image = await page.evaluate(()=>{
        const qrcode = document.querySelector('.qrcode-area').querySelector('img').src;
        return qrcode
      });
      if (image) {
        this.pushToWechat(image)
      }
  }

  postVideo() {}

  //延时函数
  sleep(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1)
      }, delay)
    })
  }

  // 生成uuid
  uuid(len, radix) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    let uuid = [],
      i
    radix = radix || chars.length

    if (len) {
      for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
    } else {
      let r
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
      uuid[14] = '4'

      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | (Math.random() * 16)
          uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
        }
      }
    }

    return uuid.join('')
  }
}

const wxVideo = new WxVideoAutoScript()
wxVideo.initBrowser()