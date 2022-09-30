const path = require('path')
const fs = require('fs')

const videoPath = path.resolve(__dirname, './video')

const videoData = []

const reg = /(#?[\u4e00-\u9fa5]+(\uff0c|#|\s))+/gm

fs.readdirSync(videoPath).forEach(filePath => {
  if (filePath.endsWith('.mp4')) {
    const matchRes = filePath.match(reg)

    if (matchRes && matchRes.length) {
      const stringTitle = matchRes[0].replace(/\s*/, '')
      const strTitle = stringTitle.split('#')
      const desc = strTitle[0]
      videoData.push({
        path: path.join(videoPath, filePath),
        desc
      })
    }
  }
})

fs.writeFileSync(path.relative(__dirname, './videoData.json'), `
{
  "videoData": ${JSON.stringify(videoData)}
}
`)