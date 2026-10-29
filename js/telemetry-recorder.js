/**
 * AK Racing - Telemetry Session Recorder & Exporter
 * High-frequency logging (60Hz) of vehicle telemetry with CSV/JSON export for sim analysis.
 */
export class TelemetryRecorder {
  constructor() {
    this.isRecording = false;
    this.sessionData = [];
    this.startTime = null;
  }

  start() {
    this.isRecording = true;
    this.sessionData = [];
    this.startTime = performance.now();
    console.log('[Telemetry] Recording session started.');
  }

  recordFrame(telemetry) {
    if (!this.isRecording) return;
    const timestamp = ((performance.now() - this.startTime) / 1000).toFixed(3);
    this.sessionData.push({
      time: parseFloat(timestamp),
      speedKmh: Math.round(telemetry.speed || 0),
      rpm: Math.round(telemetry.rpm || 0),
      gear: telemetry.gear || 1,
      throttle: parseFloat((telemetry.throttle || 0).toFixed(2)),
      brake: parseFloat((telemetry.brake || 0).toFixed(2)),
      hybridBoost: !!telemetry.hybridBoost,
      lateralG: parseFloat((telemetry.lateralG || 0).toFixed(2)),
      longitudinalG: parseFloat((telemetry.longitudinalG || 0).toFixed(2))
    });
  }

  stop() {
    this.isRecording = false;
    console.log(`[Telemetry] Session stopped. Captured ${this.sessionData.length} telemetry frames.`);
    return this.sessionData;
  }

  exportCSV() {
    if (!this.sessionData.length) return null;
    const headers = Object.keys(this.sessionData[0]).join(',');
    const rows = this.sessionData.map(d => Object.values(d).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AK_Racing_Telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJSON() {
    if (!this.sessionData.length) return null;
    const jsonStr = JSON.stringify({
      vehicle: 'Ferrari 499P LMH - AK Racing #50',
      recordedAt: new Date().toISOString(),
      sampleRateHz: 60,
      frames: this.sessionData
    }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AK_Racing_Telemetry_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
