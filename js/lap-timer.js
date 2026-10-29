/**
 * AK Racing - High-Precision Lap Timer & Local Leaderboard
 * Milisecond-accurate timing with sector splits and persistent localStorage ranking.
 */
export class LapTimer {
  constructor() {
    this.lapStartTime = 0;
    this.currentLapTime = 0;
    this.isRunning = false;
    this.currentSector = 1;
    this.sectors = [0, 0, 0];
    this.bestLapTime = parseFloat(localStorage.getItem('ak_best_lap') || '0') || null;
  }

  startLap() {
    this.lapStartTime = performance.now();
    this.isRunning = true;
    this.currentSector = 1;
    this.sectors = [0, 0, 0];
  }

  update() {
    if (!this.isRunning) return 0;
    this.currentLapTime = (performance.now() - this.lapStartTime) / 1000;
    return this.currentLapTime;
  }

  completeSector(sectorIndex) {
    if (sectorIndex >= 1 && sectorIndex <= 3) {
      this.sectors[sectorIndex - 1] = this.currentLapTime;
      this.currentSector = Math.min(3, sectorIndex + 1);
    }
  }

  finishLap() {
    if (!this.isRunning) return null;
    const finalLap = this.currentLapTime;
    this.isRunning = false;

    let isNewBest = false;
    if (!this.bestLapTime || finalLap < this.bestLapTime) {
      this.bestLapTime = finalLap;
      localStorage.setItem('ak_best_lap', finalLap.toString());
      isNewBest = true;
    }

    // Save to leaderboard history
    const history = JSON.parse(localStorage.getItem('ak_lap_history') || '[]');
    history.push({ time: finalLap, date: new Date().toISOString(), sectors: [...this.sectors] });
    history.sort((a, b) => a.time - b.time);
    localStorage.setItem('ak_lap_history', JSON.stringify(history.slice(0, 10)));

    return { time: finalLap, isNewBest, formatted: this.formatTime(finalLap) };
  }

  formatTime(seconds) {
    if (!seconds) return '00:00.000';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
}
