// All controls share the existing HSV sliders, preserving save/cancel behavior.
export function createColorControls() {
  const $ = id => document.getElementById(id);
  const dialog = $('colors'), wheel = $('colorWheel'), square = $('colorSquare'), stick = $('colorStick');
  const clamp = n => Math.max(0, Math.min(100, n));
  function change(id, value) {
    $(id).value = id === 'hue' ? (value + 360) % 360 : clamp(value);
    $(id).dispatchEvent(new Event('input', { bubbles: true }));
  }
  function render() {
    const h = +$('hue').value, s = +$('saturation').value, v = +$('value').value;
    const angle = h * Math.PI / 180;
    $('hueDot').style.left = `${50 + 45 * Math.sin(angle)}%`;
    $('hueDot').style.top = `${50 - 45 * Math.cos(angle)}%`;
    square.style.backgroundColor = `hsl(${h} 100% 50%)`;
    $('svDot').style.left = `${s}%`;
    $('svDot').style.top = `${100 - v}%`;
    stick.setAttribute('aria-valuenow', String(h));
    $('colorSwatch').style.background = $('colorPicker').value;
    $('colorSwatch').style.color = v * (1 - s / 150) > 55 ? '#10243a' : '#fff';
    $('colorReadout').textContent = `${$('colorPicker').value.toUpperCase()} · S ${s}% · B ${v}%`;
  }
  function direction(name, step = 2) {
    if (name === 'left' || name === 'right') change('saturation', +$('saturation').value + (name === 'right' ? step : -step));
    else change('value', +$('value').value + (name === 'up' ? step : -step));
  }
  function hueFromVector(x, y) {
    if (Math.hypot(x, y) > .18) change('hue', Math.atan2(x, -y) * 180 / Math.PI);
  }
  function drag(element, move, end = () => {}) {
    let pointer = null;
    element.addEventListener('pointerdown', e => {
      if (pointer !== null || e.button !== 0) return;
      e.preventDefault(); e.stopPropagation(); element.focus();
      pointer = e.pointerId; element.setPointerCapture(pointer); move(e);
    });
    element.addEventListener('pointermove', e => { if (pointer === e.pointerId) move(e); });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) element.addEventListener(event, e => {
      if (pointer !== e.pointerId) return;
      pointer = null; end();
    });
  }
  drag(wheel, e => {
    const r = wheel.getBoundingClientRect();
    hueFromVector((e.clientX - r.left - r.width / 2) / (r.width / 2), (e.clientY - r.top - r.height / 2) / (r.height / 2));
  });
  drag(square, e => {
    const r = square.getBoundingClientRect();
    $('saturation').value = clamp((e.clientX - r.left) / r.width * 100);
    change('value', 100 - (e.clientY - r.top) / r.height * 100);
  });
  drag(stick, e => {
    const r = stick.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const length = Math.max(1, Math.hypot(x, y));
    stick.firstElementChild.style.transform = `translate(${x / length * 26}px, ${y / length * 26}px)`;
    hueFromVector(x, y);
  }, () => { stick.firstElementChild.style.transform = ''; });
  let held = null, repeatAt = 0;
  for (const button of dialog.querySelectorAll('[data-color-direction]')) {
    button.addEventListener('click', () => direction(button.dataset.colorDirection));
    drag(button, () => { if (!held) { held = button.dataset.colorDirection; repeatAt = performance.now() + 350; } }, () => { held = null; });
  }
  dialog.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    const names = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (names[e.key]) { e.preventDefault(); direction(names[e.key]); }
    if (['a', 'd'].includes(e.key.toLowerCase())) { e.preventDefault(); change('hue', +$('hue').value + (e.key.toLowerCase() === 'd' ? 3 : -3)); }
  });
  function reset() { held = null; stick.firstElementChild.style.transform = ''; }
  dialog.addEventListener('close', reset);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  let frame = 0, padAt = 0;
  function tick(time) {
    if (!dialog.open) { frame = 0; return; }
    if (held && time >= repeatAt) { direction(held); repeatAt = time + 65; }
    const pad = Array.from(navigator.getGamepads?.() || []).find(p => p?.connected);
    if (pad && document.hasFocus() && !document.hidden) {
      hueFromVector(pad.axes[0] || 0, pad.axes[1] || 0);
      if (time >= padAt) {
        for (const [i, name] of [[12, 'up'], [13, 'down'], [14, 'left'], [15, 'right']]) if (pad.buttons[i]?.pressed) direction(name);
        padAt = time + 65;
      }
    }
    frame = requestAnimationFrame(tick);
  }
  new MutationObserver(() => { if (dialog.open && !frame) frame = requestAnimationFrame(tick); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  return render;
}
