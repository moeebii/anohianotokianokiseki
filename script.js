const video = document.getElementById('video');
const textElement = document.getElementById('text');
const texts = ["text 1", "text 2", "text 3", "text 4"];
let currentTextIndex = 0;
let blinkTimeout;

async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
        video.addEventListener('loadeddata', () => {
            onPlay();
        });
    } catch (error) {
        console.log("Error accessing the webcam:", error);
    }
}

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
}

function changeText() {
    currentTextIndex = (currentTextIndex + 1) % texts.length;
    textElement.innerText = texts[currentTextIndex];
}

function isBlink(landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);

    const earAvg = (leftEAR + rightEAR) / 2;

    return leftEAR < 0.285 && rightEAR < 0.31;
}

function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function calculateEAR(eye) {
    const vertical1 = calculateDistance(eye[1], eye[5]);
    const vertical2 = calculateDistance(eye[2], eye[4]);
    const horizontal = calculateDistance(eye[0], eye[3]);

    return (vertical1 + vertical2) / (2.0 * horizontal);
}

async function onPlay() {
    const options = new faceapi.TinyFaceDetectorOptions();

    const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks();

    if (result) {
        const landmarks = result.landmarks;
        if (isBlink(landmarks)) {
            if (blinkTimeout) clearTimeout(blinkTimeout);
            blinkTimeout = setTimeout(() => {
                changeText();
            }, 300);
        }
    }

    requestAnimationFrame(onPlay);
}

video.addEventListener('play', () => {
    onPlay();
});

(async function init() {
    await loadModels();
    await startVideo();
})();