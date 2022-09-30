const path = require('path');
const colors = require('colors');
const startAndListen = require('./listen');
const { FFCreatorCenter, FFScene, FFCreator, FFLottie } = require('ffcreator');
const ffmpeg = require('fluent-ffmpeg');
const { FFImage } = require('ffcreator');

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
const createFFTask = async () => {
  const video1 = path.join(__dirname, './1.mp4');
  const image1 = path.join(__dirname, './1.jpg');
  const cacheDir = path.join(__dirname, './cache/');
  const outputDir = path.join(__dirname, './output/');
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

  // 背景图
  const image = new FFImage({
    path: image1,
    x: 0,
    y: 0,
    width: videoWidth,
    height: videoHeight
  })
  scene1.addChild(image)

  // 背景
  const flottieMap = new FFLottie({
    x: videoWidth / 2,
    y: videoHeight - 100,
    width: videoWidth,
    height: videoHeight,
    file: musicLoadingJson,
    loop: true
  })
  scene1.addChild(flottieMap)


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