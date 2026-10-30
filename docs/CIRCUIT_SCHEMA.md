# 🏁 Circuit Profile JSON Schema Specification

This document defines the standard JSON schema for circuits integrated into the Ajith Kumar Racing telemetry platform.

```json
{
  "id": "circuit-identifier",
  "name": "Full Circuit Name",
  "country": "Country Name",
  "lengthMeters": 5000,
  "turns": 16,
  "sectors": [
    {
      "sector": 1,
      "benchmarkSec": 32.500,
      "speedTrapKmh": 280.0
    }
  ]
}
```
