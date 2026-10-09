/* Trilhas instrumentais originais. Notas em MIDI; sem samples externos. */
(() => {
  "use strict";
  const profiles = {
    beach: { title: "Sol e balanço", genre: "Pop tropical", bpm: 104, root: 60, mode: "major", lead: "sine", swing: 0.06, kick: [0, 6, 8], motif: [0, 2, 4, null, 5, 4, 2, 1, 0, null, 2, 4, 6, 5, 4, 2] },
    forest: { title: "Passos na floresta", genre: "Groove acústico", bpm: 98, root: 62, mode: "major", lead: "triangle", swing: 0.12, kick: [0, 7, 8], motif: [0, null, 2, 4, 2, 1, 0, null, 4, 5, 4, null, 2, 1, 2, 0] },
    space: { title: "Órbita dançante", genre: "Synth-pop espacial", bpm: 110, root: 57, mode: "minor", lead: "triangle", swing: 0, kick: [0, 4, 8, 12], motif: [0, 4, 7, 4, 2, 4, 6, 4, 0, 4, 7, 9, 7, 6, 4, null] },
    sea: { title: "Ondas de coral", genre: "Pop suave", bpm: 96, root: 65, mode: "major", lead: "sine", swing: 0.08, kick: [0, 8, 11], motif: [4, null, 2, 1, 0, null, 2, null, 5, 4, 2, null, 1, 2, 0, null] },
    park: { title: "Roda de alegria", genre: "Disco divertido", bpm: 112, root: 60, mode: "major", lead: "triangle", swing: 0.03, kick: [0, 4, 8, 12], motif: [0, 2, 4, null, 4, 5, 4, 2, 0, 2, 5, 4, 2, null, 1, 0] },
    castle: { title: "Baile do castelo", genre: "Fantasia e groove", bpm: 104, root: 62, mode: "minor", lead: "sine", swing: 0.08, kick: [0, 6, 8], motif: [0, 2, 4, 7, 6, 4, 2, null, 1, 3, 5, 7, 5, 3, 2, 0] },
    skate: { title: "Rodinhas no ritmo", genre: "Funk instrumental", bpm: 116, root: 64, mode: "minor", lead: "triangle", swing: 0.12, kick: [0, 3, 8, 10], motif: [0, null, 2, 4, null, 6, 4, null, 7, 6, null, 4, 2, null, 1, 0] },
    city: { title: "Luzes da cidade", genre: "Lo-fi urbano", bpm: 94, root: 57, mode: "minor", lead: "sine", swing: 0.18, kick: [0, 6, 10], motif: [4, null, 2, null, 0, 2, null, 4, 6, null, 4, 2, null, 1, 0, null] },
    volcano: { title: "Pulso de lava", genre: "Percussão e electro", bpm: 118, root: 50, mode: "minor", lead: "triangle", swing: 0.02, kick: [0, 3, 8, 11, 14], motif: [0, 0, null, 4, 2, null, 1, 0, 0, 4, 6, null, 4, 2, 1, null] },
    hiphop: { title: "Passo da rua", genre: "Hip-hop / boom bap", bpm: 92, root: 55, mode: "minor", lead: "triangle", swing: 0.2, kick: [0, 6, 9, 14], motif: [0, null, 2, null, 4, 3, null, 2, 0, null, 6, 4, null, 2, 1, null] },
    lounge: { title: "Noite de groove", genre: "Nu-disco e house", bpm: 114, root: 57, mode: "minor", lead: "sine", swing: 0.04, kick: [0, 4, 8, 12], motif: [0, 2, null, 4, 6, null, 4, 2, 7, 6, 4, null, 2, 4, 1, null] },
    seated: { title: "Baile tranquilo", genre: "Bossa e soul suave", bpm: 90, root: 60, mode: "major", lead: "sine", swing: 0.1, kick: [0, 7, 8], motif: [4, null, 2, 1, 0, null, 1, 2, 3, null, 5, 4, 2, 1, 0, null] },
    robot: { title: "Circuito do robô", genre: "Electro divertido", bpm: 100, root: 57, mode: "minor", lead: "triangle", swing: 0, kick: [0, 4, 8, 12], motif: [0, null, 0, 4, 2, null, 2, 6, 4, 2, 0, null, 6, 4, 2, null] }
  };
  const names = { "Praia": "beach", "Floresta": "forest", "Espaço": "space", "Fundo do mar": "sea", "Parque de diversões": "park", "Castelo": "castle", "Patinação": "skate", "Cidade": "city", "Vulcão": "volcano", "Estúdio Hip-Hop": "hiphop", "Lounge Adulto": "lounge", "Dança Sentada": "seated", "Robô": "robot" };
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

  function trackFor(theme) {
    const name = theme.name.replace(/ Remix \d+$/, "");
    const base = profiles[names[name]] || profiles.park;
    const remix = Number(theme.name.match(/ Remix (\d+)$/)?.[1] || 0);
    return { ...base, root: base.root + remix * 2, bpm: base.bpm + remix * 2,
      title: base.title + (remix ? ` · Variação ${remix}` : "") };
  }

  function createPlayer(context, output, track) {
    const scale = track.mode === "major" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
    const note = (degree, octave = 0) => hz(track.root + scale[((degree % 7) + 7) % 7] + 12 * (Math.floor(degree / 7) + octave));
    const tickLength = 60 / track.bpm / 4;
    const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.25), context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;

    function voice(freq, time, duration, type, volume, cutoff = 4000) {
      const osc = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    }

    function kick(time) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      osc.connect(gain); gain.connect(output);
      osc.start(time); osc.stop(time + 0.24);
    }

    function drum(time, snare, volume = 1) {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = noise;
      filter.type = "highpass";
      filter.frequency.value = snare ? 1400 : 7000;
      const duration = snare ? 0.13 : 0.045;
      gain.gain.setValueAtTime((snare ? 0.13 : 0.045) * volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      source.connect(filter); filter.connect(gain); gain.connect(output);
      source.start(time); source.stop(time + duration);
      if (snare) voice(180, time, 0.09, "triangle", 0.035 * volume, 800);
    }

    // Dezesseis compassos: introdução, tema, resposta, variação e virada.
    function schedule(step, time) {
      const beat = step % 16;
      const bar = Math.floor(step / 16) % 16;
      const chord = [0, 5, 3, 4][Math.floor(bar / 2) % 4];
      const swung = time + (step % 2 ? track.swing * tickLength : 0);
      const soft = track.genre.includes("suave");
      if (track.kick.includes(beat)) kick(time);
      if (beat === 4 || beat === 12) drum(time, true, soft ? 0.55 : 1);
      if (beat % 2 === 0) drum(time, false, beat % 4 === 0 ? 0.65 : 1);
      if (bar >= 8 && beat === 15) drum(swung, false, 0.55);
      if ([0, 6, 8, 14].includes(beat)) voice(note(chord + (beat === 14 ? 4 : 0), -2), swung, tickLength * 2.5, "sine", 0.15, 600);
      if (beat === 0 || beat === 10) {
        [chord, chord + 2, chord + 4].forEach((degree, i) => voice(note(degree, -1), time + i * 0.012, tickLength * 5, "triangle", 0.032, soft ? 1200 : 2200));
      }
      // Melodia composta, com pausas e uma frase de resposta.
      if (bar >= 2 && beat % 2 === 0) {
        const index = (Math.floor(beat / 2) + (bar % 2) * 8) % track.motif.length;
        const degree = track.motif[index];
        if (degree !== null && !(bar === 15 && beat >= 12)) {
          voice(note(degree + (bar >= 8 && bar % 4 === 3 ? 2 : 0)), swung,
            tickLength * (soft ? 3 : 1.7), track.lead, 0.065, soft ? 1800 : 3200);
          // Eco discreto, sincronizado com o andamento.
          voice(note(degree), swung + tickLength * 3, tickLength * 1.5, track.lead, 0.015, 1400);
        }
      }
      if (bar % 4 === 3 && [13, 15].includes(beat)) drum(swung, true, 0.28);
    }
    return { schedule, tickLength };
  }
  window.ArthurDanceMusic = { trackFor, createPlayer };
})();
