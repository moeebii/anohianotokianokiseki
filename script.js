// Ensure face-api.js is loaded and initialized before using it
window.onload = () => {
    // Reference to the video element
    const video = document.getElementById('video');
    
    // Set up the camera and start the video stream
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
      } catch (error) {
        console.error("Error accessing the camera: ", error);
      }
    }
  
    // Call the blink detection function periodically
    let blinkTimeout;
    function detectBlink() {
      // Ensure face-api.js is loaded
      if (typeof faceapi === 'undefined') {
        console.log("face-api.js is not loaded yet");
        return;
      }
  
      // Detect faces using face-api.js
      faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .then((detections) => {
          if (detections.length > 0) {
            // Assuming first face is the main one
            const face = detections[0];
            const { leftEye, rightEye } = face.landmarks;
  
            // Check if the eyes are closed (this is an approximation)
            const leftEyeClosed = leftEye[1].y - leftEye[2].y < 10; // Arbitrary value for detecting closed eye
            const rightEyeClosed = rightEye[1].y - rightEye[2].y < 10; // Arbitrary value for detecting closed eye
  
            if (leftEyeClosed && rightEyeClosed) {
              // If both eyes are closed, trigger blink action
              changeText();
            }
          }
        })
        .catch((err) => {
          console.error("Face detection failed:", err);
        });
    }
  
    // Function to change text when blink is detected
    function changeText() {
      const textElement = document.getElementById('displayText');
      textElement.innerText = "Blink detected!";
  
      // Reset text after 2 seconds
      clearTimeout(blinkTimeout);
      blinkTimeout = setTimeout(() => {
        textElement.innerText = "Welcome!";
      }, 2000);
    }
  
    // Start the camera and detect blink periodically
    startCamera();
    setInterval(detectBlink, 100);  // Run blink detection every 100ms
  };
  