const jogadorA = document.getElementById("A");
const jogadorB = document.getElementById("B");
const botaoA = document.getElementById("botaoA");
const botaoB = document.getElementById("botaoB");
const botaoBoostA = document.getElementById("botaoBoostA");
const botaoBoostB = document.getElementById("botaoBoostB");
const mensagem = document.getElementById("mensagem");
const botaoIniciar = document.getElementById("botaoIniciar");
const botaoIniciarIA = document.getElementById("botaoIniciarIA");
const botaoIniciarIADificil = document.getElementById("botaoIniciarIADificil");
const botaoIniciarIAImpossivel = document.getElementById("botaoIniciarIAImpossivel");

let posicaoA = 330;
let posicaoB = 410;

const larguraJogador = 60;
const bordaEsquerda = 20;
const bordaDireita = 720;
const teclasA = ["q", "w", "a", "s"];
const teclasB = ["ç", "o", "l", "p"];
const teclasPressionadas = new Set();
const tempoInicio = { A: 0, B: 0 };
const ultimoEmpurrao = { A: 0, B: 0 };

let jogoComecou = false;
let jogoTerminou = false;
let modoIA = false;
let dificuldadeIA = "NORMAL";
let timerIA = null;
let tempoPartida = 0;
let historicoA = [];
let ultimaAcaoIA = 0;
let ultimoAtaqueA = 0;
let ultimoAtaqueB = 0;
let boostPendenteA = false;
let boostPendenteB = false;


function atualizarPosicoes() {
    jogadorA.style.left = posicaoA + "px";
    jogadorB.style.left = posicaoB + "px";
}


function finalizarSeNecessario() {
    if (posicaoB >= bordaDireita && posicaoA + larguraJogador >= posicaoB) {
        posicaoB = bordaDireita;
        jogoTerminou = true;
        mensagem.textContent = "🏆 A VENCEU!";
        return true;
    }

    if (posicaoA <= bordaEsquerda && posicaoB <= posicaoA + larguraJogador) {
        posicaoA = bordaEsquerda;
        jogoTerminou = true;
        mensagem.textContent = "🏆 B VENCEU!";
        return true;
    }

    return false;
}


function calcularForca(tempoPressionado) {
    return Math.max(10, Math.min(34, 36 - tempoPressionado / 17));
}


function temTeclaDoGrupo(grupo) {
    return [...teclasPressionadas].some(function(tecla) {
        if (grupo === "A") {
            return teclasA.includes(tecla);
        }

        return teclasB.includes(tecla);
    });
}


function calcularForcaComBonus(tempoPressionado, lado, comboAtivo) {
    let forca = calcularForca(tempoPressionado);

    if (lado === "B") {
        forca += 40;
    }

    if (comboAtivo) {
        forca += 26;
    }

    if (lado === "A" && temTeclaDoGrupo("B")) {
        forca += 300;
    }

    if (lado === "B" && temTeclaDoGrupo("A")) {
        forca += 260;
    }

    return Math.min(120, forca);
}


function aplicarEmpurraoDoA(forca) {
    const distancia = posicaoB - posicaoA - larguraJogador;
    const avanco = Math.min(distancia, Math.max(4, forca * 0.8));

    posicaoA += avanco;

    if (posicaoA + larguraJogador >= posicaoB) {
        posicaoA = posicaoB - larguraJogador;
        const empurrar = Math.max(4, forca * 1.2);
        posicaoB += empurrar;
        mensagem.textContent = "🔵 A empurrou!";
    } else {
        mensagem.textContent = "🔵 A se aproximou!";
    }
}


function aplicarEmpurraoDoB(forca) {
    const distancia = posicaoB - posicaoA - larguraJogador;
    const avanco = Math.min(distancia, Math.max(4, forca * 0.8));

    posicaoB -= avanco;

    if (posicaoB <= posicaoA + larguraJogador) {
        posicaoB = posicaoA + larguraJogador;
        const empurrar = Math.max(4, forca * 1.2);
        posicaoA -= empurrar;
        mensagem.textContent = "🔴 B empurrou!";
    } else {
        mensagem.textContent = "🔴 B se aproximou!";
    }
}


function resolverEmpurrao() {
    if (jogoTerminou) {
        return;
    }

    const forcaA = ultimoEmpurrao.A;
    const forcaB = ultimoEmpurrao.B;

    if (forcaA === 0 && forcaB === 0) {
        return;
    }

    if (forcaA > 0 && forcaB > 0) {
        if (Math.abs(forcaA - forcaB) <= 2) {
            mensagem.textContent = "🤝 EMPATE!";
            ultimoEmpurrao.A = 0;
            ultimoEmpurrao.B = 0;
            return;
        }

        if (forcaA > forcaB) {
            aplicarEmpurraoDoA(forcaA);
        } else {
            aplicarEmpurraoDoB(forcaB);
        }
    } else if (forcaA > 0) {
        aplicarEmpurraoDoA(forcaA);
    } else if (forcaB > 0) {
        aplicarEmpurraoDoB(forcaB);
    }

    if (posicaoA < bordaEsquerda) {
        posicaoA = bordaEsquerda;
    }

    if (posicaoB > bordaDireita) {
        posicaoB = bordaDireita;
    }

    atualizarPosicoes();
    finalizarSeNecessario();

    ultimoEmpurrao.A = 0;
    ultimoEmpurrao.B = 0;
}


function jogarCom(jogador) {
    if (!jogoComecou || jogoTerminou) {
        return;
    }

    if (jogador === "A") {
        ultimoAtaqueA = Date.now();
        if (boostPendenteA) {
            ultimoEmpurrao.A = 180;
            boostPendenteA = false;
            resolverEmpurrao();
            return;
        }
    }

    if (jogador === "B") {
        ultimoAtaqueB = Date.now();
        if (boostPendenteB) {
            ultimoEmpurrao.B = 180;
            boostPendenteB = false;
            resolverEmpurrao();
            return;
        }
    }

    ultimoEmpurrao[jogador] = calcularForca(0);
    resolverEmpurrao();
}


function usarBoost(lado) {
    if (!jogoComecou || jogoTerminou) {
        return;
    }

    const agora = Date.now();
    const temMesmoLadoAtivo = lado === "A"
        ? teclasA.some(function(tecla) {
            return teclasPressionadas.has(tecla);
        })
        : teclasB.some(function(tecla) {
            return teclasPressionadas.has(tecla);
        });
    const ataqueRecente = lado === "A"
        ? agora - ultimoAtaqueA < 180
        : agora - ultimoAtaqueB < 180;

    if (lado === "A") {
        boostPendenteA = temMesmoLadoAtivo || ataqueRecente;
        ultimoEmpurrao.A = boostPendenteA ? 180 : 80;

        const temBAtivo = teclasB.some(function(tecla) {
            return teclasPressionadas.has(tecla);
        });

        if (temBAtivo) {
            ultimoEmpurrao.A = Math.max(ultimoEmpurrao.A, 120);
        }
    }

    if (lado === "B") {
        boostPendenteB = temMesmoLadoAtivo || ataqueRecente;
        ultimoEmpurrao.B = boostPendenteB ? 180 : 80;

        const temAAtivo = teclasA.some(function(tecla) {
            return teclasPressionadas.has(tecla);
        });

        if (temAAtivo) {
            ultimoEmpurrao.B = Math.max(ultimoEmpurrao.B, 120);
        }
    }

    resolverEmpurrao();
}


function iniciarPartida(modoJogoIA, nivelDificuldade = "normal") {
    posicaoA = 330;
    posicaoB = 410;
    tempoInicio.A = 0;
    tempoInicio.B = 0;
    ultimoEmpurrao.A = 0;
    ultimoEmpurrao.B = 0;
    ultimoAtaqueA = 0;
    ultimoAtaqueB = 0;
    boostPendenteA = false;
    boostPendenteB = false;
    teclasPressionadas.clear();
    jogoComecou = true;
    jogoTerminou = false;
    modoIA = modoJogoIA;
    dificuldadeIA = nivelDificuldade;
    historicoA = [];
    tempoPartida = Date.now();
    ultimaAcaoIA = 0;

    if (timerIA) {
        clearInterval(timerIA);
        timerIA = null;
    }

    if (modoIA) {
        timerIA = setInterval(function() {
            if (!jogoComecou || jogoTerminou || !modoIA) {
                return;
            }

            const tempoDecorrido = Date.now() - tempoPartida;
            const forcaMedia = historicoA.length ? historicoA.reduce((soma, valor) => soma + valor, 0) / historicoA.length : 18;
            const predicao = historicoA.length ? Math.max(12, Math.min(34, forcaMedia + 5)) : 20;
            const faseFinal = tempoDecorrido >= 5 * 60 * 1000 + 55000;
            const reforco = dificuldadeIA === "dificil" ? 8 : 3;
            const forcaBase = Math.max(16, Math.min(36, predicao + reforco + (tempoDecorrido > 60000 ? 4 : 0)));
            const forcaIA = faseFinal ? forcaBase * 1.55 : forcaBase;
            const intervaloMinimo = dificuldadeIA === "dificil" ? 260 : dificuldadeIA === "impossivel" ? 210 : 420;
            const distancia = posicaoB - posicaoA - larguraJogador;
            const pressao = distancia < 140 ? 8 : 0;
            const podeUsarBoost = dificuldadeIA === "impossivel" && Math.random() < 0.25;

            if (podeUsarBoost) {
                ultimoEmpurrao.B = 120;
                mensagem.textContent = "🤖 IA usou BOOST!";
                ultimaAcaoIA = Date.now();
                resolverEmpurrao();
                return;
            }

            if (Date.now() - ultimaAcaoIA > Math.max(180, intervaloMinimo - Math.min(170, historicoA.length * 14)) || historicoA.length === 0) {
                ultimoEmpurrao.B = Math.min(46, forcaIA + pressao);
                ultimaAcaoIA = Date.now();
                resolverEmpurrao();
            }
        }, 140);
    }

    atualizarPosicoes();
    mensagem.textContent = modoIA ? (dificuldadeIA === "dificil" ? "🤖 IA DIFÍCIL ativada!" : dificuldadeIA === "impossivel" ? "🤖 IA IMPOSSÍVEL ativada!" : "🤖 IA aprendendo seu estilo...") : "⚔️ LUTEM!";
    botaoIniciar.textContent = "REINICIAR";
    botaoIniciarIA.textContent = "REINICIAR COM IA";
    botaoIniciarIADificil.textContent = "REINICIAR COM IA DIFÍCIL";
    if (botaoIniciarIAImpossivel) {
        botaoIniciarIAImpossivel.textContent = "REINICIAR COM IA IMPOSSÍVEL";
    }
}


botaoIniciar.addEventListener("click", function() {
    iniciarPartida(false);
});

botaoIniciarIA.addEventListener("click", function() {
    iniciarPartida(true, "normal");
});

botaoIniciarIADificil.addEventListener("click", function() {
    iniciarPartida(true, "dificil");
});

if (botaoIniciarIAImpossivel) {
    botaoIniciarIAImpossivel.addEventListener("click", function() {
        iniciarPartida(true, "impossivel");
    });
}


botaoA.addEventListener("click", function() {
    if (modoIA) {
        jogarCom("A");
        historicoA.push(18);
        if (historicoA.length > 20) {
            historicoA.shift();
        }
        return;
    }

    jogarCom("A");
});

botaoB.addEventListener("click", function() {
    if (modoIA) {
        return;
    }

    jogarCom("B");
});

botaoBoostA.addEventListener("click", function() {
    usarBoost("A");
});

botaoBoostB.addEventListener("click", function() {
    usarBoost("B");
});


// ============================
// CONTROLES MOBILE
// ============================

const botaoCima = document.getElementById("botaoCima");
const botaoBaixo = document.getElementById("botaoBaixo");
const botaoEsquerda = document.getElementById("botaoEsquerda");
const botaoDireita = document.getElementById("botaoDireita");

if (botaoDireita) {
    botaoDireita.addEventListener("click", function() {
        if (modoIA) {
            jogarCom("A");
            historicoA.push(18);
            if (historicoA.length > 20) {
                historicoA.shift();
            }
            return;
        }
        jogarCom("A");
    });
}

if (botaoEsquerda) {
    botaoEsquerda.addEventListener("click", function() {
        if (modoIA) {
            return;
        }
        jogarCom("B");
    });
}

if (botaoCima) {
    botaoCima.addEventListener("click", function() {
        usarBoost("A");
    });
}

if (botaoBaixo) {
    botaoBaixo.addEventListener("click", function() {
        usarBoost("B");
    });
}


// ============================
// CONTROLES
// ============================

document.addEventListener("keydown", function(event) {

    const tecla = event.key.toLowerCase();

    if (event.repeat || !jogoComecou || jogoTerminou) {
        return;
    }

    if (teclasPressionadas.has(tecla)) {
        return;
    }

    if (teclasA.includes(tecla)) {
        teclasPressionadas.add(tecla);
        tempoInicio.A = Date.now();
    }

    if (!modoIA && teclasB.includes(tecla)) {
        teclasPressionadas.add(tecla);
        tempoInicio.B = Date.now();
    }

});

document.addEventListener("keyup", function(event) {

    const tecla = event.key.toLowerCase();

    if (!jogoComecou || jogoTerminou) {
        teclasPressionadas.delete(tecla);
        return;
    }

    if (teclasA.includes(tecla) && tempoInicio.A) {
        const tempoPressionado = Date.now() - tempoInicio.A;
        const comboAtivo = teclasB.some(function(teclaAtiva) {
            return teclasPressionadas.has(teclaAtiva);
        });
        const forca = calcularForcaComBonus(tempoPressionado, "A", comboAtivo);
        ultimoEmpurrao.A = forca;
        historicoA.push(forca);
        if (historicoA.length > 20) {
            historicoA.shift();
        }
        tempoInicio.A = 0;
    }

    if (!modoIA && teclasB.includes(tecla) && tempoInicio.B) {
        const tempoPressionado = Date.now() - tempoInicio.B;
        const comboAtivo = teclasA.some(function(teclaAtiva) {
            return teclasPressionadas.has(teclaAtiva);
        });
        ultimoEmpurrao.B = calcularForcaComBonus(tempoPressionado, "B", comboAtivo);
        tempoInicio.B = 0;
    }

    const temTeclasAAtivas = teclasA.some(function(teclaAtiva) {
        return teclasPressionadas.has(teclaAtiva);
    });

    const temTeclasBAtivas = teclasB.some(function(teclaAtiva) {
        return teclasPressionadas.has(teclaAtiva);
    });

    if (tecla === "b" && temTeclasAAtivas) {
        ultimoEmpurrao.A = 80;
    }

    if (tecla === "a" && temTeclasBAtivas) {
        ultimoEmpurrao.B = 80;
    }

    if (tecla === "b" && temTeclasBAtivas) {
        ultimoEmpurrao.B = Math.max(ultimoEmpurrao.B, 58);
    }

    if (tecla === "a" && temTeclasAAtivas) {
        ultimoEmpurrao.A = Math.max(ultimoEmpurrao.A, 58);
    }

    teclasPressionadas.delete(tecla);
    resolverEmpurrao();

});

