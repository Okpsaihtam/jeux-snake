const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const btnJouer = document.getElementById('btnJouer');
const btnRejouer = document.getElementById('btnRejouer');

const TAILLE_CASE = 20;
const COLONNES = canvas.width / TAILLE_CASE;
const LIGNES = canvas.height / TAILLE_CASE;

let serpent = [
    { x: 10, y:10}
];

let direction = { x: 1, y: 0 };
let nourriture = { x: 5, y: 5 };
let score = 0;
let gameloop = null;

function dessinerFond() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function dessinerSerpent() {
    serpent.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#7c3aed';
        } else {
            ctx.fillStyle = '#c4b5fd';
        }
        ctx.fillRect(
            segment.x * TAILLE_CASE,
            segment.y * TAILLE_CASE,
            TAILLE_CASE - 2,
            TAILLE_CASE - 2
        );
    });
}

function dessinerNourriture() {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(
        nourriture.x * TAILLE_CASE,
        nourriture.y * TAILLE_CASE,
        TAILLE_CASE - 2,
        TAILLE_CASE - 2
    );
}

function dessiner() {
    dessinerFond();
    dessinerSerpent();
    dessinerNourriture();
}

function bouger() {
    const tete = {
        x: serpent[0].x + direction.x,
        y:serpent[0].y + direction.y
    };

    if (
        tete.x < 0 || tete.x >= COLONNES ||
        tete.y < 0 || tete.y >= LIGNES
    ) {
        gameOver();
        return;
    }

    const morduLuiMeme = serpent.some(segment =>
        segment.x === tete.x && segment.y === tete.y
    );

    if (morduLuiMeme) {
        gameOver();
        return;
    }

    serpent.unshift(tete);

    if (tete.x === nourriture.x && tete.y === nourriture.y) {
        score++;
        scoreEl.texteContent = 'Score : ' + score;
        placerNourriture();
    } else {
        serpent.pop();
    }
}

function placerNourriture() {
    nourriture = {
        x: Math.floor(Math.random() * COLONNES),
        y: Math.floor(Math.random() * LIGNES)
    };
}

btnJouer.addEventListener('click', () => {
    btnJouer.style.display = 'none';
    demarrer();
});

btnRejouer.addEventListener('click', () => {
    btnRejouer.style.display = 'none';
    demarrer();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && direction.y !== 1) {
        direction = { x: 0, y: -1 };
    }
    if (event.key === 'ArrowDown' && direction.y !== -1) {
        direction = { x: 0, y: 1 };
    }
    if (event.key === 'ArrowLeft' && direction.x !== 1) {
        direction = { x: -1, y: 0 };
    }
    if (event.key === 'ArrowRight' && direction.x !== -1) {
        direction = { x: 1, y: 0 };
    }
});

function demarrer() {
    serpent = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = 'Score : 0';
    messageEl.textContent = '';
    placerNourriture();
    gameLoop = setInterval(() =>{
        bouger();
        dessiner();
    }, 150);
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    messageEl.textContent = 'Game Over !';
    btnRejouer.style.display = 'block';
}