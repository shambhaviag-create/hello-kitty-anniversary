const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");
const captureBtn = document.getElementById("captureBtn");
const kissCounterEl = document.getElementById("kissCounter");
const kittyFrame = document.getElementById("kittyFrame");

let kissCount = 0;
let musicPlaying = false;

/* 🎵 toggle */
musicToggle.onclick = () => {
  if (musicPlaying) {
    bgm.pause();
    musicToggle.textContent = "🔇";
  } else {
    bgm.play().catch(()=>{});
    musicToggle.textContent = "🔊";
  }
  musicPlaying = !musicPlaying;
};

/* 🎀 start */
startBtn.onclick = async () => {
  startScreen.style.display = "none";

  bgm.volume = 0.4;
  bgm.play().catch(()=>{});
  musicPlaying = true;
  musicToggle.textContent = "🔊";

  captureBtn.style.display = "block";

  await startCamera();
  spawnBalloons();
  spawnSanrioChars();
};

/* 🎥 camera */
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.style.display = "block";
  initFaceMesh();
}

/* ✨ sparkles explosion */
function createSparkles(x, y) {
  // Spawn 8 little sparkles in a circle
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.innerHTML = "✨";
    // Center the spawn point
    s.style.left = (x - 12) + "px"; 
    s.style.top = (y - 12) + "px";
    
    // Create random directions for the explosion
    const tx = (Math.random() - 0.5) * 200 + "px";
    const ty = (Math.random() - 0.5) * 200 + "px";
    s.style.setProperty('--tx', tx);
    s.style.setProperty('--ty', ty);
    
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

/* 💖 big red heart */
function createHeart(x, y) {
  kissCount++;
  kissCounterEl.textContent = "💋 Kisses: " + kissCount;

  const h = document.createElement("div");
  h.className = "big-red-heart";
  h.innerHTML = "❤️";
  
  // Subtracting 50 centers the 100px heart over the lips perfectly
  h.style.left = (x - 50) + "px";
  h.style.top = (y - 50) + "px";
  
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 2200);

  // Trigger the sparkles at the exact same time!
  createSparkles(x, y);
}

/* 🧠 FACE DETECT & AR FILTER */
function initFaceMesh() {
  const faceMesh = new FaceMesh({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  let last = 0;

  faceMesh.onResults(results => {
    if (!results.multiFaceLandmarks.length) {
      kittyFrame.style.display = "none";
      return;
    }

    const lm = results.multiFaceLandmarks[0];

    const leftLip = lm[61];
    const rightLip = lm[291];
    const leftCheek = lm[234];
    const rightCheek = lm[454];
    const nose = lm[1]; 

    // 1. KISS DETECTION MATH
    const mouthWidth = Math.sqrt(Math.pow(leftLip.x - rightLip.x, 2) + Math.pow(leftLip.y - rightLip.y, 2));
    const faceWidth = Math.sqrt(Math.pow(leftCheek.x - rightCheek.x, 2) + Math.pow(leftCheek.y - rightCheek.y, 2));

    const puckerRatio = mouthWidth / faceWidth;
    
    // If the mouth width drops below 28% of the face width, it's a pucker!
    const isPucker = puckerRatio < 0.28; 

    // 2. FIND LIP CENTER
    const lipCenterX = (leftLip.x + rightLip.x) / 2;
    const lipCenterY = (leftLip.y + rightLip.y) / 2;
    const heartX = (1 - lipCenterX) * window.innerWidth;
    const heartY = lipCenterY * window.innerHeight;

    const now = Date.now();
    if (isPucker && now - last > 1000) {
      last = now; // 1 second cooldown
      createHeart(heartX, heartY);
    }

    // 3. AR FILTER TRACKING
    const faceX = (1 - nose.x) * window.innerWidth;
    const faceY = nose.y * window.innerHeight;

    // Scale the blush/bow based on how close they are to the camera
    const scale = faceWidth * 2.5; 

    kittyFrame.style.display = "block";
    kittyFrame.style.left = faceX + "px";
    kittyFrame.style.top = faceY + "px";
    kittyFrame.style.transform = `translate(-50%, -50%) scale(${scale})`;
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await faceMesh.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
}

/* 🎈 balloons */
function spawnBalloons() {
  setInterval(() => {
    const b = document.createElement("div");
    b.className = "balloon";
    b.innerHTML = ["🎈","🎀","💗"][Math.floor(Math.random()*3)];
    b.style.left = Math.random()*100 + "vw";
    b.style.animationDuration = 6 + Math.random()*5 + "s";
    document.body.appendChild(b);
    setTimeout(()=>b.remove(), 12000);
  }, 900);
}

/* 🐱 sanrio */
function spawnSanrioChars() {
  const gifs = [
    "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
  ];

  setInterval(() => {
    const img = document.createElement("img");
    img.className = "sanrioChar";
    img.src = gifs[Math.floor(Math.random()*gifs.length)];
    img.style.left = Math.random()*100 + "vw";
    img.style.animationDuration = 10 + Math.random()*6 + "s";
    document.body.appendChild(img);
    setTimeout(()=>img.remove(), 16000);
  }, 3500);
}

/* 📸 capture */
captureBtn.onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  const link = document.createElement("a");
  link.download = "memory.png";
  link.href = canvas.toDataURL();
  link.click();
};
