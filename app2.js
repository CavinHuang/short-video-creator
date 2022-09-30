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

const createFFTask = async (contentVideo) => {
  const videoStart = path.join(__dirname, './start.mp4');
  const cacheDir = path.join(__dirname, './cache/');
  const outputDir = path.join(__dirname, './output/');

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
    log: true
    //audio,
  });

  // create FFScene
  const scene1 = new FFScene();
  
  const fvideo1 = new FFVideo({ path: videoStart, y: 0 });
  fvideo1.setAudio(false)
  scene1.addChild(fvideo1);
  scene1.setDuration(10);
  scene1.setTransition('Fat', 1.5)
  creator.addChild(scene1);

  const scene2 = new FFScene()
  const contentVideoInstance = new FFVideo({
    path: contentVideo,
    y: 0
  })
  contentVideoInstance.setAudio(true)
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
  FFCreatorCenter.addTask(() => {
    createFFTask(item.path)
  })
})

