(() => {
  "use strict";
  function create() {
    const children = Array.from({ length: 8 }, (_, i) => ({ x: 160 + i % 4 * 160, y: 235 + Math.floor(i / 4) * 100, age: i % 2 ? 10 : 9 }));
    const state = { x: 480, time: 0, courage: 3, enchantment: 100, shield: 0, cooldown: 0, immune: 0, cast: 0, spawn: 1.5, bullets: [], result: null };
    function shield() { if (!state.result && state.cooldown === 0) { state.shield = .65; state.cooldown = 1.2; } }
    function click(x, y) {
      if (state.result || state.cast > 0 || Math.hypot(x - 840, y - 165) > 45) return false;
      state.enchantment = Math.max(0, state.enchantment - 12.5); state.cast = .8;
      if (state.enchantment === 0) state.result = "won";
      return true;
    }
    function update(dt, keys) {
      if (state.result) return state.result;
      state.time += dt;
      for (const field of ["shield", "cooldown", "immune", "cast"]) state[field] = Math.max(0, state[field] - dt);
      state.x = Math.max(35, Math.min(925, state.x + (Number(keys.has("right")) - Number(keys.has("left"))) * 300 * dt));
      state.spawn -= dt;
      if (state.spawn <= 0) {
        const child = children[Math.floor(Math.random() * children.length)];
        const dx = state.x - child.x, dy = 440 - child.y, length = Math.hypot(dx, dy);
        state.bullets.push({ x: child.x, y: child.y - 35, vx: dx / length * 195, vy: dy / length * 195 });
        state.spawn = .65;
      }
      for (const b of state.bullets) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (Math.hypot(b.x - state.x, b.y - 390) < (state.shield > 0 ? 90 : 40)) {
          if (state.shield > 0) b.done = true;
          else if (state.immune === 0) { b.done = true; state.courage--; state.immune = 1.4; if (state.courage === 0) state.result = "lost"; }
        }
      }
      state.bullets = state.bullets.filter((b) => !b.done && b.x > -30 && b.x < 990 && b.y < 570);
      return state.result;
    }
    return { state, children, shield, click, update };
  }
  function draw(ctx, session, time, person, introStep = -1) {
    const s = session.state;
    if (introStep === 0) {
      ctx.fillStyle = "#15162f"; ctx.fillRect(0, 0, 960, 540);
      for (let i = 0; i < 35; i++) { ctx.fillStyle = "#eeedff"; ctx.fillRect(i * 137 % 960, i * 73 % 300, 3, 3); }
      ctx.fillStyle = "#49425c"; ctx.fillRect(160, 190, 640, 300); ctx.fillStyle = "#222336"; ctx.fillRect(440, 320, 90, 170);
      ctx.fillStyle = "#c19bf5"; ctx.font = "bold 28px Arial"; ctx.textAlign = "center"; ctx.fillText("BASE DE ARTHUR REVERSO", 480, 250);
      person(360, 490, "arthur"); person(600, 490, "princess"); return;
    }
    ctx.fillStyle = "#e6d9c6"; ctx.fillRect(0, 0, 960, 540); ctx.fillStyle = "#b29377"; ctx.fillRect(0, 360, 960, 180);
    ctx.fillStyle = "#244d43"; ctx.fillRect(80, 55, 630, 100); ctx.strokeStyle = "#855e42"; ctx.lineWidth = 8; ctx.strokeRect(80, 55, 630, 100);
    ctx.font = "bold 24px Arial"; ctx.textAlign = "center"; ctx.fillStyle = "#fff5d5"; ctx.fillText("4º ANO · TURMA DE 9 E 10 ANOS", 395, 98);
    ctx.font = "18px Arial"; ctx.fillText("Bolinhas mágicas · Escudo · Quebrar o encanto", 395, 133);
    for (let i = 0; i < session.children.length; i++) {
      const child = session.children[i]; ctx.save(); ctx.translate(child.x, child.y); ctx.scale(.65, .65);
      person(0, 0, "arthur", Math.sin(time / 220 + i) * 6); ctx.restore();
      ctx.fillStyle = "#81614a"; ctx.fillRect(child.x - 40, child.y - 22, 80, 13); ctx.fillRect(child.x - 32, child.y - 9, 5, 25); ctx.fillRect(child.x + 26, child.y - 9, 5, 25);
      ctx.fillStyle = "#3a3843"; ctx.font = "14px Arial"; ctx.fillText(`${child.age} anos`, child.x, child.y + 35);
    }
    person(840, 340, "princess");
    if (introStep === 1) person(745, 340, "reverse", Math.sin(time / 200) * 12);
    if (s.enchantment > 0) {
      ctx.strokeStyle = "#b572ea"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(840, 265, 60, 85, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = s.cast > 0 ? "#ffffff" : "#c595ff"; ctx.beginPath(); ctx.arc(840, 165, 31, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3a2452"; ctx.font = "bold 30px Arial"; ctx.fillText("✦", 840, 175);
    }
    if (s.immune === 0 || Math.floor(time / 100) % 2 === 0) person(s.x, 470, "arthur");
    if (s.shield > 0) { ctx.strokeStyle = "#52dcc0"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(s.x, 390, 90, 0, Math.PI * 2); ctx.stroke(); }
    for (const b of s.bullets) { ctx.fillStyle = "#bc8cec"; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#293144"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText(`Coragem: ${s.courage}`, 20, 30);
    ctx.textAlign = "right"; ctx.fillText(`Encanto: ${s.enchantment}%`, 940, 30);
    ctx.fillStyle = "#593d6c"; ctx.fillRect(730, 45, 210, 10); ctx.fillStyle = "#c895f5"; ctx.fillRect(730, 45, 210 * s.enchantment / 100, 10);
  }
  window.ArthurClassroom = { create, draw };
})();
