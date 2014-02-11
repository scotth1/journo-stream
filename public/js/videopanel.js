
var videoElement = document.querySelector("video");
var audioSelect = document.querySelector("select#audioSource");
var videoSelect = document.querySelector("select#videoSource");
var resolutionSelect = document.querySelector("select#resoltionSource");
var startButton = document.querySelector("button#start");
var resolutions = [{mandatory: {maxWidth: 320, maxHeight: 180}},{mandatory: {maxWidth: 640, maxHeight: 360}},{mandatory: {minWidth: 1280, minHeight: 720}}];

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function gotSources(sourceInfos) {
  for (var i = 0; i != sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement("option");
    option.value = sourceInfo.id;
    if (sourceInfo.kind === 'audio') {
      option.text = sourceInfo.label || 'microphone ' + (audioSelect.length + 1);
      audioSelect.appendChild(option);
    } else if (sourceInfo.kind === 'video') {
      option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
    for(var o = 0; o != resolutions.lengthl; o++) {
        var resOpt = document.createElement("option");
        resOpt.value = o;
        resOpt.label = ""+(o.maxHeight===undefined?o.minHeight:o.maxHeight)+"x"+(o.maxWidth===undefined?o.minWidth:o.maxWidth);
        resolutionSelect.appendChild(resOpt);
    }
    
  }
}

if (typeof MediaStreamTrack === 'undefined'){
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
} else {
  MediaStreamTrack.getSources(gotSources);
}


function successCallback(stream) {
  window.stream = stream; // make stream available to console
  videoElement.src = window.URL.createObjectURL(stream);
  videoElement.play();
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

function start(){
  if (!!window.stream) {
    videoElement.src = null;
    window.stream.stop();
  }
  
  var audioSource = audioSelect.value;
  var videoSource = videoSelect.value;
  var constraints = {
    audio: {
      optional: [{sourceId: audioSource}]
    },
    video: {
      optional: [{sourceId: videoSource}]
    }
  };
  navigator.getUserMedia(constraints, successCallback, errorCallback);
}

audioSelect.onchange = start;
videoSelect.onchange = start;

start();
