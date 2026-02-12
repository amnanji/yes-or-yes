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
    "Meteorologists report 100% chance of hugs tonight.",
    "BREAKING: World peace achieved (in this specific household).",
    "Sources say: 'He knew she would say yes all along.'",
    "Local husband planning excessive amount of chocolate purchases.",
    "BREAKING: Happiness levels exceeding measurable limits.",
    "Official Report: You are the best thing that ever happened to him."
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
    "Scientists warn: love levels critically low.",
    "BREAKING: Local husband googling 'how to mend a broken heart'.",
    "Witnesses report a single tear rolling down husband's cheek.",
    "Local husband considering a career as a sad poetry writer.",
    "BREAKING: Ice cream supplies running dangerously low.",
    "Local husband asks: 'Is it me? No, it can't be me.'"
];

/* ========================
   STATE MANAGEMENT
   ======================== */
let progress = 0;
let isHoldingNo = false;
let isHoldingYes = false;
let isYesClicked = false; // Remains true once success is triggered
let animationFrameId = null;
let newsIntervalId = null;
let newsIndex = 0; // Track current news item to avoid repeats

// DOM Elements
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const newsHeadline = document.getElementById('news-headline');
const modal = document.getElementById('modal');
const confettiCanvas = document.getElementById('confetti-canvas');

/* ========================
   YES BUTTON LOGIC (Hold to Fill)
   ======================== */
const startHoldingYes = (e) => {
    if (isYesClicked) return;
    if (e.type === 'touchstart') e.preventDefault();

    isHoldingYes = true;
    isHoldingNo = false; // Ensure we aren't holding both
    progressFill.style.transition = 'none';

    // Reset news index for a fresh start if we were at 0, or continue?
    // User said "Do not repeat them". If they let go and press again, should it reset?
    // Let's reset index only if progress was 0, otherwise continue.
    if (progress <= 1) newsIndex = 0;
    
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(updateYesProgress);
    
    cycleHappyNews();
};

const stopHoldingYes = () => {
    if (isYesClicked) return;
    isHoldingYes = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(newsIntervalId);
    
    // Decay if not successful
    decayProgress();
    
    if (!isYesClicked) {
         newsHeadline.innerText = "Don't stop now! 💘";
    }
};

function updateYesProgress(time) {
    if (!isHoldingYes || isYesClicked) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    // Fill Speed: 0 to 100 in roughly 2.5 seconds to allow reading some news
    // 100% / 2500ms = 0.04% per ms
    progress += 0.05 * (deltaTime); 

    if (progress >= 100) {
        progress = 100;
        triggerSuccess();
    }

    updateProgressUI(progress);
    
    if (!isYesClicked) {
        animationFrameId = requestAnimationFrame(updateYesProgress);
    }
}

function triggerSuccess() {
    isYesClicked = true;
    isHoldingYes = false;
    
    btnYes.disabled = true;
    btnNo.disabled = true;
    
    newsHeadline.innerText = "❤️ SHE SAID YES! ❤️";
    triggerConfetti();
    setTimeout(() => {
        modal.classList.remove('hidden');
    }, 500);
}

// Events for Yes Button
btnYes.addEventListener('mousedown', startHoldingYes);
btnYes.addEventListener('touchstart', startHoldingYes, { passive: false });

btnYes.addEventListener('mouseup', stopHoldingYes);
btnYes.addEventListener('mouseleave', stopHoldingYes);
btnYes.addEventListener('touchend', stopHoldingYes);
btnYes.addEventListener('touchcancel', stopHoldingYes);


/* ========================
   NO BUTTON LOGIC (Hold to Fill)
   ======================== */
const startHoldingNo = (e) => {
    if (isYesClicked) return;
    if (e.type === 'touchstart') e.preventDefault();
    
    isHoldingNo = true;
    isHoldingYes = false;
    progressFill.style.transition = 'none';
    
    if (progress <= 1) newsIndex = 0;

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(updateNoProgress);
    
    cycleSadNews();
};

const stopHoldingNo = () => {
    if (isYesClicked) return;
    isHoldingNo = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(newsIntervalId);
    
    decayProgress();
    newsHeadline.innerText = "Waiting for your answer...";
};

// Events for No Button
btnNo.addEventListener('mousedown', startHoldingNo);
btnNo.addEventListener('touchstart', startHoldingNo, { passive: false });

btnNo.addEventListener('mouseup', stopHoldingNo);
btnNo.addEventListener('mouseleave', stopHoldingNo);
btnNo.addEventListener('touchend', stopHoldingNo);
btnNo.addEventListener('touchcancel', stopHoldingNo);


/* ========================
   SHARED LOGIC
   ======================== */

let lastTime = 0;

function updateNoProgress(time) {
    if (!isHoldingNo) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;

    // Logic: 0-90% Linear, 90-95% Asymptotic
    if (progress < 90) {
        progress += 0.04 * (deltaTime / 16); 
    } else {
        const distance = 95 - progress;
        progress += distance * 0.01; 
    }

    if (progress > 95) progress = 95;

    updateProgressUI(progress);
    animationFrameId = requestAnimationFrame(updateNoProgress);
}

function decayProgress() {
    if (progress <= 0 || isHoldingNo || isHoldingYes || isYesClicked) return;
    progress -= 2; // Decay speed
    if (progress < 0) progress = 0;
    updateProgressUI(progress);
    requestAnimationFrame(decayProgress);
}

function cycleHappyNews() {
    newsHeadline.innerText = HAPPY_NEWS[0];
    newsIndex = 0;
    
    // Cycle every 600ms (faster than sad)
    newsIntervalId = setInterval(() => {
        newsIndex++;
        if (newsIndex < HAPPY_NEWS.length) {
            newsHeadline.innerText = HAPPY_NEWS[newsIndex];
        } else {
            // Stop cycling, stay on last message
            clearInterval(newsIntervalId);
        }
    }, 600);
}

function cycleSadNews() {
    newsHeadline.innerText = SAD_NEWS[0];
    newsIndex = 0;
    
    // Cycle every 1200ms
    newsIntervalId = setInterval(() => {
        newsIndex++;
        if (newsIndex < SAD_NEWS.length) {
            newsHeadline.innerText = SAD_NEWS[newsIndex];
        } else {
            // Stop cycling, stay on last message
            clearInterval(newsIntervalId);
        }
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
        particles = [];
    };
}
