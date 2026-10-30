# 🏎️ Telemetry Channel Specification (FIA Homologated)

The following channels are streamed at 60Hz across the AKR telemetry WebSocket bus:

| Channel | Description | Units | Range |
|---|---|---|---|
| `GroundSpeed` | True GPS ground speed | km/h | 0 - 365 |
| `EngineRPM` | Internal combustion crank RPM | RPM | 850 - 9200 |
| `Gear` | Transmission gear ratio selected | Enum | R, N, 1-6 |
| `SteerAngle` | Steering wheel pinion angle | Deg | -450 to +450 |
| `GForceLat` | Lateral acceleration vector | G | -4.5 to +4.5 |
| `GForceLong` | Longitudinal acceleration vector | G | -5.0 to +2.5 |
| `BrakeDiscTemp`| Brake rotor core temperature | °C | 20 - 1100 |
| `FuelCell` | Remaining fuel mass | Liters | 0 - 120 |
