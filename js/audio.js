/**
 * ============================================================================
 * ระบบเสียงประกอบสังเคราะห์ (AUDIO.JS - Web Audio API)
 * ============================================================================
 * สร้างเอฟเฟกต์เสียงอัตโนมัติโดยไม่ต้องโหลดไฟล์ .mp3 จากภายนอก
 * ============================================================================
 */

window.SoundManager = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  // เสียงพิมพ์ตัวอักษร (Typewriter blip)
  playType() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520 + Math.random() * 140, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  },

  // เสียงคลิกปุ่ม
  playClick() {
    this.init();
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  },

  // เสียงเอฟเฟกต์ตามเหตุการณ์ในเรื่อง
  playSFX(type) {
    this.init();
    if (this.muted || !this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      if (type === "heartbeat") {
        // เสียงหัวใจเต้นตึก-ตัก
        [0, 0.22].forEach((offset, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(idx === 0 ? 75 : 60, now + offset);
          gain.gain.setValueAtTime(0.22, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.17);
        });
      } else if (type === "mic_feedback") {
        // เสียงไมค์หอนหน้าเสาธง "วี๊ดดด"
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1950, now);
        osc.frequency.linearRampToValueAtTime(2150, now + 0.45);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.11, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.56);
      } else if (type === "siren" || type === "cough") {
        // เสียงตกใจ/ตึงเครียด
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.43);
      } else if (type === "chime" || type === "breeze") {
        // เสียงสดใส/โล่งอก
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0.08, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.36);
        });
      }
    } catch (e) {}
  }
};
