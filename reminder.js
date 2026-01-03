// reminder.js

// 1. Parse Query Parameters
// 1. Parse Query Parameters
const params = new URLSearchParams(window.location.search);
const subject = params.get('subject') || 'Unknown Meeting';
const startTimeStr = params.get('startTime');

// 2. Update UI
document.getElementById('subject').textContent = subject;

function updateTime() {
    if (!startTimeStr) {
        document.getElementById('time-details').textContent = "Time unknown";
        return;
    }
    const start = new Date(startTimeStr).getTime();
    const now = Date.now();
    const diff = start - now;

    let text = "";
    const absDiff = Math.abs(diff);
    const minutes = Math.floor(absDiff / 60000);
    const seconds = Math.floor((absDiff % 60000) / 1000);

    if (diff > 0) {
        // Future
        if (minutes > 0) {
            text = `Starts in ${minutes}m ${seconds}s`;
        } else {
            text = `Starts in ${seconds}s`;
        }
    } else {
        // Past
        if (minutes > 0) {
            text = `Started ${minutes}m ${seconds}s ago`;
        } else {
            text = `Started ${seconds}s ago`;
        }
    }
    document.getElementById('time-details').textContent = text;
}

updateTime();
setInterval(updateTime, 1000);

// 3. Sound Logic (Web Audio API)
let audioCtx = null;

function playBeep() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Sound configuration
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, audioCtx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // Drop to A4

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// 4. Loop the sound to be "Naggy"
// Try to play immediately. Note: Chrome might block autoplay until interaction.
// However, popups created by extensions often have exemption or we can just try.
try {
    playBeep();
    const intervalId = setInterval(playBeep, 3000); // Beep every 3 seconds

    // Stop beeping when window is closed or dismissed
    window.onbeforeunload = () => {
        clearInterval(intervalId);
        if (audioCtx) audioCtx.close();
    };
} catch (e) {
    console.error("Audio play failed", e);
}

// 5. Dismiss Button
document.getElementById('dismiss-btn').addEventListener('click', () => {
    window.close();
});
