/**
 * ============================================================================
 * ระบบเสียงพากย์และเสียงประกอบ (AUDIO.JS)
 * ============================================================================
 * 1. ระบบเล่นไฟล์เสียงพากย์ (Voiceover .mp3/.wav จากโฟลเดอร์ assets/voices/)
 * 2. ระบบเสียงประกอบเหตุการณ์ (SFX) โดยตัดเสียงพิมพ์ตัวอักษรออกแล้ว
 * ============================================================================
 */

window.SoundManager = {
  ctx: null,
  muted: false,
  currentVoiceAudio: null,
  lastVoiceSrc: null,

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
    if (this.muted) {
      this.stopVoice();
    }
    return this.muted;
  },

  // หยุดเสียงพากย์ที่กำลังเล่นอยู่ (เช่น เมื่อกดข้ามไปประโยคถัดไป)
  stopVoice() {
    if (this.currentVoiceAudio) {
      try {
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio.currentTime = 0;
      } catch (e) {}
      this.currentVoiceAudio = null;
    }
  },

  // เล่นไฟล์เสียงพากย์ของประโยคปัจจุบัน
  playVoice(voicePath) {
    this.stopVoice();
    this.lastVoiceSrc = voicePath || null;

    if (this.muted || !voicePath) return;

    try {
      const cacheBustedUrl = voicePath.includes("?") ? voicePath : `${voicePath}?v=2`;
      const audio = new Audio(cacheBustedUrl);
      audio.volume = 1.0;
      this.currentVoiceAudio = audio;
      audio.play().catch(() => {
        // กรณียังไม่มีไฟล์เสียงพากย์ในโฟลเดอร์ จะข้ามไปอย่างเงียบๆ ไม่เกิด Error
      });
    } catch (e) {}
  },

  // กดฟังเสียงพากย์ประโยคเดิมซ้ำ
  replayLastVoice() {
    if (this.lastVoiceSrc) {
      this.playVoice(this.lastVoiceSrc);
    }
  },

  // เสียงคลิกปุ่มเบาๆ เฉพาะตอนกดเลือกช้อยส์หรือเปลี่ยนหน้า
  playClick() {
    this.init();
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  },

  // เสียงเอฟเฟกต์ตามเหตุการณ์ในเรื่อง (หัวใจเต้น, ไมค์หอน, แจ้งเตือน)
  playSFX(type) {
    this.init();
    if (this.muted || !this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      if (type === "heartbeat") {
        [0, 0.22].forEach((offset, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(idx === 0 ? 75 : 60, now + offset);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.17);
        });
      } else if (type === "mic_feedback") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1950, now);
        osc.frequency.linearRampToValueAtTime(2150, now + 0.45);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.56);
      } else if (type === "siren" || type === "cough") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.43);
      } else if (type === "chime" || type === "breeze") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0.07, now + i * 0.09);
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
