/**
 * AK Racing - Pit Radio Chatter & Audio Filter Synthesizer
 * Simulates FIA endurance team radio communications with bandpass military filter effects.
 */
export class PitRadioChatter {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.messages = [
      "Box this lap, box this lap. Affirm.",
      "Push push push, delta is minus four tenths.",
      "Green flag, green flag! Full throttle out of Tertre Rouge.",
      "Good job surya! Pace is strong, gap behind is 3.8 seconds.",
      "Mode attack available, deploy hybrid boost on Mulsanne straight.",
      "Watch brake temps into Indianapolis, cool them down.",
      "Sector two purple! Outstanding lap time, keep this rhythm."
    ];
  }

  playRadioMessage(customText) {
    if (!this.ctx) return;
    const text = customText || this.messages[Math.floor(Math.random() * this.messages.length)];
    
    // Create radio static burst
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for authentic 1980-2020s radio comms (300Hz - 3.2kHz)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1750;
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();

    // Use Web Speech Synthesis if available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15;
      utterance.pitch = 0.95;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
    console.log(`[Pit Radio] "${text}"`);
  }
}
