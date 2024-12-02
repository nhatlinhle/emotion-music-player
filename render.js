const video = document.getElementById('video');
const emotionDisplay = document.getElementById('emotionDisplay');

async function setupCamera() {
  try {
    console.log('Requesting camera access...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('Camera access granted.');
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            video.play();
            resolve(video);
        };
    });
  } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access the webcam. Please check your camera settings and permissions.');
  }
}

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
    await faceapi.nets.faceExpressionNet.loadFromUri('./models');
}

async function detectEmotion() {
    const detectionOptions = new faceapi.TinyFaceDetectorOptions();
    
    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, detectionOptions).withFaceExpressions();
        if (detections && detections.expressions) {
            const emotion = Object.keys(detections.expressions).reduce((a, b) => 
                detections.expressions[a] > detections.expressions[b] ? a : b
            );
            emotionDisplay.innerText = `Detected Emotion: ${emotion}`;
            await window.electronAPI.addMusicToPlaylist(emotion);
        }
    }, 3000);
}

document.getElementById('detectEmotion').addEventListener('click', async () => {
    await loadModels();
    await setupCamera();
    detectEmotion();
});