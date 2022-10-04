const path = require('path');
const colors = require('colors');
const startAndListen = require('./listen');
const { FFCreatorCenter, FFScene, FFImage, FFText, FFVideo, FFCreator, FFLottie } = require('ffcreator');
const ffmpeg = require('fluent-ffmpeg')
const execa = require('execa')
const videoData = require('./videoData.json')

function getVideoMetaData(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err)
      }
      const { duration } = metadata.format
      const videoInfo = metadata.streams.find(stream => stream.codec_type === 'video')
      let isVideo = false
      let videoWidth = 0
      let videoHeight = 0
      if (videoInfo) {
        isVideo = true
        videoWidth = videoInfo.width
        videoHeight = videoInfo.height
      }
      resolve({
        duration,
        isVideo,
        videoWidth,
        videoHeight
      })
    })
  })
}

const createFFTask = async (contentVideo, desc = '') => {
  const videoStart = path.join(__dirname, './start.mp4');
  const cacheDir = path.join(__dirname, './cache/');
  const outputDir = path.join(__dirname, './output/');
  const font = path.join(__dirname, './font1.ttf');

  const { duration, videoHeight, videoWidth } = await getVideoMetaData(contentVideo)
  console.log("🚀 ~ file: app2.js ~ line 47 ~ createFFTask ~ videoWidth", videoWidth)
  console.log("🚀 ~ file: app2.js ~ line 47 ~ createFFTask ~ videoHeight", videoHeight)
  console.log("🚀 ~ file: app2.js ~ line 47 ~ createFFTask ~ duration", duration)

  // create creator instance
  const creator = new FFCreator({
    cacheDir,
    outputDir,
    width: videoWidth,
    height: videoHeight,
    log: true,
    //audio,
    defaultOutputOptions: {
      merge: true,
      options: ['-c:v', 'libx264']
    }
  });

  // create FFScene
  const scene1 = new FFScene();
  scene1.setBgColor('#00ff00')
  
  const fvideo1 = new FFVideo({
    path: videoStart,
    x: videoWidth / 2,
    y: videoHeight / 2,
    width: videoWidth,
    height: videoHeight
  });
  fvideo1.setAudio(false)
  scene1.addChild(fvideo1);
  scene1.setDuration(4);
  scene1.setTransition('MoveLeft', 1.5)

  if (desc) {
    const textStr = desc.replace(/\uff0c/g, '\r\n')
    const text = new FFText({
      text: textStr,
      color: '#ffcca9',
      x: videoWidth / 2,
      y: 900,
      font,
      fontSize: 90
    })
    text.alignCenter()
    text.addEffect('zoomIn', 1, 1)
    text.setFont(font)
    text.setStyle({
      // 'text-shadow': '3px 2px 7px RGB(255,204,169,0.6)',
      lineHeight: 56,
      padding: 10,
      stroke: '#ff0000',
      strokeThickness: 8,
      dropShadow: true,
      dropShadowColor: 'RGB(255,204,169,0.6)',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 1200,
    })
    scene1.addChild(text)
  }
  creator.addChild(scene1);

  const scene2 = new FFScene()
  const contentVideoInstance = new FFVideo({
    path: contentVideo,
    x: videoWidth / 2,
    y: videoHeight / 2,
    width: videoWidth,
    height: videoHeight
  })
  contentVideoInstance.setAudio(true)
  contentVideoInstance.setStartTime(3)
  scene2.setDuration(duration - 7)
  scene2.addChild(contentVideoInstance)
  creator.addChild(scene2)

  creator.start();
  creator.openLog();

  creator.on('start', () => {
    console.log(`FFCreatorLite start`);
  });

  creator.on('error', e => {
    console.log(`FFCreatorLite error:: \n ${e.error}`);
  });

  creator.on('progress', e => {
    console.log(colors.yellow(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`));
  });

  creator.on('complete', e => {
    console.log(
      colors.magenta(`FFCreatorLite completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `),
    );

    console.log(colors.green(`\n --- You can press the s key or the w key to restart! --- \n`));
  });

  return creator;
};

// startAndListen(() => () => {

// });

videoData.videoData.forEach(item => {
  console.log("🚀 ~ file: app2.js ~ line 121 ~ item", item)
  FFCreatorCenter.addTask(async () => {
    const creator = await createFFTask(item.path, item.desc)
    return creator
  })
})

