(() => {
  "use strict";
  function create() {
    const state = { x: 100, camera: 0, progress: 0, phase: "city", flash: "Primeiro quarteirão: siga reto. As bolinhas daqui não levam a lugar nenhum." };
    const balls = [
      { x: 230, y: 320 }, { x: 420, y: 385 }, { x: 660, y: 275 },
      { x: 980, y: 310 }, { x: 1280, y: 360 }, { x: 1600, y: 260 },
      { x: 1940, y: 370, order: 1 }, { x: 1940, y: 270, order: 2 }, { x: 1940, y: 170, order: 3 },
      { x: 2150, y: 310 }, { x: 2250, y: 230 }
    ];
    function update(dt, keys) {
      if (state.phase !== "city" || state.progress > 0) return;
      state.x = Math.max(60, Math.min(2050, state.x + (Number(keys.has("right")) - Number(keys.has("left"))) * 240 * dt));
      state.camera = Math.max(0, Math.min(1440, state.x - 350));
      if (state.x > 1650) state.flash = "O sinal indica três bolinhas para cima! Clique em 1, depois 2 e depois 3.";
    }
    function click(x, y) {
      if (state.phase !== "city") return null;
      const ball = balls.find((b) => Math.hypot(b.x - state.camera - x, b.y - y) < 30);
      if (!ball) return null;
      if (!ball.order) { state.phase = "deadEnd"; state.flash = "Caminho falso! Este espaço não leva a lugar nenhum. Volte e siga reto pela cidade."; return "false"; }
      if (state.x < 1650) { state.flash = "Chegue perto do sinal antes de escolher o caminho."; return null; }
      if (ball.order !== state.progress + 1) { state.flash = "Siga o sinal: clique nas três bolinhas de baixo para cima."; return null; }
      state.progress++;
      state.flash = `${state.progress}/3 bolinhas verdadeiras! Arthur e Princesa sobem juntos.`;
      if (state.progress === 3) { state.phase = "space"; return "won"; }
      return "up";
    }
    function resume() { if (state.phase === "deadEnd") { state.phase = "city"; state.flash = "De volta à cidade! Continue reto até o sinal das três bolinhas."; } }
    return { state, balls, update, click, resume };
  }
  function draw(ctx, session, time, person) {
    const s = session.state;
    if (s.phase !== "city") {
      ctx.fillStyle = "#10132e"; ctx.fillRect(0, 0, 960, 540);
      for (let i = 0; i < 75; i++) {
        ctx.fillStyle = i % 3 ? "#e9edff" : "#7ae6cd"; ctx.beginPath(); ctx.arc((i * 139) % 960, (i * 79) % 540, 1 + i % 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#3d436d"; ctx.beginPath(); ctx.ellipse(480, 480, 260, 45, 0, 0, Math.PI * 2); ctx.fill();
      person(420, 470, "arthur"); person(550, 470, "princess");
      ctx.font = "bold 32px Arial"; ctx.textAlign = "center"; ctx.fillStyle = "#ffe36b";
      ctx.fillText(s.phase === "space" ? "Caminho verdadeiro: o espaço!" : "Caminho falso: sem saída", 480, 100);
      return;
    }
    ctx.fillStyle = "#92cde6"; ctx.fillRect(0, 0, 960, 540);
    ctx.save(); ctx.translate(-s.camera, 0);
    for (let i = 0; i < 16; i++) {
      const x = i * 160, height = 150 + i % 4 * 40;
      ctx.fillStyle = ["#758cad", "#927fb0", "#78a2ad"][i % 3]; ctx.fillRect(x, 430 - height, 140, height);
      for (let y = 445 - height; y < 390; y += 35) for (let w = 15; w < 120; w += 35) { ctx.fillStyle = "#ffedb0"; ctx.fillRect(x + w, y, 18, 22); }
    }
    ctx.fillStyle = "#b6b8bd"; ctx.fillRect(0, 430, 2400, 110); ctx.fillStyle = "#565a70"; ctx.fillRect(0, 470, 2400, 70);
    for (let i = 0; i < 24; i++) { ctx.fillStyle = "#eee6b8"; ctx.fillRect(i * 100, 509, 40, 5); }
    ctx.fillStyle = "#fff3cf"; ctx.fillRect(80, 135, 690, 65);
    ctx.font = "bold 25px Arial"; ctx.textAlign = "center"; ctx.fillStyle = "#213651"; ctx.fillText("1º quarteirão: siga reto →", 425, 177);
    ctx.strokeStyle = "#f5edb6"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1830, 440); ctx.lineTo(1830, 140); ctx.stroke();
    ctx.fillStyle = "#193e55"; ctx.fillRect(1680, 85, 380, 75); ctx.fillStyle = "#c3ffe1"; ctx.font = "bold 22px Arial";
    ctx.fillText("↑ ↑ ↑  Clique em 1, 2 e 3", 1870, 128);
    for (const b of session.balls) {
      ctx.fillStyle = b.order && b.order <= s.progress ? "#5de2b3" : "#f9d978";
      ctx.beginPath(); ctx.arc(b.x, b.y, 23 + Math.sin(time / 350) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff9cd"; ctx.lineWidth = 3; ctx.stroke();
      if (b.order) { ctx.fillStyle = "#243b53"; ctx.font = "bold 22px Arial"; ctx.fillText(String(b.order), b.x, b.y + 8); }
    }
    const x = s.progress ? 1940 : s.x;
    const feet = s.progress ? 430 - s.progress * 100 : 460;
    person(x - 35, feet, "arthur", s.progress ? 0 : Math.sin(time / 130) * 6);
    person(x - 115, feet, "princess", s.progress ? 0 : Math.sin(time / 130 + 1) * 6);
    ctx.restore(); ctx.textAlign = "left"; ctx.fillStyle = "#17384b"; ctx.font = "bold 23px Arial";
    ctx.fillText(`Caminho verdadeiro: ${s.progress}/3`, 20, 35);
  }
  window.ArthurCity = { create, draw };
})();
