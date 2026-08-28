const jogadorA = document.getElementById("A");
const jogadorB = document.getElementById("B");
const botaoA = document.getElementById("botaoA");
const botaoB = document.getElementById("botaoB");
const mensagem = document.getElementById("mensagem");
const botaoIniciar = document.getElementById("botaoIniciar");

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
    return Math.max(8, Math.min(30, 34 - tempoPressionado / 18));
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

    ultimoEmpurrao[jogador] = calcularForca(0);
    resolverEmpurrao();
}


botaoIniciar.addEventListener("click", function() {
    posicaoA = 330;
    posicaoB = 410;
    tempoInicio.A = 0;
    tempoInicio.B = 0;
    ultimoEmpurrao.A = 0;
    ultimoEmpurrao.B = 0;
    teclasPressionadas.clear();
    jogoComecou = true;
    jogoTerminou = false;

    atualizarPosicoes();
    mensagem.textContent = "⚔️ LUTEM!";
    botaoIniciar.textContent = "REINICIAR";
});


botaoA.addEventListener("click", function() {
    jogarCom("A");
});

botaoB.addEventListener("click", function() {
    jogarCom("B");
});


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

    if (teclasB.includes(tecla)) {
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
        ultimoEmpurrao.A = calcularForca(tempoPressionado);
        tempoInicio.A = 0;
    }

    if (teclasB.includes(tecla) && tempoInicio.B) {
        const tempoPressionado = Date.now() - tempoInicio.B;
        ultimoEmpurrao.B = calcularForca(tempoPressionado);
        tempoInicio.B = 0;
    }

    teclasPressionadas.delete(tecla);
    resolverEmpurrao();

});

