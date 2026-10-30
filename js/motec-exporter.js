/**
 * Ajith Kumar Racing - MoTeC i2 Pro Telemetry Exporter
 */
class MotecExporter {
    static generateCsv(telemetryRows) {
        const header = "Time,GroundSpeed,EngineRPM,Gear,ThrottlePos,BrakePress,GForceLat,GForceLong\n";
        const body = telemetryRows.map(r => 
            `${r.time.toFixed(3)},${r.speed.toFixed(1)},${r.rpm.toFixed(0)},${r.gear},${r.throttle.toFixed(1)},${r.brake.toFixed(1)},${r.gLat.toFixed(2)},${r.gLong.toFixed(2)}`
        ).join('\n');
        return header + body;
    }

    static download(telemetryRows, filename = "akr_session_motec.csv") {
        const csvContent = this.generateCsv(telemetryRows);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MotecExporter };
}
