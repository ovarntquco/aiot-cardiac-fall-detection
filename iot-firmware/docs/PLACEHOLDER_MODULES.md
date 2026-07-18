# IoT Firmware Placeholder Modules

This document tracks firmware-side scaffolding for future use cases. It does not change the current firmware behavior.

| Use Case | FR | Placeholder Area | TODO |
|----------|----|------------------|------|
| UC2 | FR2, FR3 | sensor collection | Define sampling cadence, packet format, and validation for heart-rate, SpO2, and motion samples. |
| UC5 | FR6, FR7 | SOS button | Define long-press detection and event publishing contract. |
| UC10 | FR15 | local alert | Define buzzer/display command handler and cancellation behavior. |
| UC11 | FR16, FR17, FR18, FR19 | alert response buttons | Define confirm/cancel button event schema and debounce rules. |

No hardware-control placeholder logic is implemented here.
