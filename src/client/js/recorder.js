import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = new FFmpeg();
  await ffmpeg.load({ log: true });

  await ffmpeg.writeFile(files.input, await fetchFile(videoFile)); //blob데이터를 가져와 FFmpeg가 처리 변환 //ffmpeg는 arraybuffer형태로 작업
  await ffmpeg.exec(["-i", files.input, "-r", "60", files.output]);

  await ffmpeg.exec([
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb,
  ]);

  const mp4File = await ffmpeg.readFile(files.output);
  const thumbFile = await ffmpeg.readFile(files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  await ffmpeg.deleteFile(files.input);
  await ffmpeg.deleteFile(files.output);
  await ffmpeg.deleteFile(files.thumb);

  URL.revokeObjectURL("mp4Url");
  URL.revokeObjectURL("thumbUrl");
  URL.revokeObjectURL("videoFile");

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);

  recorder.stop();
};
const handleStart = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };

  recorder.start();
};

const init = async () => {
  try {
    // 장치 목록을 확인하여 비디오가 있는지 여부를 파악
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasVideoInput = devices.some(
      (device) => device.kind === "videoinput"
    );
    const hasAudioInput = devices.some(
      (device) => device.kind === "audioinput"
    );

    // 비디오 장치가 없는 경우, 비디오 요청을 하지 않음
    const constraints = {
      audio: hasAudioInput ? true : false,
      video: hasVideoInput ? true : false,
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);

    video.srcObject = stream;
    video.play();

    video.style, (width = "540px");
    video.style, (height = "380px");

    if (!hasAudioInput && !hasVideoInput) {
      console.warn(
        "마이크와 카메라가 모두 없습니다. 오디오 및 비디오를 사용할 수 없습니다."
      );
    } else {
      if (!hasVideoInput) {
        console.warn("카메라가 없습니다. 오디오만 사용할 수 있습니다.");
      }
      if (!hasAudioInput) {
        console.warn("마이크가 없습니다. 오디오를 사용할 수 없습니다.");
      }
    }
  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
};

init();

actionBtn.addEventListener("click", handleStart);
