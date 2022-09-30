const os = require('os')
const childProcess = require("child_process")
const execa = require('execa')
/**
 * 注意：此方法在Linux服务器/Windows上有效果 需安装FFmpeg
 * FFmpeg获得视频文件的总长度时间(秒数)
 * @param file 视频文件的地址
 * @param ffmpeg_path ffmpeg的绝对路径 windows服务器 必须 ffmpeg = 'D:\\items\\ffmpeg\\bin\\ffmpeg.exe';
 */
exports.getVideoTime = function (file) {
  let duration_in_seconds = 0;
  let vtime = false;
  if(os.type().toLowerCase().includes('windows')){
    commond = `ffmpeg.exe -i ${file} 2>&1`;
    const str_res = execa.commandSync(commond);
    if (Array.isArray(str_res)){
      for (let i = 0; i < str_res.length; i++) {
        const v = String(str_res[i])
        const dIndex = v.indexOf(Duration)
        if (dIndex !== -1){
          const index = v.indexOf('.')
          vtime = v.substr(index - 8, 8)
          break;
        }
      }
    }
  }else{
    vtime = childProcess.exec("ffmpeg -i " + file + " 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//");//总长度
  }
  if(vtime){
    duration = vtime.split(':');
    if(duration){
      duration_in_seconds = duration[0]*3600 + duration[1]*60+ Math.round(duration[2]);//转化为秒
    }
  }
  return duration_in_seconds;
}