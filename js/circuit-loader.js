/**
 * Ajith Kumar Racing - Circuit Loader & Track Map Visualizer
 */
class CircuitLoader {
    constructor() {
        this.circuits = new Map();
        this.activeCircuit = null;
    }

    async loadCircuit(circuitId) {
        if (this.circuits.has(circuitId)) {
            this.activeCircuit = this.circuits.get(circuitId);
            return this.activeCircuit;
        }
        try {
            const res = await fetch(`data/circuits/${circuitId}.json`);
            if (!res.ok) throw new Error(`Circuit not found: ${circuitId}`);
            const data = await res.json();
            this.circuits.set(circuitId, data);
            this.activeCircuit = data;
            return data;
        } catch (err) {
            console.warn(`[CircuitLoader] Falling back to memory profile:`, err);
            return this.activeCircuit;
        }
    }

    renderSvgTrackMap(containerId) {
        const el = document.getElementById(containerId);
        if (!el || !this.activeCircuit) return;
        el.innerHTML = `
            <div class="circuit-card">
                <h3>${this.activeCircuit.name}</h3>
                <p>Length: ${(this.activeCircuit.lengthMeters / 1000).toFixed(2)} km | Turns: ${this.activeCircuit.turns}</p>
                <div class="circuit-badge">Record: ${this.activeCircuit.recordLap.time} (${this.activeCircuit.recordLap.driver})</div>
            </div>
        `;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CircuitLoader };
}
