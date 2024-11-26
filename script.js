import * as faceLandmarksDetection from "https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection";
import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl";

if (location.protocol !== "https:") {
    alert("This application requires HTTPS to access the camera.");
    throw new Error("Insecure context: Camera access requires HTTPS.");
  }

  const video = document.createElement("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const displayText = document.getElementById("displayText");

const texts = ["Hello!", "You blinked!", "Nice to see you!", "Keep blinking!"];
let currentTextIndex = 0;
let blinkState = false;

async function setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      video.srcObject = stream;
      await video.play();
      return video;
    } catch (err) {
      alert("Error accessing the camera: " + err.message);
      console.error(err);
      throw err;
    }
  }
  
  // Calculate Eye Aspect Ratio (EAR) for blink detection
  function calculateEyeAspectRatio(landmarks, leftEyeIndices, rightEyeIndices) {
    const calculateEAR = (eyeIndices) => {
      const height1 =
        Math.abs(landmarks[eyeIndices[1]].y - landmarks[eyeIndices[5]].y) +
        Math.abs(landmarks[eyeIndices[2]].y - landmarks[eyeIndices[4]].y);
      const width = Math.abs(landmarks[eyeIndices[0]].x - landmarks[eyeIndices[3]].x);
      return height1 / (2 * width);
    };
  
    const leftEAR = calculateEAR(leftEyeIndices);
    const rightEAR = calculateEAR(rightEyeIndices);
    return (leftEAR + rightEAR) / 2;
  }
  
  // Blink detection function
  async function detectBlinks() {
    const model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
  
    const leftEyeIndices = [33, 160, 158, 133, 153, 144];
    const rightEyeIndices = [362, 385, 387, 263, 373, 380];
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const BLINK_THRESHOLD = 0.25; // EAR threshold for detecting a blink
  
    async function analyzeFrame() {
      const predictions = await model.estimateFaces({
        input: video,
      });
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      if (predictions.length > 0) {
        const landmarks = predictions[0].annotations;
  
        const ear = calculateEyeAspectRatio(
          landmarks,
          leftEyeIndices,
          rightEyeIndices
        );
  
        if (ear < BLINK_THRESHOLD && !blinkState) {
          blinkState = true;
          changeText();
        } else if (ear >= BLINK_THRESHOLD) {
          blinkState = false;
        }
      }
  
      requestAnimationFrame(analyzeFrame);
    }
  
    analyzeFrame();
  }
  
  // Change text when a blink is detected
  function changeText() {
    currentTextIndex = (currentTextIndex + 1) % texts.length;
    displayText.textContent = texts[currentTextIndex];
  }
  
  // Main function
  async function main() {
    await setupCamera();
    detectBlinks();
  }
  
  main();