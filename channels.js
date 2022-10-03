const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')

const url = 'https://channels.weixin.qq.com/platform'

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars','--window-size=1280,960'],
    ignoreDefaultArgs: ['--enable-automation']
  })

  const page = await browser.newPage()
  // 设置页面分辨率
  await page.setViewport({ width: 1920, height: 1080 })

  // 导航到url
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  // 等待页面加载
  // await page.waitFor(1000)

  // 滚动高度
  let scrollStep = 1080
  // 最大滚动高度
  let max_height = 30000
  let m = { prevScroll: -1, curScroll: 0 }

  while (m.prevScroll !== m.curScroll && m.curScroll < max_height) {
    m = await page.evaluate((scrollStep) => {
      if (document.scrollingElement) {
        let prevScroll = document.scrollingElement.scrollTop
        document.scrollingElement.scrollTop = prevScroll + scrollStep
        let curScroll = document.scrollingElement.scrollTop
        return { prevScroll, curScroll }
      }
    }, scrollStep)

    await sleep(3600)
  }
  const txt = await page.$eval('body', (e) => {
    // 提取文本
    function getNodeTextInfo(node) {
      let list = []
      traverseNodes(node)
      return list

      function traverseNodes(node) {
        //判断是否是元素节点
        if (node.nodeType === 1) {
          let nodeCss = window.getComputedStyle(node, null)
          if (nodeCss.display !== 'none' && nodeCss.visibility !== 'hidden') {
            //判断该元素节点是否有子节点
            if (node.hasChildNodes) {
              //得到所有的子节点
              let sonnodes = node.childNodes
              //遍历所哟的子节点
              for (let i = 0; i < sonnodes.length; i++) {
                //得到具体的某个子节点
                let sonnode = sonnodes.item(i)
                //递归遍历
                traverseNodes(sonnode)
              }
            }
          }
        } else if (node.nodeType === 3 && node.parentNode.nodeName.toLowerCase() !== 'script') {
          let str = node.nodeValue.replace(/\s*/g, '')
          if (str) {
            // 捕获文本节点
            let css = window.getComputedStyle(node.parentNode, null)
            if (css.display !== 'none' || css.visibility !== 'hidden') {
              let pos = getPos(node.parentNode)
              list.push({
                x: pos.x,
                y: pos.y,
                text: node.nodeValue,
                width: node.parentNode.offsetWidth,
                height: node.parentNode.offsetHeight,
                fontSize: css.fontSize,
                xpath: getPathTo(node.parentNode),
                color: css.color,
                fontWeight: css.fontWeight
              })
            }
          }
        }
      }

      function getPos(el) {
        return {
          x: el.getBoundingClientRect().left + document.documentElement.scrollLeft,
          y: el.getBoundingClientRect().top + document.documentElement.scrollTop
        }
      }
    }
    // 获取xpath路径
    function getPathTo(element) {
      if (element.id !== '') return 'id("' + element.id + '")'
      if (element === document.body) return element.tagName

      let ix = 0
      let siblings = element.parentNode.childNodes
      for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i]
        if (sibling === element) return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']'
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++
      }
    }
    return getNodeTextInfo(e)
  })

  let uid = uuid(6, 10)
  await fs.writeFileSync(path.resolve(__dirname, `./db/${uid}.json`), JSON.stringify(txt))

  const screenshot = await page.screenshot({ path: path.resolve(`static/222.jpg`), fullPage: true, quality: 70 })
  // browser.close()
}

//延时函数
function sleep(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, delay)
  })
}

// 生成uuid
function uuid(len, radix) {
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

main()