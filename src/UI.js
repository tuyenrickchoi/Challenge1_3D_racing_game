// src/UI.js

export default class UI {
    constructor() {
        // Lấy các phần tử DOM
        this.speedElement = document.getElementById('speed');
        this.lapElement = document.getElementById('lap');
        this.timerElement = document.getElementById('timer');
        this.messageElement = document.getElementById('message');
    }

    updateSpeed(speed) {
        const kmh = (speed * 3.6).toFixed(0);
        this.speedElement.textContent = kmh;
    }

    updateLap(lap, totalLaps) {
        this.lapElement.textContent = `${lap} / ${totalLaps}`;
    }

    updateTimer(time) {
        this.timerElement.textContent = time.toFixed(2);
    }

    showMessage(text, duration = 1000, color = "rgba(255, 255, 0, 0.75)") {
        this.messageElement.textContent = text;
        this.messageElement.style.backgroundColor = color;
        this.messageElement.style.display = 'block';
        
        setTimeout(() => {
            this.messageElement.style.display = 'none';
        }, duration);
    }
}