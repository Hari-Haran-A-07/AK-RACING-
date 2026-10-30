/**
 * Ajith Kumar Racing - Cosworth-Style Multifunction Steering Wheel LCD Display
 */
class SteeringWheelDash {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(telemetry) {
        if (!this.container) return;
        const { gear, speed, rpm, lapDelta, fuelLiters } = telemetry;
        this.container.innerHTML = `
            <div class="dash-lcd">
                <div class="dash-top-leds">
                    <span class="led ${rpm > 7500 ? 'green' : ''}"></span>
                    <span class="led ${rpm > 8200 ? 'yellow' : ''}"></span>
                    <span class="led ${rpm > 8700 ? 'red' : ''}"></span>
                    <span class="led ${rpm > 8900 ? 'blue flash' : ''}"></span>
                </div>
                <div class="dash-gear">${gear}</div>
                <div class="dash-speed">${speed} KM/H</div>
                <div class="dash-delta ${lapDelta < 0 ? 'purple' : 'yellow'}">${lapDelta > 0 ? '+' : ''}${lapDelta.toFixed(2)}</div>
                <div class="dash-fuel">FUEL: ${fuelLiters.toFixed(1)}L</div>
            </div>
        `;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SteeringWheelDash };
}
