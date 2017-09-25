# homebridge-sonoff-tasmota-http-led

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) which makes it possible to control Sonoff LED Strip with [Tasmota](https://github.com/arendst/Sonoff-Tasmota) firmware through HTTP only

## Example config

```json
{
  "accessory": "SonoffTasmotaHTTPLED",
  "name": "Sonoff-LED",
  "hostname": "The hostname of the Sonoff device"
}
```