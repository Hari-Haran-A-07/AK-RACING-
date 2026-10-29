/**
 * AK Racing - Gamepad API Steering Wheel & Controller Integration
 * Native direct input handling for racing wheels (Logitech G29, Thrustmaster) & gamepads.
 */
export class GamepadInputHandler {
  constructor(onInputCallback) {
    this.onInput = onInputCallback || (() => {});
    this.gamepadIndex = null;
    this.deadzone = 0.08;
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      console.log(`[Gamepad] Connected: ${e.gamepad.id} at index ${e.gamepad.index}`);
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.gamepadIndex === e.gamepad.index) {
        console.log(`[Gamepad] Disconnected: ${e.gamepad.id}`);
        this.gamepadIndex = null;
      }
    });
  }

  poll() {
    if (this.gamepadIndex === null) return null;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return null;

    // Standard Gamepad Mapping:
    // Right Trigger (Button 7): Throttle
    // Left Trigger (Button 6): Brake
    // Right Bumper (Button 5): Shift Up
    // Left Bumper (Button 4): Shift Down
    // Left Stick X (Axis 0): Steering
    const throttle = gp.buttons[7] ? gp.buttons[7].value : 0;
    const brake = gp.buttons[6] ? gp.buttons[6].value : 0;
    const shiftUp = gp.buttons[5] ? gp.buttons[5].pressed : false;
    const shiftDown = gp.buttons[4] ? gp.buttons[4].pressed : false;
    const boost = gp.buttons[0] ? gp.buttons[0].pressed : false; // A / Cross button

    let steerAxis = gp.axes[0] || 0;
    if (Math.abs(steerAxis) < this.deadzone) steerAxis = 0;

    const inputData = { throttle, brake, steerAxis, shiftUp, shiftDown, boost };
    this.onInput(inputData);
    return inputData;
  }
}
