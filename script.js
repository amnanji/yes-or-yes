/* ========================
   CONSTANTS & DATA
   ======================== */
const HAPPY_NEWS = [
    "BREAKING: Local husband seen grinning uncontrollably.",
    "Experts confirm: today is officially 'Best Day Ever.'",
    "Local husband reportedly levitating due to joy.",
    "Scientists baffled by unprecedented levels of love.",
    "BREAKING: Wife declared 'Most Wonderful Person Alive.'",
    "Local husband spotted doing happy dance in kitchen.",
    "Meteorologists report 100% chance of hugs tonight."
];

const SAD_NEWS = [
    "BREAKING: Local husband slightly concerned.",
    "Local husband staring dramatically out the window.",
    "BREAKING: Emotional support cat deployed.",
    "Local husband seen listening to sad music in the rain.",
    "BREAKING: Experts alarmed by husband’s sigh frequency.",
    "Local bakery reports spike in ‘comfort cookies’ purchases.",
    "BREAKING: Stock market dips in response to husband’s mood.",
    "Local husband reportedly ‘rethinking everything.’",
    "BREAKING: City issues ‘Husband Sadness Advisory.’",
    "Scientists warn: love levels critically low."
];

/* ========================
   STATE MANAGEMENT
   ======================== */
let progress = 0;
let isHoldingNo = false;
let isYesClicked = false;
let animationFrameId = null;
let newsIntervalId = null;

// DOM Elements
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const newsHeadline = document.getElementById('news-headline');
const modal = document.getElementById('modal');
const confettiCanvas = document.getElementById('confetti-canvas');

/* ========================
   YES BUTTON LOGIC
   ======================== */
btnYes.addEventListener('click', () => {
    if (isYesClicked) return;
    isYesClicked = true;
    
    // Stop any No button logic
    isHoldingNo = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(newsIntervalId);
    
    // Disable buttons
    btnYes.disabled = true;
    btnNo.disabled = true;

    // Reset and prepare for fast fill
    progress = 0;
    updateProgressUI(0);
    progressFill.style.transition = 'width 1.0s ease-out'; // Fast CSS transition
    
    // Cycle Happy News
    let newsIndex = 0;
    newsHeadline.innerText = HAPPY_NEWS[0];
    const happyInterval = setInterval(() => {
        newsIndex = (newsIndex + 1) % HAPPY_NEWS.length;
        newsHeadline.innerText = HAPPY_NEWS[newsIndex];
    }, 150); // Fast cycle

    // Trigger fill
    requestAnimationFrame(() => {
        progress = 100;
        updateProgressUI(100);
    });

    // Complete after 1s
    setTimeout(() => {
        clearInterval(happyInterval);
        newsHeadline.innerText = "❤️ SHE SAID YES! ❤️";
        triggerConfetti();
        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 500);
    }, 1000);
});

/* ========================
   NO BUTTON LOGIC (Hold to Fill)
   ======================== */
const startHolding = (e) => {
    if (isYesClicked) return;
    
    // Only prevent default on touch to stop scrolling/zooming while holding
    // but keep it on mouse so we don't block other behaviors if needed
    if(e.type === 'touchstart') e.preventDefault();
    
    isHoldingNo = true;
    progressFill.style.transition = 'none'; // Disable transition for direct JS control
    
    // Start loop
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(updateNoProgress);
    
    // Start News Cycle
    cycleSadNews();
};

const stopHolding = () => {
    if (isYesClicked) return;
    isHoldingNo = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(newsIntervalId);
    newsHeadline.innerText = "Waiting for your answer...";
    
    // Optional: Decay progress back to 0?
    // User didn't specify, but it feels nicer if it doesn't just stick there forever unless requested.
    // The prompt said "Progress pauses (or slightly decays back — your choice for humor)."
    // Let's make it decay slowly for effect.
    decayProgress();
};

function decayProgress() {
    if (progress <= 0 || isHoldingNo || isYesClicked) return;
    progress -= 2;
    if (progress < 0) progress = 0;
    updateProgressUI(progress);
    requestAnimationFrame(decayProgress);
}

// Events for No Button
btnNo.addEventListener('mousedown', startHolding);
btnNo.addEventListener('touchstart', startHolding, { passive: false }); // Passive false to allow preventDefault

btnNo.addEventListener('mouseup', stopHolding);
btnNo.addEventListener('mouseleave', stopHolding);
btnNo.addEventListener('touchend', stopHolding);
btnNo.addEventListener('touchcancel', stopHolding);

let lastTime = 0;

function updateNoProgress(time) {
    if (!isHoldingNo) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;

    // Logic: 
    // 0-90%: Linear speed
    // 90-95%: Asymptotic decay
    // Cap: 95%

    // Speed factor: % per millisecond
    // 0.05 per 16ms ~= 3% per second (Slow)
    
    if (progress < 90) {
        // Slow linear speed
        progress += 0.04 * (deltaTime / 16); 
    } else {
        // Asymptotic approach to 95
        // The closer we get to 95, the smaller the increment
        const distance = 95 - progress;
        // distance gets smaller (5 -> 0.1)
        // Add a tiny fraction of the remaining distance
        progress += distance * 0.01; 
    }

    // Hard cap just in case floating point math goes weird
    if (progress > 95) progress = 95;

    updateProgressUI(progress);
    animationFrameId = requestAnimationFrame(updateNoProgress);
}

function cycleSadNews() {
    let index = 0;
    // Update immediately
    newsHeadline.innerText = SAD_NEWS[0];
    
    // Update every 1.2s roughly
    newsIntervalId = setInterval(() => {
        index = (index + 1) % SAD_NEWS.length;
        newsHeadline.innerText = SAD_NEWS[index];
    }, 1200); 
}

function updateProgressUI(val) {
    progressFill.style.width = `${val}%`;
    progressLabel.innerText = `${Math.floor(val)}%`;
}

/* ========================
   CONFETTI ENGINE
   ======================== */
const ctx = confettiCanvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        // Explosive velocity
        this.vx = (Math.random() - 0.5) * 20;
        this.vy = (Math.random() - 0.5) * 20 - 5; // Upward bias
        this.gravity = 0.4;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.size = Math.random() * 8 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.decay = Math.random() * 0.005 + 0.005;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function triggerConfetti() {
    // Spawn particles
    for (let i = 0; i < 200; i++) {
        particles.push(new Particle());
    }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Remove dead particles
    particles = particles.filter(p => p.life > 0);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    if (particles.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

// Check for prefers-reduced-motion
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mediaQuery.matches) {
    // Override triggerConfetti to be simpler
    triggerConfetti = () => {
        // Just clear particles to be safe
        particles = [];
    };
}
