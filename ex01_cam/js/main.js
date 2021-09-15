'use strict';

const localVideo = document.querySelector('#localvideo')

navigator.mediaDevices.getUserMedia({
    video:true
}).then(mediaStream=> {

    console.log(localVideo)

    console.log(mediaStream)

    localVideo.srcObject = mediaStream

    // localVideo.src = mediaStream
}).catch(error=> {
    console.log(error)
})