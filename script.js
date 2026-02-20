// 🎵 MUSIC CONTROL
const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");
let musicPlaying = false;

// start music when user clicks start button
startBtn.addEventListener("click", async () => {
  try {
    await bgm.play();
    bgm.volume = 0.4; // soft romantic volume
    musicPlaying = true;
    musicToggle.textContent = "🔊";
  } catch (e) {
    console.log("Autoplay blocked until interaction");
  }
});

// toggle button
musicToggle.addEventListener("click", () => {
  if (musicPlaying) {
    bgm.pause();
    musicToggle.textContent = "🔇";
  } else {
    bgm.play();
    musicToggle.textContent = "🔊";
  }
  musicPlaying = !musicPlaying;
});
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const bgm = document.getElementById("bgm");
const captureBtn = document.getElementById("captureBtn");

let kissCount = 0;
const kissCounterEl = document.getElementById("kissCounter");

/* 🎀 start */
startBtn.onclick = async () => {
startScreen.style.display = "none";
bgm.volume = 0;
bgm.play().catch(()=>{});
fadeMusicIn();
captureBtn.style.display = "block";

await startCamera();
spawnBalloons();
spawnSanrioChars();
};

/* 🎵 music fade */
function fadeMusicIn() {
let v = 0;
const int = setInterval(() => {
v += 0.05;
bgm.volume = Math.min(v, 0.6);
if (v >= 0.6) clearInterval(int);
}, 200);
}

/* 🎥 camera */
async function startCamera() {
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
video.srcObject = stream;
initFaceMesh();
}

/* 💖 heart + counter */
function createHeart(x, y) {
kissCount++;
kissCounterEl.textContent = "💋 Kisses: " + kissCount;

const h = document.createElement("div");
h.className = "heart";
h.innerHTML = ["💖","💗","💘"][Math.floor(Math.random()*3)];
h.style.left = x + "px";
h.style.top = y + "px";
document.body.appendChild(h);

for (let i = 0; i < 5; i++) {
const s = document.createElement("div");
s.className = "sparkle";
s.innerHTML = ["✨","💫","⭐"][Math.floor(Math.random()*3)];
s.style.left = x + (Math.random()*50-25) + "px";
s.style.top = y + (Math.random()*30-15) + "px";
document.body.appendChild(s);
setTimeout(()=>s.remove(),1100);
}

setTimeout(()=>h.remove(),2200);
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

/* 🐱 sanrio characters */
function spawnSanrioChars() {
const gifs = [
"https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
"https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
"https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif"
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

/* 🧠 face mesh */
function initFaceMesh() {
const faceMesh = new FaceMesh({
locateFile: file =>
`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
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

```
const lm = results.multiFaceLandmarks[0];

const leftLip = lm[61];
const rightLip = lm[291];
const topLip = lm[13];
const bottomLip = lm[14];

const mouthWidth = Math.abs(leftLip.x - rightLip.x);
const mouthHeight = Math.abs(topLip.y - bottomLip.y);

const lipCenterX =
  (lm[13].x + lm[14].x + lm[61].x + lm[291].x) / 4;

const lipCenterY =
  (lm[13].y + lm[14].y + lm[61].y + lm[291].y) / 4;

const x = (1 - lipCenterX) * window.innerWidth;
const y = lipCenterY * window.innerHeight;

const now = Date.now();

const isPucker =
  mouthWidth < 0.055 &&
  mouthHeight > 0.018 &&
  mouthHeight < 0.065;

if (isPucker && now - last > 1200) {
  last = now;
  createHeart(x, y);
}
```

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
