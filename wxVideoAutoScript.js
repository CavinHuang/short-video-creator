const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const axios = require('axios')

const filePath = path.resolve(__dirname, './1.mp4')

class WxVideoAutoScript {
  url = 'https://channels.weixin.qq.com/platform'
  browser
  async initBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars','--window-size=1920,1080'],
      ignoreDefaultArgs: ['--enable-automation'],
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    })
    this.browser = browser
    const page = await browser.newPage()
    // 设置页面分辨率
    await page.setViewport({ width: 1920, height: 1080 })

    // 导航到url
    await page.goto(this.url, { waitUntil: 'domcontentloaded' })
      
    this.handleWxVideo(page)
  }

  async handleWxVideo(page, loaded = false) {
    console.log('是否已经加载', loaded)
    if (!loaded) {
      await page.waitForResponse(response => {
        return response.url().includes('auth/auth_login_code')
        }).then(async () => {
        const needLogin = await page.evaluate(()=>{
          const qrcode = document.querySelector('.qrcode-area').querySelector('.tip span').innerHTML;
          return qrcode
        });
        if (needLogin) {
          this.doLogin(page)
        } else {
          console.log('=======开始发布')
          this.postVideo(page)
        }
      })
    } else {
      const needLogin = await page.evaluate(()=>{
        const qrcode = document.querySelector('.qrcode-area')?.querySelector('.tip span')?.innerHTML;
        return qrcode
      });
      if (needLogin) {
        this.doLogin(page)
      } else {
        console.log('=======开始发布')
        this.postVideo(page)
      }
    }
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
      // this.pushToWechat(image)
    }
    const time = Date.now()
    let i = 0
    while(Date.now() - time < 10 * 1000) {
      await this.sleep(1000)
      console.log('等待登录操作', i)
      i++
    }
    console.log('开始重新判断')
    this.handleWxVideo(page, true)
  }

  async postVideo(page) {
    console.log('开始发布')
    this.sleep(5000)
    const desc = "太阳出來了 \r\n没什么练习直接录 #推荐 #人人都是创作者"
    console.log("开始上传视频")
    // await page.waitForNavigation()
    const startBtn = await page.waitForSelector('.post-list button.weui-desktop-btn.weui-desktop-btn_primary')
    // const btn = await page.evaluate((btn) => {
    //   document.querySelector(btn).click()
    //   // btn.click()l
    // }, '.post-list button.weui-desktop-btn.weui-desktop-btn_primary')
    await startBtn.click()

    // page.waitForSelector('.weui-desktop-btn.weui-desktop-btn_primary').then(async (e) => {
    //   fs.writeFileSync('./static/333.html', await page.content())
    //   // e.click()
    //   const a = await page.$('button.weui-desktop-btn.weui-desktop-btn_primary')
    //   console.log("🚀 ~ file: wxVideoAutoScript.js ~ line 107 ~ WxVideoAutoScript ~ page.waitForSelector ~ a", a)
    //   a.click()
    // })
    const uploadBtn = await page.waitForSelector('.ant-upload.ant-upload-btn')
    await uploadBtn.click()

    await page.evaluate((fileInput) => {
      document.querySelector(fileInput).style.display = 'inline'
      // btn.click()l
    }, '.ant-upload.ant-upload-btn input')
    // fs.writeFileSync('./static/333.html', await page.content())
    // const fileChooser = await page.waitForFileChooser()
    // console.log("🚀 ~ file: wxVideoAutoScript.js ~ line 119 ~ WxVideoAutoScript ~ postVideo ~ fileChooser", fileChooser)
    // await fileChooser.accept([filePath]);
    
    const uploadFileInput = await page.waitForSelector('.ant-upload.ant-upload-btn input')
    console.log("🚀 ~ file: wxVideoAutoScript.js ~ line 125 ~ WxVideoAutoScript ~ postVideo ~ uploadFileInput", uploadFileInput)
    await uploadFileInput.uploadFile(filePath)
    await this.sleep(5000)

    const hasProcess = async () => await page.evaluate((selector) => {
      return document.querySelector(selector)
    }, '.media-status-body')

    while(await hasProcess()) {
      console.log('正在上传......')
      await this.sleep(5000)
    }
    console.log('上传完成')

    await this.sleep(5000)
    // 选取封面
    const preivewBtn = await page.waitForSelector('.finder-tag-wrap.btn')
    await preivewBtn.click()
    const previewWrap = await page.waitForSelector('.weui-desktop-dialog__wrp')
    // top 181
    const {x, y} = await page.evaluate((boxSelect) => {
      const box = document.querySelector(boxSelect).getBoundingClientRect()
      const { x, y, width, height } = box
      return { x, y }
    }, '.crop-box')
    console.log("🚀 ~ file: wxVideoAutoScript.js ~ line 159 ~ WxVideoAutoScript ~ const{x,y}=awaitpage.evaluate ~ x", x, y)

    await page.mouse.move(x + 30, y, { steps: 10 })
    await page.mouse.down()
    await page.mouse.move(x + 30, 280, { steps: 10 })
    await page.mouse.up()

    // 截取预览图
    const { px, py, pwidth } = await page.evaluate((previewSelector) => {
      const previewImg = document.querySelector(previewSelector).getBoundingClientRect()
      const { x, y, width, height } = previewImg
      return { px: x, py: y, pwidth: width }
    }, '.key-frames-bg-slider')

    await page.mouse.move(px + 10, py + 10, { steps: 10 })
    await page.mouse.down()
    await page.mouse.move(307 + 33.5, py + 10, { steps: 10 })
    await page.mouse.up()

    await this.sleep(1000)

    const previewConfirmBtn = await page.waitForSelector('.cover-set-footer button.weui-desktop-btn.weui-desktop-btn_primary.weui-desktop-btn_mini')
    await previewConfirmBtn.click()

    await this.sleep(10000)

    await page.waitForSelector('.input-editor')
    await page.type('.input-editor', desc)
    console.log('发送描述信息')

    const submitBtn = await page.waitForSelector('.weui-desktop-popover__target button.weui-desktop-btn.weui-desktop-btn_primary')
    await submitBtn.click()
  }

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