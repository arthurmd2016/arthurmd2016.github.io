(() => {
  "use strict";

  const W = 640;
  const H = 800;
  const GROUND_Y = 620;
  const MOVES_PER_LEVEL = 4;

  const POINTS = 100;

  const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
  const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
  const VISION_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

  const canvas = document.getElementById("danceCanvas");
  let ctx = canvas.getContext("2d");
  const video = document.getElementById("cameraVideo");
  const startButton = document.getElementById("startButton");
  const keyboardButton = document.getElementById("keyboardButton");
  const danceButton = document.getElementById("danceButton");
  const stopButton = document.getElementById("stopButton");
  const downloadButton = document.getElementById("downloadButton");
  const statusEl = document.getElementById("status");
  const stageGallery = document.getElementById("stageGallery");
  const ageFilter = document.getElementById("ageFilter");

  /* Troca temporariamente o contexto de desenho (usado para as miniaturas dos cenários) */
  function withContext(targetCtx, fn) {
    const previous = ctx;
    ctx = targetCtx;
    try {
      fn();
    } finally {
      ctx = previous;
    }
  }

  /* ---------- Utilidades ---------- */

  const rnd = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  function tiles(spacing, scroll, fn) {
    const first = Math.floor(scroll / spacing) - 1;
    const count = Math.ceil(W / spacing) + 3;
    for (let i = first; i < first + count; i += 1) fn(i * spacing - scroll, i);
  }

  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

  function circle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function triangle(x1, y1, x2, y2, x3, y3, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }

  function setStatus(text) { statusEl.textContent = text; }

  /* ---------- Temas, cenários e personagens ---------- */

  const THEMES = [
    {
      name: "Cidade", emoji: "🏙️", ageGroup: "11-17", sky: ["#17254c", "#e98791", "#ffc982"], ground: "#3d465d",
      bpm: 112, scale: [196, 220, 261.63, 293.66, 329.63, 392],
      character: { name: "Arthur Cidadão", skin: "#edbd91", shirt: "#ed854a", pants: "#283b70", shoes: "#262538", hair: "#392638", head: "hair" },
      deco(t, s) {
        circle(500, 150, 50, "#fff2ac");
        tiles(100, s * 0.5, (x, i) => rect(x, GROUND_Y - (120 + rnd(i) * 140), 80, 140 + rnd(i) * 140, "#2a3560"));
        tiles(130, s, (x, i) => {
          const h = 160 + rnd(i + 50) * 170;
          rect(x, GROUND_Y - h, 100, h, "#34416b");
          for (let r = 0; r < Math.floor(h / 38); r += 1) {
            for (let c = 0; c < 3; c += 1) {
              ctx.globalAlpha = 0.45 + 0.4 * Math.abs(Math.sin(t / 900 + i + r + c));
              rect(x + 12 + c * 30, GROUND_Y - h + 14 + r * 38, 14, 20, "#ffd47a");
            }
          }
          ctx.globalAlpha = 1;
        });
      }
    },
    {
      name: "Praia", emoji: "🏖️", ageGroup: "6-8", sky: ["#58b8f0", "#a9e4f7", "#fff1c0"], ground: "#f2d08a",
      bpm: 100, scale: [261.63, 293.66, 329.63, 392, 440, 523.25],
      character: { name: "Surfista", skin: "#d9a066", shirt: "#18b6b0", pants: "#f2c230", shoes: "#d9a066", hair: "#f4d35e", head: "sunhat" },
      deco(t, s) {
        circle(500, 160, 55, "#fff3a0");
        rect(0, 470, W, 150, "#1fa3c9");
        ctx.strokeStyle = "#ffffff99";
        ctx.lineWidth = 4;
        tiles(70, s * 0.3, (x, i) => {
          ctx.beginPath();
          ctx.moveTo(x, 500 + (i % 3) * 34);
          ctx.quadraticCurveTo(x + 18, 490 + (i % 3) * 34 + Math.sin(t / 400 + i) * 4, x + 36, 500 + (i % 3) * 34);
          ctx.stroke();
        });
        tiles(280, s, (x, i) => {
          ctx.strokeStyle = "#7a4b2a";
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(x, GROUND_Y);
          ctx.quadraticCurveTo(x + 18, 560, x + 10, 470);
          ctx.stroke();
          for (let k = 0; k < 5; k += 1) {
            const a = -2.6 + k * 0.55;
            ctx.strokeStyle = "#2f9d4f";
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(x + 10, 470);
            ctx.quadraticCurveTo(x + 10 + Math.cos(a) * 40, 450 + Math.sin(a) * 30, x + 10 + Math.cos(a) * 70, 480 + Math.sin(a) * 15);
            ctx.stroke();
          }
        });
      }
    },
    {
      name: "Floresta", emoji: "🌲", ageGroup: "6-8", sky: ["#2d6a4f", "#74c69d", "#d8f3dc"], ground: "#2f6f3e",
      bpm: 96, scale: [220, 246.94, 277.18, 329.63, 370, 440],
      character: { name: "Explorador", skin: "#e0ac7b", shirt: "#4c9a2a", pants: "#7b5a3a", shoes: "#3b2a1c", hair: "#5a3b22", head: "cap" },
      deco(t, s) {
        tiles(90, s * 0.5, (x, i) => triangle(x, GROUND_Y, x + 45, GROUND_Y - (180 + rnd(i) * 90), x + 90, GROUND_Y, "#1b4332"));
        tiles(140, s, (x, i) => {
          rect(x + 52, GROUND_Y - 50, 22, 50, "#6b4423");
          triangle(x, GROUND_Y - 40, x + 63, GROUND_Y - 150 - rnd(i) * 40, x + 126, GROUND_Y - 40, "#2d6a4f");
          triangle(x + 14, GROUND_Y - 110, x + 63, GROUND_Y - 210 - rnd(i) * 40, x + 112, GROUND_Y - 110, "#40916c");
        });
      }
    },
    {
      name: "Espaço", emoji: "🚀", ageGroup: "6-8", sky: ["#05020f", "#150b3a", "#2a1457"], ground: "#5a5a6e",
      bpm: 120, scale: [220, 261.63, 329.63, 392, 493.88, 587.33],
      character: { name: "Astronauta", skin: "#edbd91", shirt: "#f2f2f7", pants: "#d6d6e4", shoes: "#8d8da6", hair: "#392638", head: "helmet" },
      deco(t, s) {
        for (let i = 0; i < 70; i += 1) {
          const x = (((rnd(i) * W - s * 0.12 * (1 + rnd(i + 9))) % W) + W) % W;
          ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 700 + i));
          circle(x, rnd(i + 1) * 520, 1 + rnd(i + 2) * 2, "#fff");
        }
        ctx.globalAlpha = 1;
        circle(150, 190, 62, "#f4cb92");
        ctx.strokeStyle = "#f2c249";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(150, 190, 100, 20, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        circle(520, 330, 28, "#7dd3fc");
        tiles(170, s, (x, i) => {
          ctx.fillStyle = "#4a4a5e";
          ctx.beginPath();
          ctx.ellipse(x + 60, GROUND_Y + 22 + (i % 2) * 20, 32, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },
    {
      name: "Neve", emoji: "⛄", ageGroup: "6-8", sky: ["#5e7fb5", "#b7d3f2", "#eaf5ff"], ground: "#eef6ff",
      bpm: 92, scale: [261.63, 311.13, 349.23, 392, 466.16, 523.25],
      character: { name: "Esquimó", skin: "#edbd91", shirt: "#2f80ed", pants: "#1f4e99", shoes: "#2a2a3c", hair: "#392638", head: "beanie" },
      deco(t, s) {
        tiles(150, s * 0.7, (x, i) => {
          triangle(x, GROUND_Y, x + 60, GROUND_Y - (190 + rnd(i) * 80), x + 120, GROUND_Y, "#2f6b57");
          triangle(x + 30, GROUND_Y - 120 - rnd(i) * 80, x + 60, GROUND_Y - (190 + rnd(i) * 80), x + 90, GROUND_Y - 120 - rnd(i) * 80, "#ffffff");
        });
        for (let i = 0; i < 70; i += 1) {
          const y = (rnd(i + 3) * H + t * 0.05 * (0.5 + rnd(i))) % H;
          const x = (((rnd(i) * W + Math.sin(t / 700 + i) * 20 - s * 0.2) % W) + W) % W;
          circle(x, y, 2 + rnd(i + 7) * 2, "#fff");
        }
      }
    },
    {
      name: "Deserto", emoji: "🏜️", ageGroup: "6-8", sky: ["#f4a259", "#f7c873", "#ffe8b0"], ground: "#d9a35c",
      bpm: 104, scale: [196, 207.65, 246.94, 261.63, 311.13, 392],
      character: { name: "Beduíno", skin: "#c68b59", shirt: "#f2e2c4", pants: "#b8895a", shoes: "#5a3b22", hair: "#2a1a10", head: "turban" },
      deco(t, s) {
        circle(480, 170, 62, "#fff1b8");
        tiles(260, s * 0.5, (x, i) => {
          ctx.fillStyle = i % 2 ? "#e6b16a" : "#e0a85a";
          ctx.beginPath();
          ctx.ellipse(x + 130, GROUND_Y + 30, 170, 90 + rnd(i) * 40, 0, Math.PI, Math.PI * 2);
          ctx.fill();
        });
        tiles(320, s, (x) => {
          rect(x + 40, GROUND_Y - 120, 22, 120, "#3d8b4f");
          rect(x + 10, GROUND_Y - 90, 14, 40, "#3d8b4f");
          rect(x + 10, GROUND_Y - 90, 40, 12, "#3d8b4f");
          rect(x + 78, GROUND_Y - 70, 14, 36, "#3d8b4f");
          rect(x + 56, GROUND_Y - 70, 36, 12, "#3d8b4f");
        });
      }
    },
    {
      name: "Fundo do mar", emoji: "🐠", ageGroup: "6-8", sky: ["#0a4d8c", "#0f78b8", "#1aa6c9"], ground: "#c9b27c",
      bpm: 90, scale: [220, 261.63, 293.66, 349.23, 392, 440],
      character: { name: "Mergulhador", skin: "#edbd91", shirt: "#1f3b57", pants: "#10263a", shoes: "#f2c230", hair: "#392638", head: "goggles" },
      deco(t, s) {
        for (let k = 0; k < 4; k += 1) {
          ctx.fillStyle = "#ffffff12";
          ctx.beginPath();
          ctx.moveTo(100 + k * 150, 0);
          ctx.lineTo(160 + k * 150, 0);
          ctx.lineTo(60 + k * 150, GROUND_Y);
          ctx.lineTo(0 + k * 150, GROUND_Y);
          ctx.closePath();
          ctx.fill();
        }
        tiles(100, s, (x, i) => {
          ctx.strokeStyle = "#2f9d6b";
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(x, GROUND_Y);
          for (let y = 0; y < 100 + rnd(i) * 80; y += 20) {
            ctx.lineTo(x + Math.sin(t / 500 + y / 20 + i) * 10, GROUND_Y - y);
          }
          ctx.stroke();
        });
        ctx.strokeStyle = "#ffffffaa";
        ctx.lineWidth = 2;
        for (let i = 0; i < 25; i += 1) {
          const y = H - ((t * 0.03 * (0.4 + rnd(i)) + rnd(i + 4) * H) % H);
          ctx.beginPath();
          ctx.arc(rnd(i) * W, y, 3 + rnd(i + 2) * 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let k = 0; k < 3; k += 1) {
          const x = (t * 0.06 * (1 + k) + k * 250 - s * 0.3) % (W + 200) - 100;
          const y = 200 + k * 90;
          ctx.fillStyle = ["#ff9f1c", "#ff5d8f", "#ffd166"][k];
          ctx.beginPath();
          ctx.ellipse(x, y, 24, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          triangle(x - 20, y, x - 40, y - 12, x - 40, y + 12, ctx.fillStyle);
        }
      }
    },
    {
      name: "Parque de diversões", emoji: "🎡", ageGroup: "9-10", sky: ["#3a1c71", "#d76d77", "#ffaf7b"], ground: "#5b4a8a",
      bpm: 124, scale: [261.63, 329.63, 392, 440, 523.25, 587.33],
      character: { name: "Palhaço", skin: "#f1c7a0", shirt: "#e63946", pants: "#ffd23f", shoes: "#2a9d8f", hair: "#ff6b35", head: "clown" },
      deco(t, s) {
        const cx = 460 - (s * 0.15) % 40;
        const angle = t / 3000;
        ctx.strokeStyle = "#fff4";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, 380, 150, 0, Math.PI * 2);
        ctx.stroke();
        for (let k = 0; k < 8; k += 1) {
          const a = angle + (k * Math.PI) / 4;
          const px = cx + Math.cos(a) * 150;
          const py = 380 + Math.sin(a) * 150;
          ctx.beginPath();
          ctx.moveTo(cx, 380);
          ctx.lineTo(px, py);
          ctx.stroke();
          circle(px, py, 15, ["#ff595e", "#ffca3a", "#8ac926", "#1982c4"][k % 4]);
        }
        rect(cx - 8, 380, 16, GROUND_Y - 380, "#fff3");
        tiles(240, s, (x) => {
          rect(x + 20, GROUND_Y - 90, 140, 90, "#fff3");
          triangle(x, GROUND_Y - 90, x + 90, GROUND_Y - 170, x + 180, GROUND_Y - 90, "#e63946");
          triangle(x + 45, GROUND_Y - 130, x + 90, GROUND_Y - 170, x + 135, GROUND_Y - 130, "#fff");
        });
      }
    },
    {
      name: "Castelo", emoji: "🏰", ageGroup: "9-10", sky: ["#2a2f6b", "#6c5ba0", "#c9a0dc"], ground: "#5a7a4a",
      bpm: 88, scale: [196, 233.08, 261.63, 311.13, 349.23, 392],
      character: { name: "Cavaleiro", skin: "#edbd91", shirt: "#9aa5b1", pants: "#6b7785", shoes: "#3c4651", hair: "#392638", head: "knight" },
      deco(t, s) {
        circle(150, 150, 42, "#fff6c9");
        rect(0, 470, W, 150, "#6a6f8f");
        tiles(40, s * 0.6, (x) => rect(x, 450, 24, 22, "#6a6f8f"));
        tiles(260, s, (x, i) => {
          rect(x + 30, 330, 90, 290, "#8087a8");
          tiles(30, 0, (cx) => { if (cx < 90) rect(x + 30 + cx, 312, 18, 20, "#8087a8"); });
          triangle(x + 24, 330, x + 75, 240, x + 126, 330, "#7b2d5b");
          rect(x + 74, 200, 3, 40, "#ddd");
          triangle(x + 77, 200, x + 105, 210, x + 77, 220, "#ff595e");
          rect(x + 60, 400 + (i % 2) * 20, 30, 50, "#3b2a4f");
        });
      }
    },
    {
      name: "Vulcão", emoji: "🌋", ageGroup: "11-17", sky: ["#2b0a0a", "#7a1f10", "#f26a2e"], ground: "#2b1d1d",
      bpm: 128, scale: [164.81, 196, 220, 246.94, 293.66, 329.63],
      character: { name: "Mago do Vulcão", skin: "#e0ac7b", shirt: "#b3261e", pants: "#7a1f10", shoes: "#2b1d1d", hair: "#f2f2f2", head: "wizard" },
      deco(t, s) {
        tiles(300, s * 0.4, (x, i) => triangle(x, GROUND_Y, x + 150, GROUND_Y - (160 + rnd(i) * 70), x + 300, GROUND_Y, "#3a2420"));
        const mx = 320 - (s * 0.2) % 80;
        triangle(mx - 200, GROUND_Y, mx, 290, mx + 200, GROUND_Y, "#4a2a22");
        const glow = ctx.createRadialGradient(mx, 290, 5, mx, 290, 120);
        glow.addColorStop(0, "#ffd166");
        glow.addColorStop(1, "#ff450000");
        ctx.fillStyle = glow;
        ctx.fillRect(mx - 130, 190, 260, 200);
        ctx.strokeStyle = "#ff7a18";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(mx, 292);
        ctx.lineTo(mx - 30, 420);
        ctx.lineTo(mx - 60, GROUND_Y);
        ctx.stroke();
        for (let i = 0; i < 25; i += 1) {
          const y = 300 - ((t * 0.08 * (0.5 + rnd(i)) + rnd(i + 5) * 300) % 300);
          circle(mx + Math.sin(t / 600 + i) * 70 + (rnd(i) - 0.5) * 100, y + 120, 3, "#ffb703");
        }
      }
    },
    {
      name: "Patinação", emoji: "🛼", ageGroup: "9-10", sky: ["#2c1250", "#8e44ad", "#ff9a76"], ground: "#3a3a4d",
      bpm: 118, scale: [293.66, 329.63, 349.23, 392, 440, 493.88],
      character: { name: "Patinadora Estrela", skin: "#e3b58a", shirt: "#ff4f9a", pants: "#2c3e91", shoes: "#141424", hair: "#2d2d2d", head: "sporthelmet" },
      deco(t, s) {
        ctx.strokeStyle = "#ffffff22";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(320, GROUND_Y + 60, 340, 70, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        tiles(220, s * 0.6, (x, i) => {
          ctx.fillStyle = i % 2 ? "#5b2d8e" : "#7a3db0";
          ctx.beginPath();
          ctx.moveTo(x, GROUND_Y);
          ctx.quadraticCurveTo(x + 60, GROUND_Y - 120, x + 140, GROUND_Y - 120);
          ctx.lineTo(x + 140, GROUND_Y);
          ctx.closePath();
          ctx.fill();
        });
        tiles(90, s, (x, i) => {
          circle(x + 30, GROUND_Y - 14, 10, i % 2 ? "#ff9a3c" : "#ff5a7a");
        });
        for (let i = 0; i < 10; i += 1) {
          ctx.fillStyle = "#ffffff18";
          ctx.font = "bold 46px Arial";
          ctx.fillText("★", (rnd(i) * W + s * 0.1 * i) % W, 80 + (i % 3) * 60);
        }
      }
    },
    {
      name: "Estúdio Hip-Hop", emoji: "🎤", ageGroup: "11-17", sky: ["#0d0d12", "#1b1033", "#ff2e63"], ground: "#15151d",
      bpm: 128, scale: [220, 233.08, 277.18, 311.13, 349.23, 415.3],
      character: { name: "MC Teen", skin: "#c68b59", shirt: "#141414", pants: "#ff2e63", shoes: "#f2f2f2", hair: "#141414", head: "cap" },
      deco(t, s) {
        ctx.strokeStyle = "#ffffff14";
        ctx.lineWidth = 2;
        tiles(70, 0, (x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND_Y); ctx.stroke(); });
        for (let k = 0; k < 3; k += 1) {
          const x = 140 + k * 200 - (s * 0.1) % 200;
          const glow = ctx.createRadialGradient(x, 0, 10, x, 420, 220);
          glow.addColorStop(0, "#ff2e6355");
          glow.addColorStop(1, "#ff2e6300");
          ctx.fillStyle = glow;
          ctx.fillRect(x - 220, 0, 440, 500);
        }
        tiles(260, s * 0.5, (x, i) => {
          ctx.globalAlpha = 0.5 + 0.4 * Math.abs(Math.sin(t / 500 + i));
          circle(x + 40, 140 + (i % 2) * 60, 26, "#ffdf3c");
          ctx.globalAlpha = 1;
        });
      }
    },
    {
      name: "Lounge Adulto", emoji: "🌆", ageGroup: "18-60", sky: ["#0b1026", "#232a5c", "#5c6bc0"], ground: "#1a1f3d",
      paceMultiplier: 1.25,
      bpm: 100, scale: [220, 246.94, 261.63, 293.66, 329.63, 369.99],
      character: { name: "Dançarino Chique", skin: "#edbd91", shirt: "#20203a", pants: "#111122", shoes: "#111", hair: "#2a1a10", head: "hair" },
      deco(t, s) {
        tiles(90, s * 0.3, (x, i) => {
          ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t / 900 + i));
          circle(x, 60 + rnd(i) * 300, 2, "#ffe9a8");
          ctx.globalAlpha = 1;
        });
        tiles(150, s, (x, i) => {
          const h = 120 + rnd(i) * 220;
          rect(x, GROUND_Y - h, 80, h, "#161b38");
          for (let r = 0; r < Math.floor(h / 36); r += 1) {
            ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t / 800 + i + r));
            rect(x + 14, GROUND_Y - h + 10 + r * 36, 52, 16, "#ffd27a");
          }
          ctx.globalAlpha = 1;
        });
        ctx.strokeStyle = "#ffe9a888";
        ctx.lineWidth = 3;
        tiles(60, s * 0.7, (x) => { circle(x, GROUND_Y - 170, 4, "#ffe9a8"); });
      }
    },
    {
      name: "Dança Sentada", emoji: "🪑", ageGroup: "60+", moveMode: "seated", paceMultiplier: 1.6,
      sky: ["#5b3a29", "#c97b4a", "#ffd9a0"], ground: "#7a5a3a",
      bpm: 84, scale: [196, 220, 246.94, 261.63, 293.66, 329.63],
      character: { name: "Vovô Dançarino", skin: "#edbd91", shirt: "#8a5a3a", pants: "#4a3a2a", shoes: "#2a1a10", hair: "#e6e6e6", head: "hair" },
      deco(t, s) {
        circle(500, 150, 55, "#ffdf9a");
        rect(0, GROUND_Y - 30, W, 30, "#5a3f28");
        tiles(260, s * 0.5, (x, i) => {
          rect(x + 30, GROUND_Y - 70, 14, 70, "#3a2a1a");
          circle(x + 37, GROUND_Y - 90, 34, i % 2 ? "#4a7c3a" : "#5a8c4a");
        });
        tiles(150, s, (x, i) => {
          ctx.fillStyle = "#6a4a2a";
          rect(x + 10, GROUND_Y - 44, 36, 44, "#6a4a2a");
          circle(x + 28, GROUND_Y - 58, 16, i % 2 ? "#ffb347" : "#ff8c69");
        });
      }
    },
    {
      name: "Robô", emoji: "🤖", ageGroup: "final", moveMode: "finale", paceMultiplier: 1.6, sky: ["#01030a", "#0b1a2b", "#123b4f"], ground: "#0d1b24",
      bpm: 132, scale: [174.61, 196, 220, 233.08, 277.18, 329.63],
      character: { name: "Robô Dançarino", skin: "#c7d1da", shirt: "#3aa0ff", pants: "#2b3542", shoes: "#14181f", hair: "#8fa3b3", head: "robot" },
      deco(t, s) {
        ctx.strokeStyle = "#1fd1ff33";
        ctx.lineWidth = 2;
        tiles(60, s * 0.4, (x) => {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, GROUND_Y);
          ctx.stroke();
        });
        for (let row = 0; row < 6; row += 1) {
          const y = row * 110;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }
        for (let i = 0; i < 30; i += 1) {
          const x = (((rnd(i) * W - s * 0.2 * (1 + rnd(i + 3))) % W) + W) % W;
          const y = rnd(i + 1) * GROUND_Y;
          ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t / 500 + i));
          circle(x, y, 3, "#5be1ff");
        }
        ctx.globalAlpha = 1;
        tiles(150, s, (x, i) => {
          const h = 150 + rnd(i) * 60;
          rect(x + 20, GROUND_Y - h, 90, h, "#16222c");
          for (let r = 0; r < 4; r += 1) {
            rect(x + 30, GROUND_Y - h + 20 + r * 30, 70, 8, Math.sin(t / 300 + i + r) > 0 ? "#5be1ff" : "#123241");
          }
        });
      }
    }
  ];

  /* ---------- Movimentos ---------- */

  const visible = (p) => p && p.v > 0.45;

  function limbIds(side) {
    return side === "left"
      ? { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 }
      : { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 };
  }

  function punchOk(cur, side) {
    const id = limbIds(side);
    const s = cur.pts[id.shoulder];
    const w = cur.pts[id.wrist];
    if (!visible(s) || !visible(w)) return false;
    const dy = Math.abs(w.y - s.y) / cur.m.torso;
    const dx = Math.abs(w.x - s.x) / cur.m.torso;
    const forward = (s.z - w.z) / cur.m.torso;
    return dy < 0.55 && (dx > 0.85 || forward > 0.5);
  }

  function kickOk(cur, side) {
    const id = limbIds(side);
    const other = limbIds(side === "left" ? "right" : "left");
    const hip = cur.pts[id.hip];
    const knee = cur.pts[id.knee];
    const ankle = cur.pts[id.ankle];
    if (!visible(knee) && !visible(ankle)) return false;

    const kneeLift = visible(knee) ? (knee.y - hip.y) / cur.m.torso : 9;
    const ankleLift = visible(ankle) ? (ankle.y - hip.y) / cur.m.torso : 9;
    const raised = kneeLift < 0.65 || ankleLift < 1.4;

    const otherKnee = cur.pts[other.knee];
    const otherHip = cur.pts[other.hip];
    const otherDown = !visible(otherKnee) || (otherKnee.y - otherHip.y) / cur.m.torso > 0.7;
    return raised && otherDown;
  }

  /* Conta quantas vezes um histórico de valores (x de pulso, quadril, etc.) muda de
     direção, para detectar movimentos de vaivém como acenar ou balançar o quadril. */
  function oscillations(history, now, window, minDelta) {
    const points = history.filter((e) => now - e.t < window);
    if (points.length < 3) return 0;
    let direction = 0;
    let count = 0;
    let last = points[0].v;
    for (let i = 1; i < points.length; i += 1) {
      const delta = points[i].v - last;
      if (Math.abs(delta) < minDelta) continue;
      const nextDirection = Math.sign(delta);
      if (direction !== 0 && nextDirection !== direction) count += 1;
      direction = nextDirection;
      last = points[i].v;
    }
    return count;
  }

  const MOVES = {
    walkLeft: {
      label: "Ande para a esquerda ⬅️",
      check: (cur, game) => cur.m.cx - game.originX < -0.07 * cur.m.torso * 4,
      scroll: -160
    },
    walkRight: {
      label: "Ande para a direita ➡️",
      check: (cur, game) => cur.m.cx - game.originX > 0.07 * cur.m.torso * 4,
      scroll: 160
    },
    jump: {
      label: "Pule! ⬆️",
      check: (cur, game) => {
        const recent = game.hipHistory.filter((e) => game.now - e.t < 800).map((e) => e.y);
        if (!recent.length) return false;
        return (Math.max(...recent) - cur.m.hipY) / cur.m.torso > 0.12;
      }
    },
    sit: {
      label: "Sente ou agache 🪑",
      check: (cur) => {
        const values = [25, 26]
          .map((k, index) => ({ knee: cur.pts[k], hip: cur.pts[index ? 24 : 23] }))
          .filter((e) => visible(e.knee))
          .map((e) => (e.knee.y - e.hip.y) / cur.m.torso);
        if (!values.length) return false;
        return values.reduce((a, b) => a + b, 0) / values.length < 0.55;
      }
    },
    punchLeft: { label: "Soco com a mão esquerda 👊", check: (cur) => punchOk(cur, "left") },
    punchRight: { label: "Soco com a mão direita 👊", check: (cur) => punchOk(cur, "right") },
    kickLeft: { label: "Chute com o pé esquerdo 🦵", check: (cur) => kickOk(cur, "left") },
    kickRight: { label: "Chute com o pé direito 🦵", check: (cur) => kickOk(cur, "right") },
    armsUp: {
      label: "Braços para cima 🙌",
      check: (cur) => {
        const ls = cur.pts[11];
        const rs = cur.pts[12];
        const lw = cur.pts[15];
        const rw = cur.pts[16];
        if (![ls, rs, lw, rw].every(visible)) return false;
        return lw.y < ls.y - 0.15 * cur.m.torso && rw.y < rs.y - 0.15 * cur.m.torso;
      }
    },
    waveHands: {
      label: "Acene com as duas mãos 👋",
      check: (cur, game) => {
        const ls = cur.pts[11];
        const rs = cur.pts[12];
        const lw = cur.pts[15];
        const rw = cur.pts[16];
        if (![ls, rs, lw, rw].every(visible)) return false;
        const handsUp = lw.y < ls.y - 0.05 * cur.m.torso && rw.y < rs.y - 0.05 * cur.m.torso;
        if (!handsUp) return false;
        return oscillations(game.wristXHistory, game.now, 1300, 0.12 * cur.m.torso) >= 2;
      }
    },
    clap: {
      label: "Bata palmas 👏",
      check: (cur) => {
        const ls = cur.pts[11];
        const rs = cur.pts[12];
        const lh = cur.pts[23];
        const rh = cur.pts[24];
        const lw = cur.pts[15];
        const rw = cur.pts[16];
        if (![ls, rs, lh, rh, lw, rw].every(visible)) return false;
        const dist = Math.hypot(lw.x - rw.x, lw.y - rw.y) / cur.m.torso;
        const chestY = (ls.y + rs.y) / 2;
        const hipY = (lh.y + rh.y) / 2;
        const handsY = (lw.y + rw.y) / 2;
        return dist < 0.4 && handsY > chestY - 0.2 * cur.m.torso && handsY < hipY + 0.2 * cur.m.torso;
      }
    },
    spin: {
      label: "Dê um giro 🔄",
      check: (cur, game) => {
        const widths = game.shoulderWidthHistory.filter((e) => game.now - e.t < 1400).map((e) => e.v);
        if (widths.length < 4) return false;
        const maxWidth = Math.max(...widths);
        const minWidth = Math.min(...widths);
        return maxWidth > 0 && minWidth < maxWidth * 0.6;
      }
    },
    robotArms: {
      label: "Faça o robô 🤖",
      check: (cur) => {
        const ls = cur.pts[11];
        const rs = cur.pts[12];
        const le = cur.pts[13];
        const re = cur.pts[14];
        const lw = cur.pts[15];
        const rw = cur.pts[16];
        if (![ls, rs, le, re, lw, rw].every(visible)) return false;
        const elbowsLevel = Math.abs(le.y - ls.y) < 0.65 * cur.m.torso && Math.abs(re.y - rs.y) < 0.65 * cur.m.torso;
        const armsOut = Math.abs(le.x - ls.x) > 0.15 * cur.m.torso && Math.abs(re.x - rs.x) > 0.15 * cur.m.torso;
        const wristsBent = Math.abs(lw.y - le.y) > 0.15 * cur.m.torso && Math.abs(rw.y - re.y) > 0.15 * cur.m.torso;
        return elbowsLevel && armsOut && wristsBent;
      }
    }
  };

  const EASY_MOVES = ["walkLeft", "walkRight", "jump", "punchLeft", "punchRight", "armsUp"];
  const ALL_MOVES = Object.keys(MOVES).filter((key) => key !== "robotArms");
  const SEATED_MOVES = ["armsUp", "waveHands", "clap", "spin"];
  const FINALE_MOVES = ["robotArms", "armsUp", "clap", "waveHands"];

  function pickFromPool(pool, count) {
    const shuffled = [...new Set(pool)];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  function makeMoves(levelIndex, themeObj) {
    if (themeObj && themeObj.moveMode === "finale") return [...FINALE_MOVES];
    if (themeObj && themeObj.moveMode === "seated") return pickFromPool(SEATED_MOVES, MOVES_PER_LEVEL);

    const pool = ["6-8", "9-10"].includes(themeObj.ageGroup) ? EASY_MOVES : ALL_MOVES;
    return pickFromPool(pool, MOVES_PER_LEVEL);
  }

  /* Ordem fixa das fases a partir de uma fase inicial escolhida (sem sorteio) */
  /* O Robô é sempre a última fase do jogo, não entra no sorteio/rotação das demais */
  // O primeiro grupo usa somente Praia, Floresta, Espaco e Fundo do mar.
  THEMES.splice(5, 1); // Deserto
  THEMES.splice(4, 1); // Neve
  const robotTheme = THEMES.pop();
  ["6-8", "9-10", "11-17", "18-60", "60+"].forEach((age) => {
    const originals = THEMES.filter((t) => t.ageGroup === age);
    const missing = (4 - originals.length % 4) % 4;
    for (let i = 0; i < missing; i += 1) {
      const base = originals[(originals.length - 1 + i) % originals.length];
      THEMES.push({ ...base, name: `${base.name} Remix ${i + 1}`,
        sky: [base.sky[0], ["#8256ad", "#287c91", "#b46685"][i % 3], base.sky[2]],
        character: { ...base.character, shirt: ["#a66bea", "#24b6c4", "#ef8a50"][i % 3] } });
    }
  });
  const ageOrder = ["6-8", "9-10", "11-17", "18-60", "60+"];
  THEMES.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));
  THEMES.push(robotTheme);
  const LEVELS = THEMES.length;
  const ROBOT_INDEX = THEMES.length - 1;

  function buildOrder(startIndex) {
    const regular = ["6-8", "9-10", "11-17", "18-60", "60+"].flatMap((age) => THEMES.map((t, i) => t.ageGroup === age ? i : -1).filter((i) => i >= 0));
    const safeStart = regular.includes(startIndex) ? regular.indexOf(startIndex) : 0;
    const rotated = [...regular.slice(safeStart), ...regular.slice(0, safeStart)];
    return [...rotated, ROBOT_INDEX];
  }

  /* ---------- Estado do jogo ---------- */

  let selectedThemeIndex = 0;

  const game = {
    phase: "menu",
    order: buildOrder(0),
    level: 0,
    moves: [],
    moveIndex: 0,
    hits: 0,
    score: 0,
    phaseAt: 0,
    moveAt: 0,
    doneAt: 0,
    moveDone: false,
    flash: "",
    flashAt: 0,
    originX: 0,
    hipHistory: [],
    wristXHistory: [],
    shoulderWidthHistory: [],
    now: 0,
    scroll: 0,
    scrollTarget: 0,
    keyHit: false,
    useCamera: false,
    lastStars: 0
  };

  let stream = null;
  let landmarker = null;
  let lastDetect = 0;
  let camAspect = 4 / 3;
  let smoothed = null;
  let currentPose = null;
  let currentPoseAt = 0;

  let audioContext = null;
  let audioDestination = null;
  let musicTimer = null;
  let musicGain = null;
  let musicGeneration = 0;

  let recorder = null;
  let recordingChunks = [];
  let canvasStream = null;
  let downloadUrl = null;

  const theme = () => THEMES[game.order[Math.min(game.level, LEVELS - 1)]];
  const moveTime = () => Math.max(4500, 7500 - game.level * 300) * (theme().paceMultiplier || 1);

  /* ---------- Pose ---------- */

  function toGamePoints(rawPoints) {
    const next = rawPoints.map((p) => ({
      x: (1 - p.x) * camAspect,
      y: p.y,
      z: (p.z ?? 0) * camAspect,
      v: p.visibility ?? 1
    }));

    if (!smoothed || smoothed.length !== next.length) {
      smoothed = next;
    } else {
      smoothed = next.map((p, i) => ({
        x: smoothed[i].x + (p.x - smoothed[i].x) * 0.6,
        y: smoothed[i].y + (p.y - smoothed[i].y) * 0.6,
        z: smoothed[i].z + (p.z - smoothed[i].z) * 0.6,
        v: p.v
      }));
    }
    return smoothed;
  }

  function poseMetrics(pts) {
    const ls = pts[11];
    const rs = pts[12];
    const lh = pts[23];
    const rh = pts[24];
    if (![ls, rs, lh, rh].every(visible)) return null;

    const sx = (ls.x + rs.x) / 2;
    const sy = (ls.y + rs.y) / 2;
    const hx = (lh.x + rh.x) / 2;
    const hy = (lh.y + rh.y) / 2;
    return { cx: hx, hipY: hy, torso: Math.max(Math.hypot(sx - hx, sy - sy + (sy - hy)), 0.08) };
  }

  function idlePose(t) {
    const cx = 0.5 * camAspect;
    const bob = Math.sin(t / 260) * 0.01;
    const sway = Math.sin(t / 520) * 0.03;
    const make = (x, y) => ({ x: cx + x, y: y + bob, z: 0, v: 1 });
    const pts = Array.from({ length: 33 }, () => make(0, 0.5));
    pts[0] = make(0, 0.2);
    pts[11] = make(-0.1, 0.33); pts[12] = make(0.1, 0.33);
    pts[13] = make(-0.15, 0.45 + sway); pts[14] = make(0.15, 0.45 - sway);
    pts[15] = make(-0.17, 0.57 - sway); pts[16] = make(0.17, 0.57 + sway);
    pts[23] = make(-0.06, 0.58); pts[24] = make(0.06, 0.58);
    pts[25] = make(-0.08, 0.76); pts[26] = make(0.08, 0.76);
    pts[27] = make(-0.09, 0.93); pts[28] = make(0.09, 0.93);
    return pts;
  }

  /* ---------- Poses de dança usadas nas miniaturas dos cenários ---------- */

  const FLOURISH_POSES = ["wave", "armsUp", "clap", "kick", "spin"];

  function flourishPose(style, t) {
    const aspect = 1;
    const cx = 0.5 * aspect;
    const bob = Math.sin(t / 420) * 0.015;
    const make = (x, y) => ({ x: cx + x, y: y + bob, z: 0, v: 1 });
    const pts = Array.from({ length: 33 }, () => make(0, 0.5));
    pts[0] = make(0, 0.2);
    pts[23] = make(-0.06, 0.58); pts[24] = make(0.06, 0.58);
    pts[25] = make(-0.08, 0.76); pts[26] = make(0.08, 0.76);
    pts[27] = make(-0.09, 0.93); pts[28] = make(0.09, 0.93);

    if (style === "wave") {
      const sway = Math.sin(t / 240) * 0.1;
      pts[11] = make(-0.1, 0.33); pts[12] = make(0.1, 0.33);
      pts[13] = make(-0.2, 0.18); pts[14] = make(0.21 + sway, 0.3);
      pts[15] = make(-0.26 + sway, 0.03); pts[16] = make(0.3 + sway, 0.4);
    } else if (style === "armsUp") {
      const lift = 0.02 * Math.sin(t / 300);
      pts[11] = make(-0.1, 0.33); pts[12] = make(0.1, 0.33);
      pts[13] = make(-0.18, 0.1 + lift); pts[14] = make(0.18, 0.1 - lift);
      pts[15] = make(-0.2, -0.12 + lift); pts[16] = make(0.2, -0.12 - lift);
    } else if (style === "clap") {
      const pulse = 0.02 + 0.015 * Math.sin(t / 220);
      pts[11] = make(-0.1, 0.33); pts[12] = make(0.1, 0.33);
      pts[13] = make(-0.16, 0.42); pts[14] = make(0.16, 0.42);
      pts[15] = make(-pulse, 0.44); pts[16] = make(pulse, 0.44);
    } else if (style === "kick") {
      pts[11] = make(-0.1, 0.33); pts[12] = make(0.1, 0.33);
      pts[13] = make(-0.17, 0.46); pts[14] = make(0.2, 0.4);
      pts[15] = make(-0.2, 0.58); pts[16] = make(0.26, 0.5);
      pts[25] = make(-0.08, 0.76); pts[26] = make(0.22, 0.6);
      pts[27] = make(-0.09, 0.93); pts[28] = make(0.3, 0.48);
    } else if (style === "robot") {
      const tick = Math.floor(t / 400) % 2 === 0 ? 1 : -1;
      pts[11] = make(-0.1, 0.33); pts[12] = make(0.1, 0.33);
      pts[13] = make(-0.23, 0.33); pts[14] = make(0.23, 0.33);
      pts[15] = make(-0.23, 0.33 - 0.22 * tick); pts[16] = make(0.23, 0.33 + 0.22 * tick);
    } else {
      pts[11] = make(-0.06, 0.33); pts[12] = make(0.06, 0.33);
      pts[13] = make(-0.14, 0.46); pts[14] = make(0.14, 0.46);
      pts[15] = make(-0.1, 0.2); pts[16] = make(0.1, 0.2);
    }
    return pts;
  }

  function drawThumbBackground(targetCtx, themeObj, w, h) {
    const groundY = h * 0.8;
    const sky = targetCtx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, themeObj.sky[0]);
    sky.addColorStop(0.6, themeObj.sky[1]);
    sky.addColorStop(1, themeObj.sky[2]);
    targetCtx.fillStyle = sky;
    targetCtx.fillRect(0, 0, w, h);
    targetCtx.fillStyle = themeObj.ground;
    targetCtx.fillRect(0, groundY, w, h - groundY);
  }

  function renderStageThumbnails(time) {
    THEMES.forEach((themeObj, index) => {
      const thumbCanvas = themeObj.thumbCanvas;
      if (!thumbCanvas) return;
      const w = thumbCanvas.width;
      const h = thumbCanvas.height;
      const targetCtx = thumbCanvas.getContext("2d");
      drawThumbBackground(targetCtx, themeObj, w, h);
      const style = index === ROBOT_INDEX ? "robot" : FLOURISH_POSES[index % FLOURISH_POSES.length];
      const pts = flourishPose(style, time + index * 350);
      withContext(targetCtx, () => {
        drawCharacter(pts, themeObj.character, {
          aspect: 1,
          scale: w * 1.35,
          centerX: w / 2,
          centerY: h * 0.5,
          strokeScale: w / 220,
          minHeadR: w * 0.14,
          maxHeadR: w * 0.22
        });
      });
    });
  }

  const AGE_FILTERS = [
    { key: "all", label: "Todas" },
    { key: "6-8", label: "6-8 anos" },
    { key: "9-10", label: "9-10 anos" },
    { key: "11-17", label: "11-17 anos" },
    { key: "18-60", label: "18-60 anos" },
    { key: "60+", label: "60+ anos" }
  ];
  let activeAgeFilter = "all";

  function applyAgeFilter() {
    stageGallery.querySelectorAll(".stage-group").forEach((group) => {
      group.hidden = activeAgeFilter !== "all" && group.dataset.age !== activeAgeFilter;
    });
    if (activeAgeFilter !== "all" && THEMES[selectedThemeIndex].ageGroup !== activeAgeFilter) {
      selectStage(THEMES.findIndex((t) => t.ageGroup === activeAgeFilter));
    }
  }

  function buildAgeFilter() {
    AGE_FILTERS.forEach(({ key, label }) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "age-chip";
      if (key === activeAgeFilter) chip.classList.add("is-active");
      chip.textContent = label;
      chip.addEventListener("click", () => {
        activeAgeFilter = key;
        [...ageFilter.children].forEach((c) => c.classList.toggle("is-active", c === chip));
        applyAgeFilter();
      });
      ageFilter.appendChild(chip);
    });
  }

  function selectStage(index) {
    selectedThemeIndex = index;
    if (game.phase === "menu" && musicTimer !== null) startMusic(THEMES[index]);
    stageGallery.querySelectorAll("button[data-index]").forEach((card) => {
      const active = Number(card.dataset.index) === index;
      card.classList.toggle("is-selected", active);
      card.setAttribute("aria-pressed", active ? "true" : "false");
    });
    setStatus(`Fase escolhida: ${THEMES[index].emoji} ${THEMES[index].name}. Toque em "Começar com a câmera" ou "Jogar com teclado"!`);
  }

  function buildStageGallery() {
    const groups = new Map();
    AGE_FILTERS.filter((age) => age.key !== "all").forEach((age) => {
      const indices = THEMES.map((t, i) => t.ageGroup === age.key ? i : -1).filter((i) => i >= 0);
      for (let offset = 0; offset < indices.length; offset += 4) {
        const section = document.createElement("section");
        section.className = "stage-group";
        section.dataset.age = age.key;
        const title = document.createElement("h3");
        title.textContent = `${age.label}${indices.length > 4 ? ` · Grupo ${offset / 4 + 1}` : ""}`;
        section.appendChild(title);
        const cards = document.createElement("div");
        cards.className = "stage-group-cards";
        section.appendChild(cards);
        stageGallery.appendChild(section);
        indices.slice(offset, offset + 4).forEach((index) => groups.set(index, cards));
      }
    });
    THEMES.forEach((themeObj, index) => {
      const isFinal = index === ROBOT_INDEX;
      const card = document.createElement(isFinal ? "div" : "button");
      if (!isFinal) card.type = "button";
      card.dataset.index = index;
      card.className = isFinal ? "stage-card stage-card--final" : "stage-card";
      card.setAttribute("aria-label", isFinal ? `${themeObj.name}: fase final, sempre por último` : `Escolher a fase ${themeObj.name}`);
      if (!isFinal) {
        card.setAttribute("aria-pressed", index === selectedThemeIndex ? "true" : "false");
        if (index === selectedThemeIndex) card.classList.add("is-selected");
      }

      const thumb = document.createElement("canvas");
      thumb.className = "stage-thumb";
      thumb.width = 110;
      thumb.height = 140;
      card.appendChild(thumb);
      themeObj.thumbCanvas = thumb;

      if (isFinal) {
        const badge = document.createElement("span");
        badge.className = "stage-badge";
        badge.textContent = "FASE FINAL";
        card.appendChild(badge);
      } else if (themeObj.ageGroup) {
        const ageBadge = document.createElement("span");
        ageBadge.className = "age-badge";
        ageBadge.textContent = themeObj.ageGroup;
        card.appendChild(ageBadge);
      }

      const label = document.createElement("span");
      label.textContent = `${themeObj.emoji} ${themeObj.name}`;
      card.appendChild(label);

      if (!isFinal) card.addEventListener("click", () => selectStage(index));
      (isFinal ? stageGallery : groups.get(index)).appendChild(card);
    });
    buildAgeFilter();
    renderStageThumbnails(0);
    window.setInterval(() => renderStageThumbnails(performance.now()), 90);
  }

  function detectPose(t) {
    if (!landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || t - lastDetect < 50) return;
    lastDetect = t;

    if (video.videoWidth && video.videoHeight) camAspect = video.videoWidth / video.videoHeight;

    try {
      const result = landmarker.detectForVideo(video, t);
      const raw = result.landmarks && result.landmarks[0];
      if (raw) {
        const pts = toGamePoints(raw);
        const m = poseMetrics(pts);
        currentPose = { pts, m };
        currentPoseAt = t;
        if (m) {
          game.hipHistory.push({ t, y: m.hipY });
          game.hipHistory = game.hipHistory.filter((e) => t - e.t < 1500);

          const lw = pts[15];
          const rw = pts[16];
          if (visible(lw) && visible(rw)) {
            game.wristXHistory.push({ t, v: (lw.x + rw.x) / 2 });
          }
          game.wristXHistory = game.wristXHistory.filter((e) => t - e.t < 1600);

          const ls = pts[11];
          const rs = pts[12];
          if (visible(ls) && visible(rs)) {
            game.shoulderWidthHistory.push({ t, v: Math.hypot(ls.x - rs.x, ls.y - rs.y) });
          }
          game.shoulderWidthHistory = game.shoulderWidthHistory.filter((e) => t - e.t < 1600);
        }
      }
    } catch (error) {
      setStatus(`Erro ao detectar movimento: ${error.message}`);
    }
  }

  /* ---------- Áudio ---------- */

  function ensureAudio() {
    if (audioContext) {
      audioContext.resume().catch(() => {});
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
    audioDestination = audioContext.createMediaStreamDestination();
    audioContext.resume().catch((error) => setStatus(`Áudio indisponível: ${error.message}`));
  }

  function tone(freq, duration, type, volume, when = null, output = null) {
    if (!audioContext || audioContext.state !== "running") return;
    const now = when ?? audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    if (output) gain.connect(output);
    else {
      gain.connect(audioContext.destination);
      gain.connect(audioDestination);
    }
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function stopMusic() {
    musicGeneration += 1;
    if (musicTimer !== null) clearInterval(musicTimer);
    musicTimer = null;
    if (musicGain && audioContext) {
      const previous = musicGain;
      previous.gain.cancelScheduledValues(audioContext.currentTime);
      previous.gain.setTargetAtTime(0, audioContext.currentTime, 0.025);
      window.setTimeout(() => previous.disconnect(), 250);
      musicGain = null;
    }
  }

  function startMusic(t) {
    stopMusic();
    if (!audioContext) return;
    const generation = musicGeneration;
    const track = window.ArthurDanceMusic.trackFor(t);
    document.getElementById("musicInfo").textContent = `${track.title} · ${track.genre}`;
    const start = () => {
      if (generation !== musicGeneration) return;
      musicGain = audioContext.createGain();
      musicGain.gain.value = 0.7;
      musicGain.connect(audioContext.destination);
      musicGain.connect(audioDestination);
      const player = window.ArthurDanceMusic.createPlayer(audioContext, musicGain, track);
      let step = 0;
      let next = audioContext.currentTime + 0.03;
      const schedule = () => {
        if (audioContext.state !== "running") return;
        if (next < audioContext.currentTime) next = audioContext.currentTime + 0.03;
        while (next < audioContext.currentTime + 0.12) {
          player.schedule(step++, next);
          next += player.tickLength;
        }
      };
      schedule();
      musicTimer = window.setInterval(schedule, 25);
    };
    if (audioContext.state === "running") start();
    else audioContext.resume().then(start).catch(() => setStatus("Toque novamente para ativar o som."));
  }

  /* ---------- Gravação (somente o canvas do jogo) ---------- */

  function startRecording() {
    if (!canvas.captureStream || !window.MediaRecorder) return;
    canvasStream = canvas.captureStream(30);
    const tracks = [...canvasStream.getVideoTracks()];
    if (audioDestination) tracks.push(...audioDestination.stream.getAudioTracks());

    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
      .find((type) => MediaRecorder.isTypeSupported(type));

    recorder = new MediaRecorder(new MediaStream(tracks), mimeType ? { mimeType } : undefined);
    recordingChunks = [];
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordingChunks.push(event.data);
    });
    recorder.addEventListener("stop", () => {
      if (!recordingChunks.length) return;
      const blob = new Blob(recordingChunks, { type: recorder.mimeType || "video/webm" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      downloadUrl = URL.createObjectURL(blob);
      downloadButton.href = downloadUrl;
      downloadButton.hidden = false;
    });
    recorder.start();
  }

  function stopRecording() {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (canvasStream) {
      canvasStream.getTracks().forEach((track) => track.stop());
      canvasStream = null;
    }
  }

  /* ---------- Câmera ---------- */

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("A câmera precisa de HTTPS ou de uma página aberta em localhost");
    }

    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user" } });
    video.srcObject = stream;
    await video.play();

    setStatus("Carregando o detector de movimentos (precisa de internet)...");
    const vision = await import(VISION_URL);
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
    landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (landmarker) {
      landmarker.close();
      landmarker = null;
    }
    video.srcObject = null;
    currentPose = null;
    smoothed = null;
  }

  /* ---------- Fluxo do jogo ---------- */

  function beginLevel(t) {
    game.moves = makeMoves(game.level, theme());
    game.moveIndex = 0;
    game.hits = 0;
    game.phase = "intro";
    game.phaseAt = t;
    startMusic(theme());
    setStatus(`Fase ${game.level + 1}/${LEVELS}: ${theme().name}`);
  }

  function beginMove(t) {
    game.phase = "playing";
    game.moveAt = t;
    game.moveDone = false;
    game.keyHit = false;
    game.originX = currentPose && currentPose.m ? currentPose.m.cx : 0.5 * camAspect;
    game.hipHistory = [];
    game.wristXHistory = [];
    game.shoulderWidthHistory = [];
  }

  function succeed(t) {
    const move = MOVES[game.moves[game.moveIndex]];
    const bonus = Math.round(50 * Math.max(0, 1 - (t - game.moveAt) / moveTime()));
    game.score += POINTS + bonus;
    game.hits += 1;
    game.moveDone = true;
    game.doneAt = t;
    game.flash = `Boa! +${POINTS + bonus}`;
    game.flashAt = t;
    if (move.scroll) game.scrollTarget += move.scroll;
    tone(880, 0.12, "square", 0.05);
  }

  function miss(t) {
    game.moveDone = true;
    game.doneAt = t;
    game.flash = "Quase! Vamos de novo!";
    game.flashAt = t;
  }

  function finishGame(t) {
    previewMusic.hidden = true;
    game.phase = "finished";
    game.phaseAt = t;
    stopMusic();
    stopRecording();
    stopCamera();
    startButton.hidden = false;
    startButton.disabled = false;
    keyboardButton.hidden = false;
    danceButton.hidden = true;
    stopButton.hidden = true;
    setStatus(`Fim do jogo! Você fez ${game.score} pontos. Baixe o vídeo ou jogue de novo.`);
  }

  const TUTORIAL_DURATION = 4200;

  function tick(t) {
    game.now = t;
    game.scroll += (game.scrollTarget - game.scroll) * 0.06;

    if (game.phase === "tutorial") {
      if (game.keyHit || t - game.phaseAt > TUTORIAL_DURATION) {
        game.keyHit = false;
        beginLevel(t);
      }
    } else if (game.phase === "intro" && t - game.phaseAt > 2600) {
      beginMove(t);
    } else if (game.phase === "playing") {
      const move = MOVES[game.moves[game.moveIndex]];
      if (!game.moveDone) {
        const grace = t - game.moveAt > 500;
        const poseFresh = currentPose && currentPose.m && t - currentPoseAt < 500;
        const detected = grace && game.useCamera && poseFresh && move.check(currentPose, game);

        if (detected || (game.keyHit && grace)) {
          succeed(t);
        } else if (t - game.moveAt > moveTime()) {
          miss(t);
        }
      } else if (t - game.doneAt > 800) {
        game.moveIndex += 1;
        if (game.moveIndex >= MOVES_PER_LEVEL) {
          game.lastStars = game.hits;
          game.phase = "levelDone";
          game.phaseAt = t;
        } else {
          beginMove(t);
        }
      }
    } else if (game.phase === "levelDone" && t - game.phaseAt > 2800) {
      game.level += 1;
      if (game.level >= LEVELS) finishGame(t);
      else beginLevel(t);
    }

    game.keyHit = false;
  }

  /* ---------- Desenho ---------- */

  function drawBackground(t, time) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, t.sky[0]);
    sky.addColorStop(0.6, t.sky[1]);
    sky.addColorStop(1, t.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    t.deco(time, game.scroll);

    rect(0, GROUND_Y, W, H - GROUND_Y, t.ground);
    ctx.strokeStyle = "#ffffff55";
    ctx.lineWidth = 6;
    ctx.setLineDash([40, 30]);
    ctx.lineDashOffset = game.scroll;
    ctx.beginPath();
    ctx.moveTo(0, 740);
    ctx.lineTo(W, 740);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawHead(type, x, y, r, ch) {
    circle(x, y, r, ch.skin);

    if (type === "hair") {
      ctx.fillStyle = ch.hair;
      ctx.beginPath();
      ctx.arc(x, y - 3, r, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    } else if (type === "sunhat") {
      ctx.fillStyle = "#f6d365";
      ctx.beginPath();
      ctx.ellipse(x, y - r * 0.45, r * 1.9, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - r * 0.5, r * 0.9, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (type === "cap") {
      ctx.fillStyle = "#c0392b";
      ctx.beginPath();
      ctx.arc(x, y - 3, r, Math.PI, Math.PI * 2);
      ctx.fill();
      rect(x - 2, y - 8, r * 1.4, 7, "#c0392b");
    } else if (type === "helmet") {
      ctx.fillStyle = "rgba(170,215,255,0.55)";
      ctx.strokeStyle = "#f2f2f7";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === "beanie") {
      ctx.fillStyle = "#e63946";
      ctx.beginPath();
      ctx.arc(x, y - 2, r * 1.02, Math.PI, Math.PI * 2);
      ctx.fill();
      rect(x - r * 1.05, y - 8, r * 2.1, 9, "#f1faee");
      circle(x, y - r * 1.05, r * 0.28, "#f1faee");
    } else if (type === "turban") {
      ctx.fillStyle = "#f8f4e8";
      ctx.beginPath();
      ctx.ellipse(x, y - r * 0.55, r * 1.15, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d8cfae";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.55, r * 0.7, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (type === "goggles") {
      ctx.fillStyle = ch.hair;
      ctx.beginPath();
      ctx.arc(x, y - 3, r, Math.PI, Math.PI * 2);
      ctx.fill();
      rect(x - r, y - r * 0.25, r * 2, r * 0.45, "#16324f");
    } else if (type === "clown") {
      circle(x - r, y - r * 0.2, r * 0.55, ch.hair);
      circle(x + r, y - r * 0.2, r * 0.55, ch.hair);
      circle(x, y - r * 0.9, r * 0.55, ch.hair);
    } else if (type === "knight") {
      ctx.fillStyle = "#adb5bd";
      ctx.beginPath();
      ctx.arc(x, y, r * 1.08, Math.PI, Math.PI * 2);
      ctx.fill();
      rect(x - r * 1.08, y - 2, r * 2.16, r * 0.8, "#adb5bd");
      ctx.strokeStyle = "#495057";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y + r * 0.1);
      ctx.lineTo(x + r * 0.7, y + r * 0.1);
      ctx.stroke();
      ctx.strokeStyle = "#e63946";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x + 16, y - r - 22, x + 30, y - r - 4);
      ctx.stroke();
    } else if (type === "wizard") {
      ctx.fillStyle = "#6a1b9a";
      ctx.beginPath();
      ctx.ellipse(x, y - r * 0.55, r * 1.5, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      triangle(x - r * 0.95, y - r * 0.6, x + 8, y - r * 2.7, x + r * 0.95, y - r * 0.6, "#6a1b9a");
      circle(x + 4, y - r * 1.5, 5, "#ffd166");
    } else if (type === "robot") {
      rect(x - r, y - r * 0.9, r * 2, r * 1.8, ch.skin);
      ctx.strokeStyle = "#5b6773";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - r, y - r * 0.9, r * 2, r * 1.8);
      ctx.strokeStyle = "#5b677333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x + r, y);
      ctx.stroke();
      circle(x - r * 0.45, y - r * 0.15, r * 0.2, "#36e1ff");
      circle(x + r * 0.45, y - r * 0.15, r * 0.2, "#36e1ff");
      rect(x - r * 0.3, y + r * 0.45, r * 0.6, r * 0.12, "#36e1ff");
      ctx.strokeStyle = "#5b6773";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.9);
      ctx.lineTo(x, y - r * 1.5);
      ctx.stroke();
      circle(x, y - r * 1.55, r * 0.16, "#ff5566");
    } else if (type === "sporthelmet") {
      ctx.fillStyle = "#f2f2f7";
      ctx.beginPath();
      ctx.arc(x, y - r * 0.05, r * 1.08, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ff4f9a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.05, r * 1.08, Math.PI * 1.1, Math.PI * 1.5);
      ctx.stroke();
      rect(x - r * 0.9, y - r * 0.1, r * 1.8, r * 0.22, "#2c3e91");
    }
  }

  function drawCharacter(pts, ch, opts = {}) {
    const aspect = opts.aspect ?? camAspect;
    const S = opts.scale ?? 760;
    const cx0 = opts.centerX ?? 320;
    const cy0 = opts.centerY ?? 340;
    const strokeScale = opts.strokeScale ?? 1;
    const minHeadR = opts.minHeadR ?? 24;
    const maxHeadR = opts.maxHeadR ?? 40;
    const P = (i) => ({ x: cx0 + (pts[i].x - 0.5 * aspect) * S, y: cy0 + (pts[i].y - 0.5) * S });
    const ok = (i) => pts[i] && pts[i].v > 0.35;

    if (![11, 12, 23, 24].every(ok)) return;

    const seg = (a, b, color, width) => {
      if (!ok(a) || !ok(b)) return;
      const p = P(a);
      const q = P(b);
      ctx.strokeStyle = color;
      ctx.lineWidth = width * strokeScale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    };

    ctx.save();
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 8 * strokeScale;

    seg(23, 25, ch.pants, 28);
    seg(25, 27, ch.pants, 24);
    seg(24, 26, ch.pants, 28);
    seg(26, 28, ch.pants, 24);

    for (const [ankle, dir] of [[27, -1], [28, 1]]) {
      if (!ok(ankle)) continue;
      const a = P(ankle);
      ctx.strokeStyle = ch.shoes;
      ctx.lineWidth = 17 * strokeScale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + dir * 22 * strokeScale, a.y + 6 * strokeScale);
      ctx.stroke();
    }

    const ls = P(11), rs = P(12), lh = P(23), rh = P(24);
    ctx.fillStyle = ch.shirt;
    ctx.strokeStyle = ch.shirt;
    ctx.lineWidth = 8 * strokeScale;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(ls.x, ls.y);
    ctx.lineTo(rs.x, rs.y);
    ctx.lineTo(rh.x, rh.y);
    ctx.lineTo(lh.x, lh.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    seg(11, 13, ch.shirt, 25);
    seg(12, 14, ch.shirt, 25);
    seg(13, 15, ch.skin, 17);
    seg(14, 16, ch.skin, 17);

    const sm = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
    const torsoPx = Math.hypot(sm.x - (lh.x + rh.x) / 2, sm.y - (lh.y + rh.y) / 2);
    const r = Math.max(minHeadR, Math.min(maxHeadR, torsoPx * 0.22));
    const head = ok(0) ? P(0) : { x: sm.x, y: sm.y - torsoPx * 0.45 };

    ctx.shadowBlur = 0;
    drawHead(ch.head, head.x, head.y - r * 0.2, r, ch);
    ctx.restore();
  }

  function drawText(text, x, y, size, color, align = "center") {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.font = `bold ${size}px Arial`;
    ctx.fillText(text, x, y);
  }

  function drawStars(count, y) {
    drawText("★".repeat(count) + "☆".repeat(MOVES_PER_LEVEL - count), 320, y, 48, "#ffd166");
  }

  function render(time) {
    const t = game.phase === "menu"
      ? THEMES[selectedThemeIndex]
      : game.phase === "finished" && game.level >= LEVELS
        ? THEMES[game.order[LEVELS - 1]]
        : theme();

    drawBackground(t, time);

    const usePose = game.useCamera && currentPose && currentPose.m && time - currentPoseAt < 700;
    const pts = usePose ? currentPose.pts : idlePose(time);
    drawCharacter(pts, t.character);

    if (game.phase === "menu") {
      drawText("ARTHUR DANCE", 320, 150, 54, "#fff");
      drawText(`Fase escolhida: ${t.emoji} ${t.name}`, 320, 200, 26, "#ffd166");
      drawText("Escolha um botão abaixo", 320, 760, 26, "#fff");
      return;
    }

    if (game.phase === "finished") {
      ctx.fillStyle = "#000a";
      ctx.fillRect(40, 220, 560, 330);
      drawText("PARABÉNS!", 320, 300, 48, "#ffd166");
      drawText(`${game.score} pontos`, 320, 370, 44, "#fff");
      drawText(`Você terminou as ${LEVELS} fases!`, 320, 430, 24, "#fff");
      drawText("Baixe o vídeo ou jogue de novo", 320, 480, 22, "#e6d9f0");
      return;
    }

    drawText(`Fase ${game.level + 1}/${LEVELS} • ${t.emoji} ${t.name}`, 320, 50, 28, "#fff");
    drawText(`Pontos: ${game.score}`, 620, 92, 26, "#fff", "right");
    drawText(t.character.name, 20, 92, 22, "#ffd166", "left");

    for (let i = 0; i < MOVES_PER_LEVEL; i += 1) {
      const done = i < game.moveIndex || (i === game.moveIndex && game.moveDone);
      circle(280 + i * 28, 120, 9, done ? "#ffd166" : i === game.moveIndex ? "#fff" : "#ffffff55");
    }

    if (game.phase === "tutorial") {
      ctx.fillStyle = "#000b";
      ctx.fillRect(30, 150, 580, 480);
      drawText("COMO JOGAR", 320, 210, 40, "#ffd166");
      const lines = game.useCamera
        ? ["Fique de corpo inteiro na frente da câmera.", "Imite o movimento mostrado na tela.", "Acerte antes da barra amarela acabar!"]
        : ["Observe o movimento pedido na tela.", "Pressione ESPAÇO ou toque em \"Dançar\".", "Acerte antes da barra amarela acabar!"];
      lines.forEach((line, i) => drawText(line, 320, 270 + i * 46, 24, "#fff"));
      const remaining = Math.max(0, 1 - (time - game.phaseAt) / TUTORIAL_DURATION);
      rect(90, 420 + lines.length * 46, 460 * remaining, 10, "#ffd166");
      drawText(
        game.useCamera ? "Preparando a fase..." : "Pressione ESPAÇO para começar agora",
        320, 475 + lines.length * 46, 22, "#e6d9f0"
      );
    } else if (game.phase === "intro") {
      const isFinal = game.level === LEVELS - 1;
      ctx.fillStyle = "#000a";
      ctx.fillRect(40, 250, 560, isFinal ? 270 : 230);
      drawText(`FASE ${game.level + 1}`, 320, 320, 48, "#ffd166");
      drawText(`${t.emoji} ${t.name}`, 320, 380, 38, "#fff");
      drawText(`Personagem: ${t.character.name}`, 320, 430, 24, "#e6d9f0");
      if (isFinal) {
        drawText("Última fase! Mostre tudo o que você aprendeu 🤖", 320, 475, 22, "#ffd166");
      }
    } else if (game.phase === "playing") {
      const move = MOVES[game.moves[game.moveIndex]];
      ctx.fillStyle = "#0009";
      ctx.fillRect(42, 205, 556, 105);
      drawText(move.label, 320, 270, move.label.length > 28 ? 24 : 30, "#fff");
      const remaining = Math.max(0, 1 - (time - game.moveAt) / moveTime());
      rect(70, 292, 500 * remaining, 8, "#ffd166");

      if (!game.useCamera) {
        drawText("Pressione ESPAÇO ou toque em Dançar", 320, 760, 22, "#ffffffcc");
      }

      if (game.moveDone) {
        drawText(game.flash, 320, 370, 34, game.flash.startsWith("Boa") ? "#a8ffb0" : "#ffd166");
      }
    } else if (game.phase === "levelDone") {
      ctx.fillStyle = "#000a";
      ctx.fillRect(40, 250, 560, 230);
      drawText("FASE COMPLETA!", 320, 330, 42, "#ffd166");
      drawStars(game.lastStars, 405);
      drawText(`${game.hits}/${MOVES_PER_LEVEL} movimentos certos`, 320, 450, 24, "#fff");
    }
  }

  function startGame(useCamera) {
    stopMusic();
    previewMusic.hidden = true;
    previewMusic.textContent = "Ouvir a trilha";
    game.phase = "tutorial";
    game.order = buildOrder(selectedThemeIndex);
    game.level = 0;
    game.score = 0;
    game.scroll = 0;
    game.scrollTarget = 0;
    game.useCamera = useCamera;
    game.lastStars = 0;
    game.phaseAt = performance.now();
    game.keyHit = false;
    startButton.hidden = true;
    keyboardButton.hidden = true;
    danceButton.hidden = useCamera;
    stopButton.hidden = false;
    downloadButton.hidden = true;

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = null;
    }

    ensureAudio();
    try {
      startRecording();
    } catch (error) {
      setStatus(`Não foi possível gravar o vídeo: ${error.message}`);
    }

    if (useCamera) setStatus("Câmera pronta! Veja o tutorial rápido e afaste-se para seu corpo inteiro aparecer.");
    else setStatus("Veja o tutorial rápido! Pressione Espaço ou toque em Dançar quando quiser começar.");
  }

  function stopGame() {
    stopMusic();
    stopRecording();
    stopCamera();
    previewMusic.hidden = false;
    game.phase = "menu";
    game.useCamera = false;
    startButton.hidden = false;
    startButton.disabled = false;
    keyboardButton.hidden = false;
    danceButton.hidden = true;
    stopButton.hidden = true;
    setStatus("Jogo parado. Escolha como jogar quando estiver pronto.");
  }

  async function startCameraGame() {
    startButton.disabled = true;
    keyboardButton.disabled = true;
    setStatus("Solicitando acesso à câmera...");
    try {
      await startCamera();
      startGame(true);
    } catch (error) {
      stopCamera();
      startButton.disabled = false;
      keyboardButton.disabled = false;
      setStatus(`Não foi possível iniciar a câmera: ${error.message}`);
    }
  }

  const previewMusic = document.getElementById("previewMusic");
  previewMusic.addEventListener("click", () => {
    if (game.phase !== "menu") return;
    if (musicTimer !== null || musicGain !== null || previewMusic.textContent === "Parar a trilha") {
      stopMusic();
      previewMusic.textContent = "Ouvir a trilha";
    } else {
      ensureAudio();
      if (!audioContext) {
        setStatus("Este navegador não oferece suporte ao áudio do jogo.");
        return;
      }
      startMusic(THEMES[selectedThemeIndex]);
      previewMusic.textContent = "Parar a trilha";
    }
  });

  startButton.addEventListener("click", startCameraGame);
  keyboardButton.addEventListener("click", () => {
    startButton.disabled = false;
    keyboardButton.disabled = false;
    startGame(false);
  });
  danceButton.addEventListener("click", () => {
    if (game.phase === "tutorial") {
      game.keyHit = true;
    } else if (game.phase === "playing" && !game.moveDone) {
      game.keyHit = true;
    }
  });
  stopButton.addEventListener("click", stopGame);

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    if (game.phase === "tutorial") {
      event.preventDefault();
      game.keyHit = true;
      return;
    }
    if (game.phase !== "playing" || game.useCamera) return;
    event.preventDefault();
    if (!game.moveDone) game.keyHit = true;
  });

  function frame(time) {
    detectPose(time);
    tick(time);
    render(time);
    window.requestAnimationFrame(frame);
  }

  buildStageGallery();
  render(0);
  window.requestAnimationFrame(frame);
})();
