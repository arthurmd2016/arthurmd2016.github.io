(() => {
  "use strict";
  function create() {
    const state = { time: 0, scroll: 0, x: 240, jump: 0, lives: 3, immune: 0, spawn: 2, obstacles: [], phase: "run", pointer: null,
      pencil: { x: 570 + Math.random() * 200, y: 305 + Math.random() * 65 }, hovered: false, ending: 0 };
    const jumpHeight = () => Math.sin(state.jump / .85 * Math.PI) * 135;
    function jump() { if (state.phase === "run" && state.jump === 0) state.jump = .85; }
    function update(dt, keys) {
      if (state.phase === "ending") { state.ending += dt; if (state.ending >= 7) state.phase = "home"; return state.phase; }
      if (state.phase !== "run") return state.phase;
      state.time += dt; state.scroll += (270 + state.time * 2) * dt;
      state.jump = Math.max(0, state.jump - dt); state.immune = Math.max(0, state.immune - dt);
      state.x = Math.max(150, Math.min(390, state.x + (Number(keys.has("right")) - Number(keys.has("left"))) * 160 * dt));
      state.spawn -= dt;
      if (state.spawn <= 0) {
        state.obstacles.push({ x: 1000, w: 36 + Math.random() * 22, h: 40 + Math.random() * 22 });
        state.spawn = 1.8 + Math.random() * .5;
      }
      for (const rock of state.obstacles) {
        rock.x -= (270 + state.time * 2) * dt;
        if (!rock.hit && state.immune === 0 && rock.x < state.x + 20 && rock.x + rock.w > state.x - 20 && jumpHeight() < rock.h) {
          rock.hit = true; state.lives--; state.immune = 1.3;
          if (state.lives <= 0) { state.phase = "lost"; return "lost"; }
        }
      }
      state.obstacles = state.obstacles.filter((rock) => rock.x > -100);
      if (state.time >= 30) { state.phase = "search"; state.pointer = null; return "search"; }
      return "run";
    }
    function point(x, y) {
      if (state.phase !== "search") return false;
      state.pointer = { x, y };
      state.hovered = Math.hypot(x - state.pencil.x, y - state.pencil.y) < 38;
      return state.hovered;
    }
    function click(x, y) {
      if (state.phase !== "search" || !point(x, y)) return false;
      state.phase = "ending"; state.ending = 0; return true;
    }
    return { state, jumpHeight, jump, update, point, click };
  }
  function draw(ctx, session, time, person) {
    const s = session.state, search = ["search", "ending"].includes(s.phase);
    ctx.fillStyle = "#c1e4ef"; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = "#b0aad7";
    for (let i = 0; i < 6; i++) {
      const x = i * 240 - s.scroll * .2 % 240;
      ctx.beginPath(); ctx.moveTo(x - 80, 440); ctx.lineTo(x + 70, 130 + i % 2 * 50); ctx.lineTo(x + 230, 440); ctx.fill();
    }
    ctx.fillStyle = "#81b982"; ctx.fillRect(0, 360, 960, 180);
    ctx.fillStyle = "#d9ba86"; ctx.fillRect(0, 440, 960, 100);
    if (!search) {
      for (let i = 0; i < 15; i++) { ctx.fillStyle = "#b18d63"; ctx.fillRect(i * 100 - s.scroll % 100, 478 + i % 3 * 15, 30, 4); }
      person(s.x - 85, 440 - session.jumpHeight(), "reverse", Math.sin(time / 100) * 12);
      if (!s.immune || Math.floor(time / 100) % 2 === 0) person(s.x, 440 - session.jumpHeight(), "arthur", Math.sin(time / 100) * 12);
      for (const rock of s.obstacles) {
        ctx.fillStyle = "#736b7a"; ctx.beginPath(); ctx.ellipse(rock.x + rock.w / 2, 440 - rock.h / 2, rock.w / 2, rock.h / 2, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#163b47"; ctx.font = "bold 24px Arial"; ctx.textAlign = "left";
      ctx.fillText(`Chances: ${s.lives}`, 20, 40); ctx.textAlign = "right";
      ctx.fillText(`Lugar do lápis: ${Math.max(0, Math.ceil(30 - s.time))}s`, 940, 40);
    } else {
      ctx.fillStyle = "#a78065"; ctx.fillRect(470, 235, 380, 160); ctx.fillStyle = "#725745"; ctx.fillRect(485, 250, 350, 128);
      for (let i = 0; i < 18; i++) {
        const x = 500 + i * 18, y = 270 + i % 4 * 25;
        ctx.fillStyle = ["#a19b78", "#b29266", "#777e70"][i % 3]; ctx.fillRect(x, y, 32, 13);
      }
      const picked = s.phase === "ending" && s.ending > 2;
      if (!picked) {
        ctx.save(); ctx.translate(s.pencil.x, s.pencil.y); ctx.rotate(-.4);
        ctx.fillStyle = s.hovered ? "#ffe77e" : "#c8a56b"; ctx.fillRect(-23, -4, 46, 8);
        ctx.fillStyle = "#f4d6a2"; ctx.beginPath(); ctx.moveTo(23, -4); ctx.lineTo(34, 0); ctx.lineTo(23, 4); ctx.fill();
        ctx.fillStyle = "#353443"; ctx.fillRect(31, -1, 4, 2); ctx.restore();
      }
      if (s.phase === "search" && s.pointer) {
        ctx.strokeStyle = s.hovered ? "#fff2a0" : "#e7f9ff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(s.pointer.x, s.pointer.y, 44, 0, Math.PI * 2); ctx.stroke();
      }
      let reverseX = s.phase === "ending" ? 320 + Math.min(1, s.ending / 2) * (s.pencil.x - 320) : 320;
      if (s.phase === "ending" && s.ending > 4) reverseX = s.pencil.x + Math.min(1, (s.ending - 4) / 2.5) * (390 - s.pencil.x);
      person(reverseX, 440, "reverse", s.phase === "ending" && s.ending < 2 ? Math.sin(time / 90) * 10 : 0);
      const arthurX = s.phase === "ending" && s.ending > 4 ? 220 + Math.min(1, (s.ending - 4) / 2) * 165 : 220;
      person(arthurX, 440, "arthur");
      if (picked) { ctx.fillStyle = "#ffe37a"; ctx.fillRect(reverseX + 30, 370, 40, 7); }
      if (s.phase === "ending" && s.ending > 3) {
        const glow = ctx.createRadialGradient(390, 325, 5, 390, 325, 100);
        glow.addColorStop(0, "#dcffe7"); glow.addColorStop(.65, "#42e8a0"); glow.addColorStop(1, "#42e8a000");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(390, 325, 75, 125, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  window.ArthurRunner = { create, draw };
})();
