"use strict"; // ====================================================== // ARTHUR TENNIS - JAVASCRIPT // ====================================================== // Canvas const canvas = document.getElementById("jogo"); const ctx = canvas.getContext("2d"); // Elementos da página const info = document.getElementById("info"); const botaoIniciar = document.getElementById("botaoIniciar"); // ====================================================== // ESTADO DO JOGO // ====================================================== let jogando = false; let pontos = 0; // Todas as teclas pressionadas const teclas = {}; // ====================================================== // JOGADOR / PLATAFORMA // ====================================================== const jogador = { x: 395, y: 500, largura: 110, altura: 22, velocidadeX: 0, velocidadeY: 0, aceleracao: 0.75, atrito: 0.84, velocidadeMaxima: 7 }; // ====================================================== // BOLA // ====================================================== const bola = { x: 450, y: 350, raio: 11, velocidadeX: 5, velocidadeY: -7, gravidade: 0.16, quique: 0.97, velocidadeMaxima: 13 }; // ====================================================== // BLOCOS // ====================================================== let blocos = []; const cores = [ "#00ff44", "#ffe600", "#1677ff", "#ff3b30", "#a900ff" ]; // ====================================================== // TECLADO // ====================================================== document.addEventListener("keydown", function (e) { const tecla = e.key.toLowerCase(); teclas[tecla] = true; // Impede as setas de fazerem a página rolar if (tecla.startsWith("arrow")) { e.preventDefault(); } // A = iniciar if (tecla === "a" && !jogando) { iniciarJogo(); } }); document.addEventListener("keyup", function (e) { const tecla = e.key.toLowerCase(); teclas[tecla] = false; }); // ====================================================== // LIMITAR NÚMERO // ====================================================== function limitar(valor, minimo, maximo) { return Math.max( minimo, Math.min(maximo, valor) ); } // ====================================================== // CRIAR BLOCOS // ====================================================== function criarBlocos() { blocos = []; const linhas = 5; const colunas = 10; const largura = 78; const altura = 25; const espacoX = 8; const espacoY = 8; const inicioX = 25; const inicioY = 55; for (let linha = 0; linha < linhas; linha++) { for (let coluna = 0; coluna < colunas; coluna++) { blocos.push({ x: inicioX + coluna * (largura + espacoX), y: inicioY + linha * (altura + espacoY), largura: largura, altura: altura, ativo: true }); } } } // ====================================================== // INICIAR JOGO // ====================================================== function iniciarJogo() { jogando = true; pontos = 0; // Plataforma jogador.x = (canvas.width - jogador.largura) / 2; jogador.y = 500; jogador.velocidadeX = 0; jogador.velocidadeY = 0; // Bola bola.x = canvas.width / 2; bola.y = 350; bola.velocidadeX = Math.random() < 0.5 ? -5 : 5; bola.velocidadeY = -7; // Blocos criarBlocos(); info.textContent = "E = CIMA | D = BAIXO | F = ESQUERDA | S = DIREITA"; } // ====================================================== // MOVIMENTO DO JOGADOR // ====================================================== function atualizarJogador() { // E ou seta para cima if ( teclas["e"] || teclas["arrowup"] ) { jogador.velocidadeY -= jogador.aceleracao; } // D ou seta para baixo if ( teclas["d"] || teclas["arrowdown"] ) { jogador.velocidadeY += jogador.aceleracao; } // F ou seta para esquerda if ( teclas["f"] || teclas["arrowleft"] ) { jogador.velocidadeX -= jogador.aceleracao; } // S ou seta para direita if ( teclas["s"] || teclas["arrowright"] ) { jogador.velocidadeX += jogador.aceleracao; } // Velocidade máxima jogador.velocidadeX = limitar( jogador.velocidadeX, -jogador.velocidadeMaxima, jogador.velocidadeMaxima ); jogador.velocidadeY = limitar( jogador.velocidadeY, -jogador.velocidadeMaxima, jogador.velocidadeMaxima ); // Movimento jogador.x += jogador.velocidadeX; jogador.y += jogador.velocidadeY; // Atrito jogador.velocidadeX *= jogador.atrito; jogador.velocidadeY *= jogador.atrito; // Limites da tela jogador.x = limitar( jogador.x, 0, canvas.width - jogador.largura ); jogador.y = limitar( jogador.y, 0, canvas.height - jogador.altura ); } // ====================================================== // FÍSICA DA BOLA // ====================================================== function atualizarBola() { // Gravidade bola.velocidadeY += bola.gravidade; // Limitar velocidade bola.velocidadeX = limitar( bola.velocidadeX, -bola.velocidadeMaxima, bola.velocidadeMaxima ); bola.velocidadeY = limitar( bola.velocidadeY, -bola.velocidadeMaxima, bola.velocidadeMaxima ); // Movimento bola.x += bola.velocidadeX; bola.y += bola.velocidadeY; // ================================================== // PAREDE ESQUERDA // ================================================== if (bola.x - bola.raio <= 0) { bola.x = bola.raio; bola.velocidadeX = Math.abs(bola.velocidadeX) * bola.quique; } // ================================================== // PAREDE DIREITA // ================================================== if ( bola.x + bola.raio >= canvas.width ) { bola.x = canvas.width - bola.raio; bola.velocidadeX = -Math.abs(bola.velocidadeX) * bola.quique; } // ================================================== // TETO // ================================================== if (bola.y - bola.raio <= 0) { bola.y = bola.raio; bola.velocidadeY = Math.abs(bola.velocidadeY) * bola.quique; } // Plataforma colisaoComPlataforma(); // Blocos colisaoComBlocos(); // ================================================== // SE A BOLA CAIR // ================================================== if ( bola.y - bola.raio > canvas.height ) { reiniciarBola(); } } // ====================================================== // COLISÃO COM A PLATAFORMA // ====================================================== function colisaoComPlataforma() { const colidiu = bola.x + bola.raio > jogador.x && bola.x - bola.raio < jogador.x + jogador.largura && bola.y + bola.raio > jogador.y && bola.y - bola.raio < jogador.y + jogador.altura; if ( colidiu && bola.velocidadeY > 0 ) { // Coloca a bola exatamente acima bola.y = jogador.y - bola.raio; // Rebote bola.velocidadeY = -Math.abs( bola.velocidadeY ) * bola.quique; // ================================================== // DIREÇÃO DEPENDE DO LOCAL DA BATIDA // ================================================== const centro = jogador.x + jogador.largura / 2; const distancia = bola.x - centro; const porcentagem = distancia / (jogador.largura / 2); bola.velocidadeX += porcentagem * 2.5; // A velocidade da plataforma // também influencia a bola bola.velocidadeX += jogador.velocidadeX * 0.3; bola.velocidadeX = limitar( bola.velocidadeX, -bola.velocidadeMaxima, bola.velocidadeMaxima ); } } // ====================================================== // COLISÃO COM OS BLOCOS // ====================================================== function colisaoComBlocos() { for (const bloco of blocos) { if (!bloco.ativo) { continue; } const colidiu = bola.x + bola.raio > bloco.x && bola.x - bola.raio < bloco.x + bloco.largura && bola.y + bola.raio > bloco.y && bola.y - bola.raio < bloco.y + bloco.altura; if (!colidiu) { continue; } // Destrói o bloco bloco.ativo = false; pontos++; // Centro do bloco const centroX = bloco.x + bloco.largura / 2; const centroY = bloco.y + bloco.altura / 2; const distanciaX = bola.x - centroX; const distanciaY = bola.y - centroY; // Descobrir de qual lado bateu if ( Math.abs(distanciaX) > Math.abs(distanciaY) ) { bola.velocidadeX *= -1; } else { bola.velocidadeY *= -1; } // Pequeno aumento da velocidade bola.velocidadeX *= 1.01; bola.velocidadeY *= 1.01; verificarVitoria(); break; } } // ====================================================== // REINICIAR BOLA // ====================================================== function reiniciarBola() { bola.x = canvas.width / 2; bola.y = 350; bola.velocidadeX = Math.random() < 0.5 ? -5 : 5; bola.velocidadeY = -7; } // ====================================================== // VERIFICAR VITÓRIA // ====================================================== function verificarVitoria() { const restantes = blocos.filter( bloco => bloco.ativo ).length; if (restantes === 0) { jogando = false; info.textContent = "🏆 VOCÊ VENCEU! " + "Pontos: " + pontos + " — Aperte A para jogar novamente."; } } // ====================================================== // DESENHAR QUADRA // ====================================================== function desenharQuadra() { const gradiente = ctx.createLinearGradient( 0, 0, 0, canvas.height ); gradiente.addColorStop( 0, "#087f52" ); gradiente.addColorStop( 1, "#023d29" ); ctx.fillStyle = gradiente; ctx.fillRect( 0, 0, canvas.width, canvas.height ); // Linha central ctx.strokeStyle = "rgba(255,255,255,0.20)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo( canvas.width / 2, 0 ); ctx.lineTo( canvas.width / 2, canvas.height ); ctx.stroke(); // Linha inferior ctx.beginPath(); ctx.moveTo( 0, canvas.height - 80 ); ctx.lineTo( canvas.width, canvas.height - 80 ); ctx.stroke(); // Borda ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 4; ctx.strokeRect( 4, 4, canvas.width - 8, canvas.height - 8 ); } // ====================================================== // DESENHAR PLATAFORMA // ====================================================== function desenharJogador() { // Sombra ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.roundRect( jogador.x + 5, jogador.y + 6, jogador.largura, jogador.altura, 8 ); ctx.fill(); // Plataforma const gradiente = ctx.createLinearGradient( 0, jogador.y, 0, jogador.y + jogador.altura ); gradiente.addColorStop( 0, "#65ff75" ); gradiente.addColorStop( 1, "#009b20" ); ctx.fillStyle = gradiente; ctx.beginPath(); ctx.roundRect( jogador.x, jogador.y, jogador.largura, jogador.altura, 8 ); ctx.fill(); // Brilho ctx.fillStyle = "#fff200"; ctx.fillRect( jogador.x + 12, jogador.y + 5, jogador.largura - 24, 5 ); } // ====================================================== // DESENHAR BOLA // ====================================================== function desenharBola() { // Sombra ctx.beginPath(); ctx.arc( bola.x + 3, bola.y + 4, bola.raio, 0, Math.PI * 2 ); ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill(); // Bola const gradiente = ctx.createRadialGradient( bola.x - 4, bola.y - 4, 2, bola.x, bola.y, bola.raio ); gradiente.addColorStop( 0, "#ffffff" ); gradiente.addColorStop( 0.35, "#6fa0ff" ); gradiente.addColorStop( 1, "#1600ff" ); ctx.beginPath(); ctx.arc( bola.x, bola.y, bola.raio, 0, Math.PI * 2 ); ctx.fillStyle = gradiente; ctx.fill(); } // ====================================================== // DESENHAR BLOCOS // ====================================================== function desenharBlocos() { for ( let i = 0; i < blocos.length; i++ ) { const bloco = blocos[i]; if (!bloco.ativo) { continue; } ctx.fillStyle = cores[ i % cores.length ]; ctx.beginPath(); ctx.roundRect( bloco.x, bloco.y, bloco.largura, bloco.altura, 6 ); ctx.fill(); // Brilho ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect( bloco.x + 6, bloco.y + 4, bloco.largura - 12, 5 ); // Borda ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; ctx.stroke(); } } // ====================================================== // DESENHAR PLACAR // ====================================================== function desenharPlacar() { ctx.fillStyle = "#ffffff"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText( "🎾 Pontos: " + pontos, 20, 32 ); } // ====================================================== // DESENHAR TUDO // ====================================================== function desenhar() { desenharQuadra(); desenharBlocos(); desenharJogador(); desenharBola(); desenharPlacar(); } // ====================================================== // BOTÕES DA TELA // ====================================================== function configurarBotao(id, tecla) { const botao = document.getElementById(id); if (!botao) { return; } function pressionar(e) { e.preventDefault(); teclas[tecla] = true; } function soltar(e) { e.preventDefault(); teclas[tecla] = false; } // Mouse botao.addEventListener( "mousedown", pressionar ); botao.addEventListener( "mouseup", soltar ); botao.addEventListener( "mouseleave", soltar ); // Celular / tablet botao.addEventListener( "touchstart", pressionar, { passive: false } ); botao.addEventListener( "touchend", soltar, { passive: false } ); botao.addEventListener( "touchcancel", soltar, { passive: false } ); } // ====================================================== // CONFIGURAR OS 4 BOTÕES // ====================================================== // E = cima configurarBotao( "botaoCima", "e" ); // D = baixo configurarBotao( "botaoBaixo", "d" ); // F = esquerda configurarBotao( "botaoEsquerda", "f" ); // S = direita configurarBotao( "botaoDireita", "s" ); // ====================================================== // BOTÃO INICIAR // ====================================================== if (botaoIniciar) { botaoIniciar.addEventListener( "click", function () { if (!jogando) { iniciarJogo(); } } ); } // ====================================================== // BOTÃO SAIR // ====================================================== function sair() { window.location.href = "arthur-jogos.html"; } // ====================================================== // LOOP DO JOGO // ====================================================== function loop() { if (jogando) { atualizarJogador(); atualizarBola(); } desenhar(); requestAnimationFrame(loop); } // ====================================================== // COMEÇAR // ====================================================== criarBlocos(); desenhar(); loop();"use strict";

// ======================================================
// ARTHUR TENNIS - JAVASCRIPT
// ======================================================

// Canvas
const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");

// Elementos da página
const info = document.getElementById("info");
const botaoIniciar = document.getElementById("botaoIniciar");

// ======================================================
// ESTADO DO JOGO
// ======================================================

let jogando = false;
let pontos = 0;

// Todas as teclas pressionadas
const teclas = {};


// ======================================================
// JOGADOR / PLATAFORMA
// ======================================================

const jogador = {
    x: 395,
    y: 500,

    largura: 110,
    altura: 22,

    velocidadeX: 0,
    velocidadeY: 0,

    aceleracao: 0.75,
    atrito: 0.84,

    velocidadeMaxima: 7
};


// ======================================================
// BOLA
// ======================================================

const bola = {
    x: 450,
    y: 350,

    raio: 11,

    velocidadeX: 5,
    velocidadeY: -7,

    gravidade: 0.16,
    quique: 0.97,

    velocidadeMaxima: 13
};


// ======================================================
// BLOCOS
// ======================================================

let blocos = [];

const cores = [
    "#00ff44",
    "#ffe600",
    "#1677ff",
    "#ff3b30",
    "#a900ff"
];


// ======================================================
// TECLADO
// ======================================================

document.addEventListener("keydown", function (e) {

    const tecla = e.key.toLowerCase();

    teclas[tecla] = true;

    // Impede as setas de fazerem a página rolar
    if (tecla.startsWith("arrow")) {
        e.preventDefault();
    }

    // A = iniciar
    if (tecla === "a" && !jogando) {
        iniciarJogo();
    }
});


document.addEventListener("keyup", function (e) {

    const tecla = e.key.toLowerCase();

    teclas[tecla] = false;
});


// ======================================================
// LIMITAR NÚMERO
// ======================================================

function limitar(valor, minimo, maximo) {
    return Math.max(
        minimo,
        Math.min(maximo, valor)
    );
}


// ======================================================
// CRIAR BLOCOS
// ======================================================

function criarBlocos() {

    blocos = [];

    const linhas = 5;
    const colunas = 10;

    const largura = 78;
    const altura = 25;

    const espacoX = 8;
    const espacoY = 8;

    const inicioX = 25;
    const inicioY = 55;

    for (let linha = 0; linha < linhas; linha++) {

        for (let coluna = 0; coluna < colunas; coluna++) {

            blocos.push({
                x: inicioX + coluna * (largura + espacoX),
                y: inicioY + linha * (altura + espacoY),

                largura: largura,
                altura: altura,

                ativo: true
            });
        }
    }
}


// ======================================================
// INICIAR JOGO
// ======================================================

function iniciarJogo() {

    jogando = true;
    pontos = 0;

    // Plataforma
    jogador.x = (canvas.width - jogador.largura) / 2;
    jogador.y = 500;

    jogador.velocidadeX = 0;
    jogador.velocidadeY = 0;

    // Bola
    bola.x = canvas.width / 2;
    bola.y = 350;

    bola.velocidadeX =
        Math.random() < 0.5 ? -5 : 5;

    bola.velocidadeY = -7;

    // Blocos
    criarBlocos();

    info.textContent =
        "E / ↑ = CIMA | D / ↓ = BAIXO | F / → = DIREITA | S / ← = ESQUERDA";
}


// ======================================================
// MOVIMENTO DO JOGADOR
// ======================================================

function pressionada(...chaves) {
    return chaves.some(chave => Boolean(teclas[chave]));
}

function atualizarJogador() {

    // Cima: E ou seta para cima
    if (pressionada("e", "arrowup")) {
        jogador.velocidadeY -= jogador.aceleracao;
    }

    // Baixo: D ou seta para baixo
    if (pressionada("d", "arrowdown")) {
        jogador.velocidadeY += jogador.aceleracao;
    }

    // Direita: F ou seta para a direita
    if (pressionada("f", "arrowright")) {
        jogador.velocidadeX += jogador.aceleracao;
    }

    // Esquerda: S ou seta para a esquerda
    if (pressionada("s", "arrowleft")) {
        jogador.velocidadeX -= jogador.aceleracao;
    }

    // Velocidade máxima
    jogador.velocidadeX = limitar(
        jogador.velocidadeX,
        -jogador.velocidadeMaxima,
        jogador.velocidadeMaxima
    );

    jogador.velocidadeY = limitar(
        jogador.velocidadeY,
        -jogador.velocidadeMaxima,
        jogador.velocidadeMaxima
    );


    // Movimento
    jogador.x += jogador.velocidadeX;
    jogador.y += jogador.velocidadeY;


    // Atrito
    jogador.velocidadeX *= jogador.atrito;
    jogador.velocidadeY *= jogador.atrito;


    // Limites da tela
    jogador.x = limitar(
        jogador.x,
        0,
        canvas.width - jogador.largura
    );

    jogador.y = limitar(
        jogador.y,
        0,
        canvas.height - jogador.altura
    );
}


// ======================================================
// FÍSICA DA BOLA
// ======================================================

function atualizarBola() {

    // Gravidade
    bola.velocidadeY += bola.gravidade;


    // Limitar velocidade
    bola.velocidadeX = limitar(
        bola.velocidadeX,
        -bola.velocidadeMaxima,
        bola.velocidadeMaxima
    );

    bola.velocidadeY = limitar(
        bola.velocidadeY,
        -bola.velocidadeMaxima,
        bola.velocidadeMaxima
    );


    // Movimento
    bola.x += bola.velocidadeX;
    bola.y += bola.velocidadeY;


    // ==================================================
    // PAREDE ESQUERDA
    // ==================================================

    if (bola.x - bola.raio <= 0) {

        bola.x = bola.raio;

        bola.velocidadeX =
            Math.abs(bola.velocidadeX) *
            bola.quique;
    }


    // ==================================================
    // PAREDE DIREITA
    // ==================================================

    if (
        bola.x + bola.raio >=
        canvas.width
    ) {

        bola.x =
            canvas.width - bola.raio;

        bola.velocidadeX =
            -Math.abs(bola.velocidadeX) *
            bola.quique;
    }


    // ==================================================
    // TETO
    // ==================================================

    if (bola.y - bola.raio <= 0) {

        bola.y = bola.raio;

        bola.velocidadeY =
            Math.abs(bola.velocidadeY) *
            bola.quique;
    }


    // Plataforma
    colisaoComPlataforma();

    // Blocos
    colisaoComBlocos();


    // ==================================================
    // SE A BOLA CAIR
    // ==================================================

    if (
        bola.y - bola.raio >
        canvas.height
    ) {

        reiniciarBola();
    }
}


// ======================================================
// COLISÃO COM A PLATAFORMA
// ======================================================

function colisaoComPlataforma() {

    const colidiu =

        bola.x + bola.raio >
        jogador.x &&

        bola.x - bola.raio <
        jogador.x + jogador.largura &&

        bola.y + bola.raio >
        jogador.y &&

        bola.y - bola.raio <
        jogador.y + jogador.altura;


    if (
        colidiu &&
        bola.velocidadeY > 0
    ) {

        // Coloca a bola exatamente acima
        bola.y =
            jogador.y - bola.raio;


        // Rebote
        bola.velocidadeY =
            -Math.abs(
                bola.velocidadeY
            ) * bola.quique;


        // ==================================================
        // DIREÇÃO DEPENDE DO LOCAL DA BATIDA
        // ==================================================

        const centro =
            jogador.x +
            jogador.largura / 2;

        const distancia =
            bola.x - centro;

        const porcentagem =
            distancia /
            (jogador.largura / 2);


        bola.velocidadeX +=
            porcentagem * 2.5;


        // A velocidade da plataforma
        // também influencia a bola
        bola.velocidadeX +=
            jogador.velocidadeX * 0.3;


        bola.velocidadeX = limitar(
            bola.velocidadeX,
            -bola.velocidadeMaxima,
            bola.velocidadeMaxima
        );
    }
}


// ======================================================
// COLISÃO COM OS BLOCOS
// ======================================================

function colisaoComBlocos() {

    for (const bloco of blocos) {

        if (!bloco.ativo) {
            continue;
        }


        const colidiu =

            bola.x + bola.raio >
            bloco.x &&

            bola.x - bola.raio <
            bloco.x + bloco.largura &&

            bola.y + bola.raio >
            bloco.y &&

            bola.y - bola.raio <
            bloco.y + bloco.altura;


        if (!colidiu) {
            continue;
        }


        // Destrói o bloco
        bloco.ativo = false;

        pontos++;


        // Centro do bloco
        const centroX =
            bloco.x +
            bloco.largura / 2;

        const centroY =
            bloco.y +
            bloco.altura / 2;


        const distanciaX =
            bola.x - centroX;

        const distanciaY =
            bola.y - centroY;


        // Descobrir de qual lado bateu
        if (
            Math.abs(distanciaX) >
            Math.abs(distanciaY)
        ) {

            bola.velocidadeX *= -1;

        } else {

            bola.velocidadeY *= -1;
        }


        // Pequeno aumento da velocidade
        bola.velocidadeX *= 1.01;
        bola.velocidadeY *= 1.01;


        verificarVitoria();

        break;
    }
}


// ======================================================
// REINICIAR BOLA
// ======================================================

function reiniciarBola() {

    bola.x =
        canvas.width / 2;

    bola.y = 350;


    bola.velocidadeX =
        Math.random() < 0.5
            ? -5
            : 5;

    bola.velocidadeY = -7;
}


// ======================================================
// VERIFICAR VITÓRIA
// ======================================================

function verificarVitoria() {

    const restantes =
        blocos.filter(
            bloco => bloco.ativo
        ).length;


    if (restantes === 0) {

        jogando = false;

        info.textContent =
            "🏆 VOCÊ VENCEU! " +
            "Pontos: " +
            pontos +
            " — Aperte A para jogar novamente.";
    }
}


// ======================================================
// DESENHAR QUADRA
// ======================================================

function desenharQuadra() {

    const gradiente =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );


    gradiente.addColorStop(
        0,
        "#087f52"
    );

    gradiente.addColorStop(
        1,
        "#023d29"
    );


    ctx.fillStyle = gradiente;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Linha central
    ctx.strokeStyle =
        "rgba(255,255,255,0.20)";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        canvas.width / 2,
        0
    );

    ctx.lineTo(
        canvas.width / 2,
        canvas.height
    );

    ctx.stroke();


    // Linha inferior
    ctx.beginPath();

    ctx.moveTo(
        0,
        canvas.height - 80
    );

    ctx.lineTo(
        canvas.width,
        canvas.height - 80
    );

    ctx.stroke();


    // Borda
    ctx.strokeStyle =
        "rgba(255,255,255,0.5)";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        4,
        4,
        canvas.width - 8,
        canvas.height - 8
    );
}


// ======================================================
// DESENHAR PLATAFORMA
// ======================================================

function desenharJogador() {

    // Sombra
    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.roundRect(
        jogador.x + 5,
        jogador.y + 6,
        jogador.largura,
        jogador.altura,
        8
    );

    ctx.fill();


    // Plataforma
    const gradiente =
        ctx.createLinearGradient(
            0,
            jogador.y,
            0,
            jogador.y +
            jogador.altura
        );


    gradiente.addColorStop(
        0,
        "#65ff75"
    );

    gradiente.addColorStop(
        1,
        "#009b20"
    );


    ctx.fillStyle = gradiente;

    ctx.beginPath();

    ctx.roundRect(
        jogador.x,
        jogador.y,
        jogador.largura,
        jogador.altura,
        8
    );

    ctx.fill();


    // Brilho
    ctx.fillStyle =
        "#fff200";

    ctx.fillRect(
        jogador.x + 12,
        jogador.y + 5,
        jogador.largura - 24,
        5
    );
}


// ======================================================
// DESENHAR BOLA
// ======================================================

function desenharBola() {

    // Sombra
    ctx.beginPath();

    ctx.arc(
        bola.x + 3,
        bola.y + 4,
        bola.raio,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.fill();


    // Bola
    const gradiente =
        ctx.createRadialGradient(
            bola.x - 4,
            bola.y - 4,
            2,
            bola.x,
            bola.y,
            bola.raio
        );


    gradiente.addColorStop(
        0,
        "#ffffff"
    );

    gradiente.addColorStop(
        0.35,
        "#6fa0ff"
    );

    gradiente.addColorStop(
        1,
        "#1600ff"
    );


    ctx.beginPath();

    ctx.arc(
        bola.x,
        bola.y,
        bola.raio,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = gradiente;

    ctx.fill();
}


// ======================================================
// DESENHAR BLOCOS
// ======================================================

function desenharBlocos() {

    for (
        let i = 0;
        i < blocos.length;
        i++
    ) {

        const bloco = blocos[i];

        if (!bloco.ativo) {
            continue;
        }


        ctx.fillStyle =
            cores[
                i % cores.length
            ];


        ctx.beginPath();

        ctx.roundRect(
            bloco.x,
            bloco.y,
            bloco.largura,
            bloco.altura,
            6
        );

        ctx.fill();


        // Brilho
        ctx.fillStyle =
            "rgba(255,255,255,0.35)";

        ctx.fillRect(
            bloco.x + 6,
            bloco.y + 4,
            bloco.largura - 12,
            5
        );


        // Borda
        ctx.strokeStyle =
            "rgba(0,0,0,0.3)";

        ctx.lineWidth = 2;

        ctx.stroke();
    }
}


// ======================================================
// DESENHAR PLACAR
// ======================================================

function desenharPlacar() {

    ctx.fillStyle = "#ffffff";

    ctx.font =
        "bold 22px Arial";

    ctx.textAlign = "left";

    ctx.fillText(
        "🎾 Pontos: " + pontos,
        20,
        32
    );
}


// ======================================================
// DESENHAR TUDO
// ======================================================

function desenhar() {

    desenharQuadra();

    desenharBlocos();

    desenharJogador();

    desenharBola();

    desenharPlacar();
}


// ======================================================
// BOTÕES DA TELA
// ======================================================

function configurarBotao(id, tecla) {

    const botao =
        document.getElementById(id);

    if (!botao) {
        return;
    }


    function pressionar(e) {

        e.preventDefault();

        teclas[tecla] = true;
    }


    function soltar(e) {

        e.preventDefault();

        teclas[tecla] = false;
    }


    // Mouse
    botao.addEventListener(
        "mousedown",
        pressionar
    );

    botao.addEventListener(
        "mouseup",
        soltar
    );

    botao.addEventListener(
        "mouseleave",
        soltar
    );


    // Celular / tablet
    botao.addEventListener(
        "touchstart",
        pressionar,
        { passive: false }
    );

    botao.addEventListener(
        "touchend",
        soltar,
        { passive: false }
    );

    botao.addEventListener(
        "touchcancel",
        soltar,
        { passive: false }
    );
}


// ======================================================
// CONFIGURAR OS 4 BOTÕES
// ======================================================

// Cima
configurarBotao("botaoCima", "e");

// Baixo
configurarBotao("botaoBaixo", "d");

// Direita
configurarBotao("botaoDireita", "f");

// Esquerda
configurarBotao("botaoEsquerda", "s");


// ======================================================
// BOTÃO INICIAR
// ======================================================

if (botaoIniciar) {

    botaoIniciar.addEventListener(
        "click",
        function () {

            if (!jogando) {
                iniciarJogo();
            }

        }
    );
}


// ======================================================
// BOTÃO SAIR
// ======================================================

function sair() {

    window.location.href =
    "../../arthur-jogos.html";
}


// ======================================================
// LOOP DO JOGO
// ======================================================

function loop() {

    if (jogando) {

        atualizarJogador();

        atualizarBola();
    }


    desenhar();

    requestAnimationFrame(loop);
}


// ======================================================
// COMEÇAR
// ======================================================

criarBlocos();

desenhar();

loop();
