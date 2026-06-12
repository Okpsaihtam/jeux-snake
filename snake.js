const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const recordEl = document.getElementById('record');
const messageEl = document.getElementById('message');
const btnJouer = document.getElementById('btnJouer');
const btnRejouer = document.getElementById('btnRejouer');
const btnResetRecord = document.getElementById('btnResetRecord');

btnResetRecord.addEventListener('click', () => {
    record = 0;
    recordEl.textContent = 'Record : 0';
    localStorage.removeItem('snakeRecord');
});

const TAILLE_CASE = 20;
const COLONNES = canvas.width / TAILLE_CASE;
const LIGNES = canvas.height / TAILLE_CASE;
const sonManger = new Audio('sons/manger.mp3');
const sonRecord = new Audio('sons/record.mp3');
const sonGameOver = new Audio('sons/gameover.mp3');

let serpent = [
    { x: 10, y: 10 }
];

let direction = { x: 1, y: 0 };
let nourriture = { x: 5, y: 5 };
let score = 0;
let record = localStorage.getItem('snakeRecord') ? parseInt(localStorage.getItem('snakeRecord')) : 0;
recordEl.textContent = 'Record : ' + record;
let gameLoop = null;
let prochainDirection = { x: 1, y: 0 };
let couleurChoisie = '#7c3aed';
let formeChoisie = 'carre';
let boucheOuverte = false;

function initialiserMenu() {
    document.querySelectorAll('.btnCouleur').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btnCouleur').forEach(b => b.classList.remove('selectionne'));
            btn.classList.add('selectionne');
            couleurChoisie = btn.dataset.couleur;
        });
    });

    document.querySelectorAll('.btnForme').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btnForme').forEach(b => b.classList.remove('selectionne'));
            btn.classList.add('selectionne');
            formeChoisie = btn.dataset.forme;
        });
    });
}

initialiserMenu();

function dessinerFond() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function dessinerSerpent() {
    serpent.forEach((segment, index) => {
        const x = segment.x * TAILLE_CASE;
        const y = segment.y * TAILLE_CASE;
        const estTete = index === 0;

        if (estTete) {
            ctx.fillStyle = couleurChoisie;
        } else {
            ctx.fillStyle = couleurChoisie + '99';
        }

        if (formeChoisie === 'carre') {
            dessinerCarre(x, y);
        } else if (formeChoisie === 'pacman') {
            if (estTete) {
                dessinerPacman(x, y);
            } else {
                dessinerCercle(x, y);
            }
        } else if (formeChoisie === 'triangle') {
            dessinerTriangle(x, y, estTete);
        } else if (formeChoisie === 'diamant') {
            dessinerDiamant(x, y);
        }
    });
}

function dessinerCarre(x, y) {
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, TAILLE_CASE - 4, TAILLE_CASE - 4, 3);
    ctx.fill();
}

function dessinerCercle(x, y) {
    const cx = x + TAILLE_CASE / 2;
    const cy = y + TAILLE_CASE / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, TAILLE_CASE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function dessinerPacman(x, y) {
    const cx = x + TAILLE_CASE / 2;
    const cy = y + TAILLE_CASE / 2;
    const rayon = TAILLE_CASE / 2 - 2;

    let angle = 0;
    if (direction.x === 1)  angle = 0;
    if (direction.x === -1) angle = Math.PI;
    if (direction.y === -1) angle = -Math.PI / 2;
    if (direction.y === 1)  angle = Math.PI / 2;

    const ouverture = boucheOuverte ? 0.25 : 0.05;
    boucheOuverte = !boucheOuverte;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rayon, angle + ouverture, angle + Math.PI * 2 - ouverture);
    ctx.closePath();
    ctx.fill();
}

function dessinerTriangle(x, y, estTete) {
    const cx = x + TAILLE_CASE / 2;
    const cy = y + TAILLE_CASE / 2;
    const r = TAILLE_CASE / 2 - 2;

    ctx.beginPath();
    if (estTete) {
        if (direction.x === 1)  { ctx.moveTo(cx + r, cy); ctx.lineTo(cx - r, cy - r); ctx.lineTo(cx - r, cy + r); }
        if (direction.x === -1) { ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy + r); }
        if (direction.y === -1) { ctx.moveTo(cx, cy - r); ctx.lineTo(cx - r, cy + r); ctx.lineTo(cx + r, cy + r); }
        if (direction.y === 1)  { ctx.moveTo(cx, cy + r); ctx.lineTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); }
    } else {
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy + r);
        ctx.lineTo(cx - r, cy + r);
    }
    ctx.closePath();
    ctx.fill();
}

function dessinerDiamant(x, y) {
    const cx = x + TAILLE_CASE / 2;
    const cy = y + TAILLE_CASE / 2;
    const r = TAILLE_CASE / 2 - 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
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
    direction = prochainDirection;
    const tete = {
        x: serpent[0].x + direction.x,
        y: serpent[0].y + direction.y
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
        scoreEl.textContent = 'Score : ' + score;
        if (score === record + 1) {
            jouerSon('record');
        } else {
            jouerSon('manger');
        }
        placerNourriture();
        clearInterval(gameLoop);
        gameLoop = setInterval(() => {
            bouger();
            dessiner();
        }, calculerVitesse());
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
    document.getElementById('menu').style.display = 'none';
    demarrer();
});

btnRejouer.addEventListener('click', () => {
    btnRejouer.style.display = 'none';
    document.getElementById('menu').style.display = 'flex';
    demarrer();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && direction.y !== 1) {
        prochainDirection = { x: 0, y: -1 };
    }
    if (event.key === 'ArrowDown' && direction.y !== -1) {
        prochainDirection = { x: 0, y: 1 };
    }
    if (event.key === 'ArrowLeft' && direction.x !== 1) {
        prochainDirection = { x: -1, y: 0 };
    }
    if (event.key === 'ArrowRight' && direction.x !== -1) {
        prochainDirection = { x: 1, y: 0 };
    }
});

function calculerVitesse() {
    if (score < 5) return 150;
    if (score < 10) return 120;
    if (score < 20) return 90;
    if (score < 30) return 60;
    return 40;
}


function jouerSon(type) {
    if (type === 'manger') {
       sonManger.currentTime = 0;
       sonManger.play(); 
    }

    if (type === 'gameOver') {
        sonRecord.currentTime = 0;
        sonRecord.play();
    }

    if (type === 'record') {
        sonGameOver.currentTime = 0;
        sonGameOver.play();
    }
}

function demarrer() {
    serpent = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    prochainDirection = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = 'Score : 0';
    messageEl.textContent = '';
    placerNourriture();
    gameLoop = setInterval(() => {
        bouger();
        dessiner();
    }, calculerVitesse());
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    jouerSon('gameOver');
    if (score > record) {
    record = score;
    recordEl.textContent = 'Record : ' + record;
    localStorage.setItem('snakeRecord', record);
}
    messageEl.textContent = 'Game Over !';
    btnRejouer.style.display = 'block';
    document.getElementById('menu').style.display = 'flex';
    btnJouer.style.display = 'none';
}