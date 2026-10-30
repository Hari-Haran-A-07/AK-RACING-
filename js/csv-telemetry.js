/**
 * Ajith Kumar Racing - High-Speed Streaming CSV Exporter
 */
class CsvTelemetryStreamer {
    constructor() {
        this.buffer = [];
    }

    pushSample(sample) {
        this.buffer.push({
            t: (performance.now() / 1000).toFixed(3),
            ...sample
        });
    }

    flushCsv() {
        const lines = ["timestamp,speed,rpm,gear,lateralG"];
        for (const row of this.buffer) {
            lines.push(`${row.t},${row.speed},${row.rpm},${row.gear},${row.lateralG}`);
        }
        this.buffer = [];
        return lines.join('\n');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CsvTelemetryStreamer };
}
