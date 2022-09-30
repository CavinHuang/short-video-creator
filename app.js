const path = require('path');
const colors = require('colors');
const startAndListen = require('./listen');
const { FFCreatorCenter, FFScene, FFImage, FFText, FFVideo, FFCreator, FFLottie } = require('ffcreator');
const ffmpeg = require('fluent-ffmpeg')
const execa = require('execa')

function getVideoMetaData(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      console.log("🚀 ~ file: app.js ~ line 10 ~ ffmpeg.ffprobe ~ metadata", metadata)
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

function flipVideo(filePath) {
  const res = execa.commandSync(`ffmpeg.exe -i ${filePath} -vf "vflip" r_1.mp4`)
  console.log("🚀 ~ file: app.js ~ line 39 ~ flipVideo ~ res", res)
}

const createFFTask = async () => {
  const video1 = path.join(__dirname, './1.mp4');
  const image1 = path.join(__dirname, './1.jpg');
  const font = path.join(__dirname, './font1.ttf');
  const cacheDir = path.join(__dirname, './cache/');
  const outputDir = path.join(__dirname, './output/');
  const mapJson = path.join(__dirname, './map.json')
  const yinfuJson = path.join(__dirname, './yinfu.json')
  const musicJson = path.join(__dirname, './music.json')
  const musicLoadingJson = path.join(__dirname, './musicLoading.json')

  const { duration, videoHeight, videoWidth } = await getVideoMetaData(video1)

  // create creator instance
  const creator = new FFCreator({
    cacheDir,
    outputDir,
    width: videoWidth,
    height: videoHeight,
    log: true
    //audio,
  });

  // create FFScene
  const scene1 = new FFScene();
  scene1.setBgColor('#22292f')

  // 背景图
  const image = new FFImage({
    path: image1,
    x: videoWidth / 2,
    y: videoHeight / 2,
    width: videoWidth,
    height: videoHeight
  })
  scene1.addChild(image)


  // 背景
  const flottieMap = new FFLottie({
    x: videoWidth / 2,
    y: videoHeight - videoHeight / 4 + 120,
    width: videoWidth,
    height: videoHeight,
    file: yinfuJson,
    loop: true
  })
  scene1.addChild(flottieMap)

  // 小图标
  const flottieMusic = new FFLottie({
    x: videoWidth / 2,
    y: 300,
    width: videoWidth / 3,
    height: videoWidth / 3,
    file: musicJson,
    loop: true
  })
  scene1.addChild(flottieMusic)

  const text = new FFText({
    text: '星图音乐·经典老歌',
    color: '#ffcca9',
    x: videoWidth / 2,
    y: 600,
    font,
    fontSize: 120
  })
  text.alignCenter()
  text.addEffect('zoomIn', 1, 1)
  text.setFont(font)
  text.setStyle({
    // 'text-shadow': '3px 2px 7px RGB(255,204,169,0.6)',
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

  // 背景
  // const musicLoading = new FFLottie({
  //   x: videoWidth / 2,
  //   y: videoHeight - 100,
  //   width: videoWidth,
  //   height: videoHeight,
  //   file: musicLoadingJson,
  //   loop: true
  // })
  // scene1.addChild(musicLoading)

  // const fvideo1 = new FFVideo({ path: video1, y: 0 });
  // fvideo1.setDuration(duration || 0)
  // scene1.addChild(fvideo1);
  scene1.setDuration(10);
  creator.addChild(scene1);

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

startAndListen(() => FFCreatorCenter.addTask(createFFTask));