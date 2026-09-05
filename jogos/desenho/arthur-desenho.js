const basePalette = [
  { name: 'Branco', value: '#ffffff' },
  { name: 'Preto', value: '#111111' },
  { name: 'Cinza 1', value: '#f2f2f2' },
  { name: 'Cinza 2', value: '#d9d9d9' },
  { name: 'Cinza 3', value: '#bdbdbd' },
  { name: 'Cinza 4', value: '#9e9e9e' },
  { name: 'Cinza 5', value: '#757575' },
  { name: 'Cinza 6', value: '#5d5d5d' },
  { name: 'Cinza 7', value: '#3d3d3d' },
  { name: 'Bege 1', value: '#fff7ea' },
  { name: 'Bege 2', value: '#f5e7c9' },
  { name: 'Bege 3', value: '#f7d9a1' },
  { name: 'Bege 4', value: '#eac88a' },
  { name: 'Bege 5', value: '#d6b069' },
  { name: 'Bege 6', value: '#bb8d4d' },
  { name: 'Bege 7', value: '#9e6a37' },
  { name: 'Bege 8', value: '#7a4c29' },
  { name: 'Marrom 1', value: '#f3d7bb' },
  { name: 'Marrom 2', value: '#d8a679' },
  { name: 'Marrom 3', value: '#b87448' },
  { name: 'Marrom 4', value: '#8f4d2a' },
  { name: 'Marrom 5', value: '#6d3a1e' },
  { name: 'Marrom 6', value: '#4e2c1b' },
  { name: 'Marrom 7', value: '#3a2217' },
  { name: 'Marrom 8', value: '#261710' },
  { name: 'Amarelo 1', value: '#fff9d6' },
  { name: 'Amarelo 2', value: '#fff3a6' },
  { name: 'Amarelo 3', value: '#ffe88a' },
  { name: 'Amarelo 4', value: '#ffe366' },
  { name: 'Amarelo 5', value: '#ffe600' },
  { name: 'Amarelo 6', value: '#ffd43b' },
  { name: 'Amarelo 7', value: '#f4b400' },
  { name: 'Amarelo 8', value: '#d99a00' },
  { name: 'Amarelo 9', value: '#b77700' },
  { name: 'Amarelo dourado', value: '#f7c948' },
  { name: 'Amarelo limão', value: '#d9f15b' },
  { name: 'Amarelo claro', value: '#fef3a2' },
  { name: 'Amarelo pastel', value: '#f7e9a2' },
  { name: 'Laranja 1', value: '#ffe3b5' },
  { name: 'Laranja 2', value: '#ffcf99' },
  { name: 'Laranja 3', value: '#ffb66d' },
  { name: 'Laranja 4', value: '#ff9f43' },
  { name: 'Laranja 5', value: '#ff7b2d' },
  { name: 'Laranja 6', value: '#ef5c17' },
  { name: 'Laranja 7', value: '#d74410' },
  { name: 'Laranja 8', value: '#b83008' },
  { name: 'Coral 1', value: '#ffb8a5' },
  { name: 'Coral 2', value: '#ff8f7b' },
  { name: 'Coral 3', value: '#ff6a55' },
  { name: 'Coral 4', value: '#ff4f3d' },
  { name: 'Vermelho 1', value: '#ffd7d7' },
  { name: 'Vermelho 2', value: '#ffb3b3' },
  { name: 'Vermelho 3', value: '#ff7d7d' },
  { name: 'Vermelho 4', value: '#ff4d4d' },
  { name: 'Vermelho 5', value: '#ea3a3a' },
  { name: 'Vermelho 6', value: '#d82c2c' },
  { name: 'Vermelho 7', value: '#a51717' },
  { name: 'Vermelho 8', value: '#7b1212' },
  { name: 'Vermelho escuro', value: '#4b0d0d' },
  { name: 'Bordô 1', value: '#f7d5dc' },
  { name: 'Bordô 2', value: '#e8b2c0' },
  { name: 'Bordô 3', value: '#d7819d' },
  { name: 'Bordô 4', value: '#b95d7d' },
  { name: 'Bordô 5', value: '#9b4465' },
  { name: 'Bordô 6', value: '#7a2c49' },
  { name: 'Bordô 7', value: '#5f1b36' },
  { name: 'Bordô 8', value: '#3d1024' },
  { name: 'Rosa 1', value: '#ffe6f2' },
  { name: 'Rosa 2', value: '#ffd6ec' },
  { name: 'Rosa 3', value: '#ffb8e2' },
  { name: 'Rosa 4', value: '#ff9ad1' },
  { name: 'Rosa 5', value: '#f86cc9' },
  { name: 'Rosa 6', value: '#d641a7' },
  { name: 'Rosa 7', value: '#a82d82' },
  { name: 'Rosa 8', value: '#77205a' },
  { name: 'Rosa choque', value: '#ff4ecb' },
  { name: 'Rosa bebê', value: '#f9d3e8' },
  { name: 'Rosa salmão', value: '#ff9aa7' },
  { name: 'Roxo 1', value: '#f4e3ff' },
  { name: 'Roxo 2', value: '#e5d0ff' },
  { name: 'Roxo 3', value: '#d4a8ff' },
  { name: 'Roxo 4', value: '#bf8dff' },
  { name: 'Roxo 5', value: '#9d6de8' },
  { name: 'Roxo 6', value: '#7a4bd8' },
  { name: 'Roxo 7', value: '#6736c4' },
  { name: 'Roxo 8', value: '#4c2a92' },
  { name: 'Roxo escuro 1', value: '#5d3ea3' },
  { name: 'Roxo escuro 2', value: '#4b2c72' },
  { name: 'Roxo escuro 3', value: '#2d184f' },
  { name: 'Lilás 1', value: '#e9ddff' },
  { name: 'Lilás 2', value: '#c7b3ff' },
  { name: 'Lilás 3', value: '#9f82ff' },
  { name: 'Lilás 4', value: '#7a5cff' },
  { name: 'Azul 1', value: '#edf6ff' },
  { name: 'Azul 2', value: '#dfefff' },
  { name: 'Azul 3', value: '#c9e4ff' },
  { name: 'Azul 4', value: '#a8d4ff' },
  { name: 'Azul 5', value: '#8ab9ff' },
  { name: 'Azul 6', value: '#6aa9ff' },
  { name: 'Azul 7', value: '#3d8cf0' },
  { name: 'Azul 8', value: '#2d7af1' },
  { name: 'Azul 9', value: '#215fd6' },
  { name: 'Azul 10', value: '#1d56b7' },
  { name: 'Azul 11', value: '#113d8c' },
  { name: 'Azul 12', value: '#0b2a63' },
  { name: 'Azul escuro 1', value: '#0f2b46' },
  { name: 'Azul escuro 2', value: '#183d5b' },
  { name: 'Azul escuro 3', value: '#265a7b' },
  { name: 'Azul bebê 1', value: '#eaf4ff' },
  { name: 'Azul bebê 2', value: '#d5ebff' },
  { name: 'Azul bebê 3', value: '#bddaff' },
  { name: 'Azul bebê 4', value: '#8fb7ff' },
  { name: 'Azul bebê 5', value: '#6c99ff' },
  { name: 'Ciano 1', value: '#dcffff' },
  { name: 'Ciano 2', value: '#b9ffff' },
  { name: 'Ciano 3', value: '#8ae7e8' },
  { name: 'Ciano 4', value: '#62dfe8' },
  { name: 'Ciano 5', value: '#3abec3' },
  { name: 'Ciano 6', value: '#1ca0a7' },
  { name: 'Ciano 7', value: '#179a9d' },
  { name: 'Ciano 8', value: '#0e6f7b' },
  { name: 'Turquesa', value: '#1ad4c9' },
  { name: 'Verde 1', value: '#f1ffe8' },
  { name: 'Verde 2', value: '#e6ffd5' },
  { name: 'Verde 3', value: '#d1f7b0' },
  { name: 'Verde 4', value: '#c8f5a7' },
  { name: 'Verde 5', value: '#a9e774' },
  { name: 'Verde 6', value: '#9ce179' },
  { name: 'Verde 7', value: '#5dc55d' },
  { name: 'Verde 8', value: '#2ea954' },
  { name: 'Verde 9', value: '#188a41' },
  { name: 'Verde 10', value: '#0d5e39' },
  { name: 'Verde 11', value: '#114d3a' },
  { name: 'Verde 12', value: '#173e31' },
  { name: 'Verde escuro 1', value: '#0f3c2f' },
  { name: 'Verde escuro 2', value: '#1d5b46' },
  { name: 'Verde claro', value: '#a4eb83' },
  { name: 'Verde bebê', value: '#d7ffd0' },
  { name: 'Oliva 1', value: '#f4f3b0' },
  { name: 'Oliva 2', value: '#ece8a2' },
  { name: 'Oliva 3', value: '#d2d77d' },
  { name: 'Oliva 4', value: '#9fad48' },
  { name: 'Oliva 5', value: '#687b2d' },
  { name: 'Dourado 1', value: '#fff0b8' },
  { name: 'Dourado 2', value: '#ffe7a8' },
  { name: 'Dourado 3', value: '#f5c771' },
  { name: 'Dourado 4', value: '#e0a63b' },
  { name: 'Dourado 5', value: '#c8891c' },
  { name: 'Dourado 6', value: '#a96500' },
  { name: 'Dourado 7', value: '#7a4d00' },
  { name: 'Terracota', value: '#cf6b4d' },
  { name: 'Caramelo', value: '#c88d3a' },
  { name: 'Ametista', value: '#8f5cd1' },
  { name: 'Violeta', value: '#a14ff1' },
  { name: 'Magenta', value: '#d339ff' },
  { name: 'Fúcsia', value: '#ff2ecb' },
  { name: 'Aqua', value: '#47d4ff' },
  { name: 'Azul petróleo', value: '#1d6e8c' },
  { name: 'Teal', value: '#08a5a5' },
  { name: 'Menta', value: '#74f0b3' },
  { name: 'Nude 1', value: '#f9e1c7' },
  { name: 'Nude 2', value: '#f1cfa7' },
  { name: 'Nude 3', value: '#e8ba82' },
  { name: 'Nude 4', value: '#d99b69' },
  { name: 'Nude 5', value: '#be7a52' },
  { name: 'Nude 6', value: '#9a5b3d' },
  { name: 'Aurora 1', value: '#f9d8ff' },
  { name: 'Aurora 2', value: '#e8d0ff' },
  { name: 'Aurora 3', value: '#c9b3ff' },
  { name: 'Aurora 4', value: '#8ed8ff' },
  { name: 'Aurora 5', value: '#7ee5c7' },
  { name: 'Aurora 6', value: '#b6f3d1' },
  { name: 'Metal 1', value: '#e3e9ef' },
  { name: 'Metal 2', value: '#c4ccd7' },
  { name: 'Metal 3', value: '#9aa8ba' },
  { name: 'Metal 4', value: '#697b90' },
  { name: 'Metal 5', value: '#425669' }
];

function generateExtendedPalette() {
  const generated = [];
  const hueStops = [0, 18, 32, 48, 64, 96, 140, 180, 210, 245, 280, 320, 360];
  hueStops.forEach((hue, index) => {
    for (let i = 0; i < 36; i++) {
      const sat = 40 + ((i * 7) % 45);
      const light = 42 + ((index * 5 + i) % 36);
      generated.push({
        name: `Cor ${generated.length + 1}`,
        value: `hsl(${hue}, ${sat}%, ${light}%)`
      });
    }
  });

  const fullPalette = [...basePalette, ...generated].slice(0, 600);
  return fullPalette;
}

const paletteColors = generateExtendedPalette();

const app = {
  canvas: document.getElementById('canvas'),
  bgCanvas: document.getElementById('bgCanvas'),
  ctx: null,
  bgCtx: null,
  palette: document.getElementById('palette'),
  colorToggleBtn: document.getElementById('colorToggleBtn'),
  brushSize: document.getElementById('brushSize'),
  clearBtn: document.getElementById('clearBtn'),
  formatBtn: document.getElementById('formatBtn'),
  saveBtn: document.getElementById('saveBtn'),
  themeButtons: document.querySelectorAll('.theme-btn'),
  toolButtons: document.querySelectorAll('.tool-btn'),
  selectedColor: '#111111',
  isDrawing: false,
  brush: Number(document.getElementById('brushSize').value),
  currentTheme: 'light',
  currentTool: 'brush',
  lastPoint: null,
  shadowEnabled: false,
  shadowDirection: 'baixo',
  tempCircle: null,
  tempShape: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  fillThreshold: 20,
  bgAnimationActive: true,
  frameModeEnabled: true,
  bgFps: Number(document.getElementById('fpsSlider')?.value || 24),
  bgPoints: Number(document.getElementById('bgPointsSlider')?.value || 18),
  backgroundPoints: [],
  animationFrameId: null,
  frames: [],
  playbackTimer: null,
  isPlaying: false,
  frameIndex: 0
};

function getCanvasContext() {
  return app.canvas.getContext('2d');
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = value => value.toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function colorDistance(a, b) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return Math.sqrt((ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2);
}

function setTheme(theme) {
  app.currentTheme = theme;
  document.body.setAttribute('data-theme', theme);

  app.themeButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });

  generateBackgroundPoints();
  drawBackgroundFrame();
  clearCanvas(false);
}

function makePalette() {
  if (!app.palette) return;
  app.palette.innerHTML = '';

  paletteColors.forEach(color => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'color-btn';
    button.title = color.name;
    button.style.background = color.value;
    button.dataset.color = color.value;

    if (color.value.toLowerCase() === app.selectedColor.toLowerCase()) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      app.selectedColor = color.value;
      document.querySelectorAll('.color-btn').forEach(item => {
        item.classList.toggle('active', item.dataset.color.toLowerCase() === app.selectedColor.toLowerCase());
      });
    });

    app.palette.appendChild(button);
  });
}

function generateBackgroundPoints() {
  if (!app.bgCanvas || !app.bgCtx) return;

  const width = app.bgCanvas.width;
  const height = app.bgCanvas.height;
  const points = [];

  for (let i = 0; i < app.bgPoints; i += 1) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      r: 1.5 + Math.random() * 3.5,
      alpha: 0.25 + Math.random() * 0.75,
      hue: 180 + Math.random() * 180
    });
  }

  app.backgroundPoints = points;
}

function drawBackgroundFrame() {
  if (!app.bgCanvas || !app.bgCtx) return;

  const ctx = app.bgCtx;
  ctx.clearRect(0, 0, app.bgCanvas.width, app.bgCanvas.height);

  const themeGradient = app.currentTheme === 'dark'
    ? 'rgba(9, 18, 30, 1)'
    : 'rgba(238, 244, 255, 1)';

  ctx.fillStyle = themeGradient;
  ctx.fillRect(0, 0, app.bgCanvas.width, app.bgCanvas.height);

  const glow = ctx.createRadialGradient(
    app.bgCanvas.width * 0.5,
    app.bgCanvas.height * 0.5,
    20,
    app.bgCanvas.width * 0.5,
    app.bgCanvas.height * 0.5,
    Math.max(app.bgCanvas.width, app.bgCanvas.height) * 0.7
  );
  glow.addColorStop(0, app.currentTheme === 'dark' ? 'rgba(79, 140, 255, 0.18)' : 'rgba(120, 180, 255, 0.14)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, app.bgCanvas.width, app.bgCanvas.height);

  app.backgroundPoints.forEach(point => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > app.bgCanvas.width) point.vx *= -1;
    if (point.y < 0 || point.y > app.bgCanvas.height) point.vy *= -1;

    point.x = Math.min(Math.max(point.x, 0), app.bgCanvas.width);
    point.y = Math.min(Math.max(point.y, 0), app.bgCanvas.height);

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${point.hue}, 80%, 65%, ${point.alpha})`;
    ctx.fill();
  });
}

function startBackgroundAnimation() {
  if (!app.bgCanvas) return;
  if (app.animationFrameId) {
    cancelAnimationFrame(app.animationFrameId);
    app.animationFrameId = null;
  }

  const frameDelay = 1000 / Math.max(1, app.bgFps);
  let lastTick = 0;

  const tick = (timestamp) => {
    if (app.bgAnimationActive && timestamp - lastTick >= frameDelay) {
      drawBackgroundFrame();
      lastTick = timestamp;
    }
    app.animationFrameId = requestAnimationFrame(tick);
  };

  app.animationFrameId = requestAnimationFrame(tick);
}

function updateFpsLabel() {
  const fpsValue = document.getElementById('fpsValue');
  if (fpsValue) {
    fpsValue.textContent = String(app.bgFps);
  }
}

function setFrameControlsEnabled(enabled) {
  const newFrameBtn = document.getElementById('newFrameBtn');
  const saveFrameBtn = document.getElementById('saveFrameBtn');
  const playFramesBtn = document.getElementById('playFramesBtn');

  if (newFrameBtn) {
    newFrameBtn.disabled = !enabled;
  }

  if (saveFrameBtn) {
    saveFrameBtn.disabled = !enabled;
  }

  if (playFramesBtn) {
    playFramesBtn.disabled = !enabled || app.frames.length === 0;
  }
}

function toggleAnimation() {
  app.bgAnimationActive = !app.bgAnimationActive;
  app.frameModeEnabled = app.bgAnimationActive;

  const button = document.getElementById('toggleAnimationBtn');
  if (button) {
    button.textContent = app.bgAnimationActive ? 'Animação: Ligada' : 'Animação: Desligada';
  }

  setFrameControlsEnabled(app.frameModeEnabled);

  if (app.bgAnimationActive) {
    drawBackgroundFrame();
  }
}

function updateFrameStatus() {
  const status = document.getElementById('frameStatus');
  const totalFrames = Math.max(1, app.frames.length || 1);
  const currentFrame = app.frames.length > 0 ? app.frameIndex + 1 : 1;

  if (status) {
    status.textContent = `Quadro ${Math.min(currentFrame, totalFrames)}/${totalFrames}`;
  }
}

function renderFrameStrip() {
  const frameStrip = document.getElementById('frameStrip');
  if (!frameStrip) return;

  frameStrip.innerHTML = '';
  frameStrip.style.gridTemplateColumns = 'repeat(4, 110px)';

  if (!app.frames.length) {
    frameStrip.innerHTML = '<span class="frame-empty">Nenhum quadro</span>';
    return;
  }

  app.frames.forEach((frame, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'frame-item';
    if (index === app.frameIndex) {
      item.classList.add('active');
    }

    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 150;
    previewCanvas.height = 90;

    const previewCtx = previewCanvas.getContext('2d');
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = frame.width;
    sourceCanvas.height = frame.height;
    const sourceCtx = sourceCanvas.getContext('2d');
    sourceCtx.putImageData(frame, 0, 0);
    previewCtx.drawImage(sourceCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

    const label = document.createElement('span');
    label.textContent = `Quadro ${index + 1}`;

    item.appendChild(previewCanvas);
    item.appendChild(label);

    item.addEventListener('click', () => {
      stopPlayback();
      saveCurrentFrame();
      renderStoredFrame(index);
    });

    frameStrip.appendChild(item);
  });
}

function saveCurrentFrame() {
  if (!app.frameModeEnabled || !app.ctx) return;

  const snapshot = app.ctx.getImageData(0, 0, app.canvas.width, app.canvas.height);

  if (app.frames.length === 0) {
    app.frames.push(snapshot);
    app.frameIndex = 0;
  } else {
    app.frames[app.frameIndex] = snapshot;
  }

  updateFrameStatus();
  renderFrameStrip();
  setFrameControlsEnabled(app.frameModeEnabled);
}

function createBlankFrame() {
  if (!app.frameModeEnabled || !app.ctx) return;

  stopPlayback();
  saveCurrentFrame();

  const blankFrame = app.ctx.createImageData(app.canvas.width, app.canvas.height);
  const bg = getComputedStyle(document.body).getPropertyValue('--canvas-bg').trim();
  const rgb = hexToRgb(bg.replace('#', '') === 'fff' ? '#ffffff' : bg);

  for (let i = 0; i < blankFrame.data.length; i += 4) {
    blankFrame.data[i] = rgb.r;
    blankFrame.data[i + 1] = rgb.g;
    blankFrame.data[i + 2] = rgb.b;
    blankFrame.data[i + 3] = 255;
  }

  app.frames.push(blankFrame);
  app.frameIndex = app.frames.length - 1;
  app.ctx.putImageData(blankFrame, 0, 0);
  updateFrameStatus();
  renderFrameStrip();

  const playFramesBtn = document.getElementById('playFramesBtn');
  if (playFramesBtn) {
    playFramesBtn.disabled = false;
  }
}

function copyCurrentFrame() {
  if (!app.frameModeEnabled || !app.ctx) return;

  saveCurrentFrame();

  const sourceFrame = app.frames[app.frameIndex];
  const copyFrame = new ImageData(
    new Uint8ClampedArray(sourceFrame.data),
    sourceFrame.width,
    sourceFrame.height
  );

  app.frames.splice(app.frameIndex + 1, 0, copyFrame);
  app.frameIndex = app.frameIndex + 1;
  renderStoredFrame(app.frameIndex);
  updateFrameStatus();
  renderFrameStrip();
}

function renderStoredFrame(index) {
  if (!app.frames.length || !app.frames[index]) return;
  app.ctx.putImageData(app.frames[index], 0, 0);
  app.frameIndex = index;
  updateFrameStatus();
  renderFrameStrip();
}

function goToFrame(direction) {
  if (!app.frames.length) return;

  saveCurrentFrame();
  const nextIndex = (app.frameIndex + direction + app.frames.length) % app.frames.length;
  renderStoredFrame(nextIndex);
  stopPlayback();
}

function deleteCurrentFrame() {
  if (!app.frames.length) return;

  stopPlayback();
  app.frames.splice(app.frameIndex, 1);

  if (app.frames.length === 0) {
    app.frameIndex = 0;
    clearCanvas(false);
  } else {
    app.frameIndex = Math.min(app.frameIndex, app.frames.length - 1);
    renderStoredFrame(app.frameIndex);
  }

  updateFrameStatus();
  renderFrameStrip();
  setFrameControlsEnabled(app.frameModeEnabled);

  const playFramesBtn = document.getElementById('playFramesBtn');
  if (playFramesBtn) {
    playFramesBtn.disabled = app.frames.length === 0;
  }
}

function stopPlayback() {
  app.isPlaying = false;

  if (app.playbackTimer) {
    clearTimeout(app.playbackTimer);
    app.playbackTimer = null;
  }

  const playFramesBtn = document.getElementById('playFramesBtn');
  if (playFramesBtn) {
    playFramesBtn.textContent = 'Play';
  }
}

function playFrames() {
  if (!app.frameModeEnabled || app.frames.length === 0) return;

  if (app.isPlaying) {
    stopPlayback();
    return;
  }

  saveCurrentFrame();
  app.isPlaying = true;

  const playFramesBtn = document.getElementById('playFramesBtn');
  if (playFramesBtn) {
    playFramesBtn.textContent = 'Pausar';
  }

  let current = app.frameIndex >= 0 ? app.frameIndex : 0;

  const tick = () => {
    if (!app.isPlaying) return;

    const frameCount = app.frames.length;
    const activeIndex = current % frameCount;
    renderStoredFrame(activeIndex);
    current = (activeIndex + 1) % frameCount;

    const delay = 1000 / Math.max(1, app.bgFps);
    app.playbackTimer = setTimeout(tick, delay);
  };

  tick();
}

function toggleColorPanel() {
  if (!app.palette) return;
  const isHidden = app.palette.classList.toggle('hidden');
  if (app.colorToggleBtn) {
    app.colorToggleBtn.textContent = isHidden ? '🎨 Cores' : '🎨 Fechar';
  }
}

function clearCanvas(keepHint = true) {
  const bg = getComputedStyle(document.body).getPropertyValue('--canvas-bg').trim();
  app.ctx.fillStyle = bg;
  app.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

  if (keepHint) {
    app.ctx.fillStyle = '#777';
    app.ctx.font = '20px Arial';
    app.ctx.fillText('Desenhe aqui', 24, 36);
  }
}

function formatDrawingArea() {
  stopPlayback();
  app.frames = [];
  app.frameIndex = 0;
  app.canvas.width = 640;
  app.canvas.height = 480;
  app.ctx = app.canvas.getContext('2d');
  app.rotation = 0;
  const rotateSlider = document.getElementById('rotateSlider');
  if (rotateSlider) rotateSlider.value = '0';
  app.zoom = 1;
  app.panX = 0;
  app.panY = 0;
  applyCanvasTransform();
  clearCanvas(false);
  updateFrameStatus();
  renderFrameStrip();
  setFrameControlsEnabled(app.frameModeEnabled);
}

function frameToCanvas(frame) {
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = frame.width;
  sourceCanvas.height = frame.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  sourceCtx.putImageData(frame, 0, 0);
  return sourceCanvas;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function saveDrawingPng() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  app.canvas.toBlob(blob => {
    if (blob) {
      downloadBlob(blob, `arthur-desenho-${timestamp}.png`);
    }
  }, 'image/png');
}

function bytesToBase64(bytes) {
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8ClampedArray(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function saveAnimationProject() {
  saveCurrentFrame();

  if (!app.frames.length) return;

  const project = {
    format: 'ArthurDesenhoProjeto',
    version: 1,
    canvas: {
      width: app.canvas.width,
      height: app.canvas.height
    },
    fps: app.bgFps,
    currentFrame: app.frameIndex,
    frames: app.frames.map(frame => ({
      width: frame.width,
      height: frame.height,
      pixels: bytesToBase64(frame.data)
    }))
  };
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
  downloadBlob(blob, `arthur-projeto-${timestamp}.json`);
}

function loadAnimationProject(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const project = JSON.parse(reader.result);
      const canvasWidth = Number(project?.canvas?.width);
      const canvasHeight = Number(project?.canvas?.height);

      if (project?.format !== 'ArthurDesenhoProjeto' || project?.version !== 1 ||
          !Number.isInteger(canvasWidth) || !Number.isInteger(canvasHeight) ||
          canvasWidth < 1 || canvasHeight < 1 || !Array.isArray(project.frames) || !project.frames.length) {
        throw new Error('Este não é um projeto de animação válido.');
      }

      const restoredFrames = project.frames.map(frame => {
        if (frame?.width !== canvasWidth || frame?.height !== canvasHeight || typeof frame?.pixels !== 'string') {
          throw new Error('Um quadro do projeto está inválido.');
        }

        const pixels = base64ToBytes(frame.pixels);
        if (pixels.length !== canvasWidth * canvasHeight * 4) {
          throw new Error('Um quadro do projeto está incompleto.');
        }

        return new ImageData(pixels, canvasWidth, canvasHeight);
      });

      stopPlayback();
      app.canvas.width = canvasWidth;
      app.canvas.height = canvasHeight;
      app.ctx = getCanvasContext();
      app.frames = restoredFrames;
      app.bgFps = Math.min(60, Math.max(1, Number(project.fps) || 24));
      app.frameIndex = Math.min(Math.max(0, Number(project.currentFrame) || 0), app.frames.length - 1);

      const fpsSlider = document.getElementById('fpsSlider');
      if (fpsSlider) fpsSlider.value = String(app.bgFps);
      updateFpsLabel();
      renderStoredFrame(app.frameIndex);
      setFrameControlsEnabled(app.frameModeEnabled);
    } catch (error) {
      alert(`Não foi possível abrir o projeto: ${error.message}`);
    }
  };
  reader.onerror = () => alert('Não foi possível ler esse arquivo de projeto.');
  reader.readAsText(file);
}

function saveArtworkGif92x48() {
  saveCurrentFrame();

  if (!app.frames.length) {
    return;
  }

  const width = 92;
  const height = 48;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (typeof window.GIF === 'function') {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: './gif.worker.js',
      background: '#ffffff'
    });

    app.frames.forEach(frame => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(frameToCanvas(frame), 0, 0, width, height);
      gif.addFrame(tempCanvas, { copy: true, delay: 1000 / Math.max(1, app.bgFps) });
    });

    gif.on('finished', blob => {
      downloadBlob(blob, `arthur-animacao-${timestamp}.gif`);
    });

    gif.render();
    return;
  }

  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = width;
  fallbackCanvas.height = height;
  const fallbackCtx = fallbackCanvas.getContext('2d');
  fallbackCtx.imageSmoothingEnabled = false;
  fallbackCtx.drawImage(frameToCanvas(app.frames[app.frames.length - 1]), 0, 0, width, height);
  fallbackCanvas.toBlob(blob => {
    if (blob) {
      downloadBlob(blob, `arthur-animacao-${timestamp}.png`);
    }
  }, 'image/png');
}

function getPointerPosition(event) {
  const rect = app.canvas.getBoundingClientRect();
  const scaleX = app.canvas.width / rect.width;
  const scaleY = app.canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function drawLine(from, to, color, width) {
  app.ctx.beginPath();
  app.ctx.moveTo(from.x, from.y);
  app.ctx.lineTo(to.x, to.y);
  app.ctx.strokeStyle = color;
  app.ctx.lineWidth = width;
  app.ctx.lineCap = 'round';
  app.ctx.lineJoin = 'round';
  app.ctx.stroke();
}

function startDrawing(event) {
  const point = getPointerPosition(event);
  app.lastPoint = point;

  if (app.currentTool === 'fill') {
    fillConnectedArea(point.x, point.y, app.selectedColor);
    return;
  }

  app.isDrawing = true;

  if (app.currentTool === 'circle') {
    app.tempCircle = { x: point.x, y: point.y, radius: 0 };
    return;
  }

  if (['square', 'rectangle', 'roundedRect', 'triangle'].includes(app.currentTool)) {
    app.tempShape = {
      type: app.currentTool,
      start: point,
      end: point,
      snapshot: app.ctx.getImageData(0, 0, app.canvas.width, app.canvas.height)
    };
    return;
  }

  if (app.currentTool === 'eraser') {
    drawLine(point, point, '#ffffff', app.brush * 2.2);
    return;
  }

  if (app.currentTool === 'shadow') {
    drawShadowBrush(point.x, point.y, app.selectedColor);
    return;
  }

  drawLine(point, point, app.selectedColor, app.brush);
}

function draw(event) {
  if (!app.isDrawing) return;

  const point = getPointerPosition(event);

  if (app.currentTool === 'circle') {
    const dx = point.x - app.tempCircle.x;
    const dy = point.y - app.tempCircle.y;
    app.tempCircle.radius = Math.sqrt(dx * dx + dy * dy);
    renderCirclePreview();
    return;
  }

  if (['square', 'rectangle', 'roundedRect', 'triangle'].includes(app.currentTool)) {
    if (!app.tempShape) return;
    app.tempShape.end = point;
    renderShapePreview();
    return;
  }

  if (app.currentTool === 'eraser') {
    drawLine(app.lastPoint, point, '#ffffff', app.brush * 2.2);
  } else if (app.currentTool === 'shadow') {
    drawShadowBrush(point.x, point.y, app.selectedColor);
  } else {
    drawLine(app.lastPoint, point, app.selectedColor, app.brush);
  }

  app.lastPoint = point;
}

function renderCirclePreview() {
  const previous = app.ctx.getImageData(0, 0, app.canvas.width, app.canvas.height);
  app.ctx.putImageData(previous, 0, 0);
  app.ctx.beginPath();
  app.ctx.arc(app.tempCircle.x, app.tempCircle.y, app.tempCircle.radius, 0, Math.PI * 2);
  app.ctx.strokeStyle = app.selectedColor;
  app.ctx.lineWidth = app.brush;
  app.ctx.stroke();
}

function renderShapePreview() {
  if (!app.tempShape) return;
  app.ctx.putImageData(app.tempShape.snapshot, 0, 0);
  drawPerfectShape(app.tempShape.start, app.tempShape.end, app.tempShape.type, app.selectedColor, app.brush);
}

function drawPerfectShape(start, end, type, color, width) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;
  const angle = (app.rotation * Math.PI) / 180;

  app.ctx.save();
  app.ctx.translate(centerX, centerY);
  app.ctx.rotate(angle);
  app.ctx.translate(-centerX, -centerY);
  app.ctx.beginPath();
  app.ctx.strokeStyle = color;
  app.ctx.lineWidth = width;
  app.ctx.lineJoin = 'round';

  if (type === 'square') {
    const side = Math.max(Math.abs(dx), Math.abs(dy)) || 80;
    const widthSign = Math.sign(dx) || 1;
    const heightSign = Math.sign(dy) || 1;
    const x2 = start.x + side * widthSign;
    const y2 = start.y;
    const x3 = start.x + side * widthSign;
    const y3 = start.y + side * heightSign;
    const x4 = start.x;
    const y4 = start.y + side * heightSign;

    app.ctx.moveTo(start.x, start.y);
    app.ctx.lineTo(x2, y2);
    app.ctx.lineTo(x3, y3);
    app.ctx.lineTo(x4, y4);
    app.ctx.closePath();
    app.ctx.stroke();
    app.ctx.restore();
    return;
  }

  if (type === 'rectangle') {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(dx) || 80;
    const h = Math.abs(dy) || 80;
    app.ctx.rect(x, y, w, h);
    app.ctx.stroke();
    app.ctx.restore();
    return;
  }

  if (type === 'roundedRect') {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(dx) || 80;
    const h = Math.abs(dy) || 80;
    const radius = Math.min(w, h) * 0.2;

    if (typeof app.ctx.roundRect === 'function') {
      app.ctx.roundRect(x, y, w, h, radius);
    } else {
      const r = Math.min(radius, w / 2, h / 2);
      app.ctx.moveTo(x + r, y);
      app.ctx.lineTo(x + w - r, y);
      app.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      app.ctx.lineTo(x + w, y + h - r);
      app.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      app.ctx.lineTo(x + r, y + h);
      app.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      app.ctx.lineTo(x, y + r);
      app.ctx.quadraticCurveTo(x, y, x + r, y);
    }

    app.ctx.stroke();
    app.ctx.restore();
    return;
  }

  if (type === 'triangle') {
    const baseX = end.x;
    const baseY = start.y;
    const apexX = start.x + dx / 2;
    const apexY = end.y;

    app.ctx.moveTo(start.x, start.y);
    app.ctx.lineTo(baseX, baseY);
    app.ctx.lineTo(apexX, apexY);
    app.ctx.closePath();
    app.ctx.stroke();
    app.ctx.restore();
    return;
  }

  app.ctx.restore();
}

function stopDrawing(event) {
  if (app.currentTool === 'circle' && app.tempCircle) {
    const point = getPointerPosition(event || { clientX: app.tempCircle.x, clientY: app.tempCircle.y });
    const dx = point.x - app.tempCircle.x;
    const dy = point.y - app.tempCircle.y;
    const radius = Math.sqrt(dx * dx + dy * dy) || 40;
    app.ctx.beginPath();
    app.ctx.save();
    app.ctx.translate(app.tempCircle.x, app.tempCircle.y);
    app.ctx.rotate((app.rotation * Math.PI) / 180);
    app.ctx.beginPath();
    app.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    app.ctx.restore();
    app.ctx.strokeStyle = app.selectedColor;
    app.ctx.lineWidth = app.brush;
    app.ctx.stroke();
    app.tempCircle = null;
  }

  if (['square', 'rectangle', 'roundedRect', 'triangle'].includes(app.currentTool) && app.tempShape) {
    const { start, end, type } = app.tempShape;
    const dist = Math.hypot(end.x - start.x, end.y - start.y);
    const finalEnd = dist < 4 ? {
      x: start.x + 80,
      y: start.y + 80
    } : end;

    app.ctx.putImageData(app.tempShape.snapshot, 0, 0);
    drawPerfectShape(start, finalEnd, type, app.selectedColor, app.brush);
    app.tempShape = null;
  }

  app.isDrawing = false;
  app.lastPoint = null;
}

function drawShadowBrush(x, y, baseColor) {
  const offsetX = 10;
  const offsetY = 12;
  const shadowColor = colorDistance(baseColor, '#ffffff') < 30 ? 'rgba(120,120,120,0.35)' : 'rgba(0,0,0,0.23)';

  drawLine({ x, y }, { x: x + offsetX, y: y + offsetY }, shadowColor, Math.max(1, app.brush / 2));
  drawLine({ x: x - 8, y: y + 8 }, { x: x + offsetX - 8, y: y + offsetY + 8 }, shadowColor, Math.max(1, app.brush / 2));
}

function getPixelColor(data, x, y) {
  const index = (Math.floor(y) * app.canvas.width + Math.floor(x)) * 4;
  return rgbToHex(data[index], data[index + 1], data[index + 2]);
}

function setPixelColor(data, x, y, color) {
  const index = (Math.floor(y) * app.canvas.width + Math.floor(x)) * 4;
  const rgb = hexToRgb(color);
  data[index] = rgb.r;
  data[index + 1] = rgb.g;
  data[index + 2] = rgb.b;
  data[index + 3] = 255;
}

function fillConnectedArea(x, y, fillColor) {
  const imageData = app.ctx.getImageData(0, 0, app.canvas.width, app.canvas.height);
  const data = imageData.data;
  const target = getPixelColor(data, x, y);

  if (colorDistance(target, fillColor) < 5) return;

  const stack = [[Math.floor(x), Math.floor(y)]];
  const visited = new Set();

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= app.canvas.width || cy >= app.canvas.height) continue;

    const key = `${cx},${cy}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const currentColor = getPixelColor(data, cx, cy);
    if (colorDistance(currentColor, target) > app.fillThreshold) continue;

    setPixelColor(data, cx, cy, fillColor);

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  app.ctx.putImageData(imageData, 0, 0);
}

function updateToolState() {
  app.toolButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tool === app.currentTool);
  });
}

function applyCanvasTransform() {
  app.canvas.style.transform = `scale(${app.zoom})`;
  app.canvas.style.transformOrigin = 'center center';
}

function setZoom(nextZoom, originX = 50, originY = 50) {
  app.zoom = Math.min(3, Math.max(0.5, nextZoom));
  app.canvas.style.transformOrigin = `${originX}% ${originY}%`;
  app.canvas.style.transform = `scale(${app.zoom})`;
}

function setupEvents() {
  app.canvas.addEventListener('pointerdown', startDrawing);
  app.canvas.addEventListener('pointermove', draw);
  app.canvas.addEventListener('pointerup', stopDrawing);
  app.canvas.addEventListener('pointerleave', stopDrawing);
  app.canvas.addEventListener('pointercancel', stopDrawing);
  app.canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = app.canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const originX = (pointerX / rect.width) * 100;
    const originY = (pointerY / rect.height) * 100;
    const direction = event.deltaY < 0 ? 1.15 : 0.85;
    setZoom(app.zoom * direction, originX, originY);
  }, { passive: false });

  app.brushSize.addEventListener('input', event => {
    app.brush = Number(event.target.value);
  });

  document.getElementById('zoomInBtn')?.addEventListener('click', () => {
    setZoom(app.zoom + 0.15, 50, 50);
  });

  document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
    setZoom(app.zoom - 0.15, 50, 50);
  });

  document.getElementById('resetZoomBtn')?.addEventListener('click', () => {
    app.zoom = 1;
    app.panX = 0;
    app.panY = 0;
    applyCanvasTransform();
  });

  document.getElementById('rotateSlider')?.addEventListener('input', (event) => {
    app.rotation = Number(event.target.value);
  });

  const fpsSlider = document.getElementById('fpsSlider');
  const bgPointsSlider = document.getElementById('bgPointsSlider');

  fpsSlider?.addEventListener('input', (event) => {
    app.bgFps = Number(event.target.value);
    updateFpsLabel();
    startBackgroundAnimation();

    if (app.isPlaying) {
      stopPlayback();
      playFrames();
    }
  });

  bgPointsSlider?.addEventListener('input', (event) => {
    app.bgPoints = Number(event.target.value);
    generateBackgroundPoints();
    drawBackgroundFrame();
  });

  document.getElementById('toggleAnimationBtn')?.addEventListener('click', toggleAnimation);
  document.getElementById('saveFrameBtn')?.addEventListener('click', saveCurrentFrame);
  document.getElementById('newFrameBtn')?.addEventListener('click', createBlankFrame);
  document.getElementById('copyFrameBtn')?.addEventListener('click', copyCurrentFrame);
  document.getElementById('saveProjectBtn')?.addEventListener('click', saveAnimationProject);
  document.getElementById('loadProjectBtn')?.addEventListener('click', () => {
    document.getElementById('projectFileInput')?.click();
  });
  document.getElementById('projectFileInput')?.addEventListener('change', event => {
    loadAnimationProject(event.target.files?.[0]);
    event.target.value = '';
  });
  document.getElementById('playFramesBtn')?.addEventListener('click', playFrames);
  document.getElementById('prevFrameBtn')?.addEventListener('click', () => goToFrame(-1));
  document.getElementById('nextFrameBtn')?.addEventListener('click', () => goToFrame(1));
  document.getElementById('deleteFrameBtn')?.addEventListener('click', deleteCurrentFrame);

  app.colorToggleBtn?.addEventListener('click', toggleColorPanel);
  app.clearBtn.addEventListener('click', () => clearCanvas(false));
  app.formatBtn.addEventListener('click', formatDrawingArea);
  document.getElementById('saveDrawingBtn')?.addEventListener('click', saveDrawingPng);
  app.saveBtn.addEventListener('click', saveArtworkGif92x48);

  app.themeButtons.forEach(button => {
    button.addEventListener('click', () => setTheme(button.dataset.theme));
  });

  app.toolButtons.forEach(button => {
    button.addEventListener('click', () => {
      app.currentTool = button.dataset.tool;
      updateToolState();
    });
  });
}

function init() {
  app.ctx = getCanvasContext();
  app.bgCtx = app.bgCanvas?.getContext('2d');
  makePalette();
  generateBackgroundPoints();
  setupEvents();
  app.zoom = 1;
  app.panX = 0;
  app.panY = 0;
  applyCanvasTransform();
  clearCanvas(false);
  app.frames = [];
  app.frameIndex = 0;
  updateFrameStatus();
  renderFrameStrip();
  drawBackgroundFrame();
  startBackgroundAnimation();
  updateFpsLabel();
  setFrameControlsEnabled(app.frameModeEnabled);
  updateToolState();

  const toggleBtn = document.getElementById('toggleAnimationBtn');
  if (toggleBtn) {
    toggleBtn.textContent = app.bgAnimationActive ? 'Animação: Ligada' : 'Animação: Desligada';
  }
}

init();
