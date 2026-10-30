/**
 * Ajith Kumar Racing - Multi-Angle Cinematic Director Mode
 */
class CameraDirector {
    constructor() {
        this.modes = ['CHASE', 'COCKPIT', 'BUMPER', 'HELI', 'TRACKSIDE'];
        this.currentMode = 'CHASE';
    }

    setMode(mode) {
        if (this.modes.includes(mode)) {
            this.currentMode = mode;
        }
        return this.currentMode;
    }

    next() {
        const idx = (this.modes.indexOf(this.currentMode) + 1) % this.modes.length;
        this.currentMode = this.modes[idx];
        return this.currentMode;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CameraDirector };
}
