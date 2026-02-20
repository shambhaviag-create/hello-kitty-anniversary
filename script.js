const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");
const captureBtn = document.getElementById("captureBtn");
const kissCounterEl = document.getElementById("kissCounter");

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

/* 💖 heart */
function createHeart(x, y) {
  kissCount++;
  kissCounterEl.textContent = "💋 Kisses: " + kissCount;

  const h = document.createElement("div");
  h.className = "heart";
  h.innerHTML = ["💖","💗","💘"][Math.floor(Math.random()*3)];
  h.style.left = x + "px";
  h.style.top = y + "px";
  document.body.appendChild(h);

  setTimeout(()=>h.remove(),2200);
}

/* 🧠 FACE DETECT — IMPROVED */
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
    if (!results.multiFaceLandmarks.length) return;

    const lm = results.multiFaceLandmarks[0];

    const leftLip = lm[61];
    const rightLip = lm[291];
    const topLip = lm[13];
    const bottomLip = lm[14];

    const mouthWidth = Math.abs(leftLip.x - rightLip.x);
    const mouthHeight = Math.abs(topLip.y - bottomLip.y);

    const ratio = mouthHeight / mouthWidth;

    const lipCenterX =
      (lm[13].x + lm[14].x + lm[61].x + lm[291].x) / 4;

    const lipCenterY =
      (lm[13].y + lm[14].y + lm[61].y + lm[291].y) / 4;

    const x = (1 - lipCenterX) * window.innerWidth;
    const y = lipCenterY * window.innerHeight;

    const now = Date.now();

    const isPucker =
      ratio > 0.55 &&
      mouthWidth < 0.08;

    if (isPucker && now - last > 1200) {
      last = now;
      createHeart(x, y);
    }
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
    setTimeout(()=>b.remove(),12000);
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
    setTimeout(()=>img.remove(),16000);
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
