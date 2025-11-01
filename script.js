'use strict';

// --- DOM Elements ---
const wheel = document.getElementById('spinnerWheel');
const ctx = wheel.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const nameInput = document.getElementById('nameInput');
const addNameBtn = document.getElementById('addNameBtn');
const nameList = document.getElementById('nameList');
const popup = document.getElementById('popup');
const winnerMessage = document.getElementById('winnerMessage');
const closeBtn = document.querySelector('.close-btn');
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const contactForm = document.getElementById('contactForm');

// --- State ---
let names = [];
const colors = ["#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6"];
let currentAngle = 0;

// --- PAGE NAVIGATION ---
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        navLinks.forEach(navLink => navLink.classList.remove('active-link'));
        link.classList.add('active-link');
    });
});

// --- CONTACT FORM ---
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! (This is a demo and does not send emails.)');
    contactForm.reset();
});

// --- SPINNER FUNCTIONS ---
function drawWheel() {
    if (names.length === 0) {
        drawPlaceholderWheel();
        return;
    }
    const arcSize = 2 * Math.PI / names.length;
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    ctx.font = '18px Poppins, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    names.forEach((name, i) => {
        const angle = i * arcSize;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(225, 225, 225, angle, angle + arcSize);
        ctx.lineTo(225, 225);
        ctx.fill();

        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.translate(225 + Math.cos(angle + arcSize / 2) * 160, 225 + Math.sin(angle + arcSize / 2) * 160);
        ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
        const text = name.length > 12 ? name.substring(0, 11) + '...' : name;
        ctx.fillText(text, 0, 0);
        ctx.restore();
    });
}

function drawPlaceholderWheel() {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerX - 5, 0, 2 * Math.PI);
    const bodyStyles = getComputedStyle(document.body);
    ctx.fillStyle = bodyStyles.getPropertyValue('--bg-color');
    ctx.strokeStyle = bodyStyles.getPropertyValue('--border-color');
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = bodyStyles.getPropertyValue('--text-muted-color');
    ctx.font = 'bold 30px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Add Names to Spin', centerX, centerY);
}

function updateNameList() {
    nameList.innerHTML = '';
    names.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'name-item';
        item.innerHTML = `<span>${name}</span><span class="remove-name" data-index="${index}">✖</span>`;
        nameList.appendChild(item);
    });
    document.querySelectorAll('.remove-name').forEach(btn => {
        btn.addEventListener('click', e => {
            names.splice(parseInt(e.target.dataset.index), 1);
            updateNameList();
            drawWheel();
        });
    });
    spinBtn.disabled = names.length < 2;
}

function addName() {
    const newName = nameInput.value.trim();
    if (newName && !names.includes(newName)) {
        names.push(newName);
        nameInput.value = '';
        updateNameList();
        drawWheel();
    }
}

function spinWheel() {
    const spinDuration = 6000;
    const randomSpin = Math.random() * 360 + 360 * 7; // Spin at least 7 times
    const totalAngle = currentAngle + randomSpin;
    
    wheel.style.transition = `transform ${spinDuration / 1000}s cubic-bezier(0.2, 0.8, 0.2, 1)`;
    wheel.style.transform = `rotate(${totalAngle}deg)`;
    currentAngle = totalAngle;

    setTimeout(() => {
        // =================================================================
        // --- FIX: Correct Winner Calculation Logic ---
        // =================================================================
        const finalAngle = totalAngle % 360;
        const arcSizeDegrees = 360 / names.length;

        // The pointer is at the top (270 degrees in the coordinate system).
        // We calculate which original segment has rotated to this position.
        const winningAngle = (360 - finalAngle + 270) % 360;
        
        // Find the index of that segment.
        const winningIndex = Math.floor(winningAngle / arcSizeDegrees);

        // The winner is simply the name at that index. No reversal needed.
        const winner = names[winningIndex];
        // =================================================================
        // --- End of Fix ---
        // =================================================================

        winnerMessage.textContent = `${winner} Will Pay (Sorry ${winner})`;
        popup.style.display = 'flex';
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    }, spinDuration);
}

// --- THEME TOGGLER ---
function switchTheme(isLight) {
    document.body.classList.toggle('light-theme', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    drawWheel();
}

// --- EVENT LISTENERS ---
addNameBtn.addEventListener('click', addName);
nameInput.addEventListener('keypress', e => { if (e.key === 'Enter') addName(); });
spinBtn.addEventListener('click', spinWheel);
closeBtn.addEventListener('click', () => popup.style.display = 'none');
themeToggle.addEventListener('change', e => switchTheme(e.target.checked));

// --- INITIAL LOAD ---
function init() {
    const savedTheme = localStorage.getItem('theme') === 'light';
    themeToggle.checked = savedTheme;
    switchTheme(savedTheme);
    updateNameList();
    drawWheel();
}

init();