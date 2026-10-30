/**
 * ============================================================================
 * ระบบสังเคราะห์เสียงพากย์ Multi-Segment SSML Prosody & Breath Engine
 * ============================================================================
 * แก้ปัญหาเสียงโมโนโทนและพูดรัวติดกัน โดย:
 * 1. ตั้งค่า xml:lang="th-TH" ให้ตรงกับโครงสร้างวรรณยุกต์ภาษาไทย
 * 2. หั่นแต่ละประโยคออกเป็น "วลีอารมณ์ (Emotional Clauses)"
 * 3. ปรับ Pitch (สูง-ต่ำ), Rate (ช้า-เร็ว), Volume (ดัง-เบา) แยกกันในแต่ละวลี
 * 4. ตัดช่องว่างส่วนเกินและแทรกเฟรมหยุดหายใจ (SSML Break Time) ระดับมิลลิวินาที
 * ============================================================================
 */

const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');
const path = require('path');

const voiceDir = path.join(__dirname, 'assets', 'voices');
if (!fs.existsSync(voiceDir)) {
  fs.mkdirSync(voiceDir, { recursive: true });
}

const FRAME_SIZE = 144; // 24ms ต่อเฟรมสำหรับ 24kHz 48kbps mono MP3

// ตรวจสอบว่าเฟรม MP3 นั้นเป็นเฟรมเงียบหรือไม่
function isSilentFrame(frameBuf) {
  let active = 0;
  for (let i = 4; i < frameBuf.length; i++) {
    const b = frameBuf[i];
    if (b !== 0 && b !== 0xff && b !== 0xaa && b !== 0x55) {
      active++;
    }
  }
  return active <= 28;
}

// ตัดความเงียบหัว-ท้ายของแต่ละวลีออก เพื่อให้คุมจังหวะเว้นวรรคได้แม่นยำ
function trimMP3Silence(buf) {
  const totalFrames = Math.floor(buf.length / FRAME_SIZE);
  if (totalFrames <= 4) return { trimmed: buf, silentFrame: buf.subarray(0, FRAME_SIZE) };

  let startFrame = 0;
  while (startFrame < totalFrames - 2 && isSilentFrame(buf.subarray(startFrame * FRAME_SIZE, (startFrame + 1) * FRAME_SIZE))) {
    startFrame++;
  }
  // เผื่อขอบหน้า 2 เฟรม (~48ms) ไม่ให้หัวคำขาด
  startFrame = Math.max(0, startFrame - 2);

  let endFrame = totalFrames - 1;
  let capturedSilentFrame = null;
  while (endFrame > startFrame + 2 && isSilentFrame(buf.subarray(endFrame * FRAME_SIZE, (endFrame + 1) * FRAME_SIZE))) {
    if (!capturedSilentFrame) {
      capturedSilentFrame = Buffer.from(buf.subarray(endFrame * FRAME_SIZE, (endFrame + 1) * FRAME_SIZE));
    }
    endFrame--;
  }
  // เผื่อหางเสียง 3 เฟรม (~72ms) ให้หางเสียงนุ่มเป็นธรรมชาติ
  endFrame = Math.min(totalFrames - 1, endFrame + 3);

  return {
    trimmed: buf.subarray(startFrame * FRAME_SIZE, (endFrame + 1) * FRAME_SIZE),
    silentFrame: capturedSilentFrame
  };
}

async function synthClause(voice, clause) {
  const tts = new EdgeTTS({
    voice,
    lang: 'th-TH',
    pitch: clause.pitch || '+0Hz',
    rate: clause.rate || '+0%',
    volume: clause.volume || '+0%',
    timeout: 15000
  });
  const chunks = [];
  for await (const chunk of tts.streamAudio(clause.text)) {
    if (Buffer.isBuffer(chunk)) chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function buildExpressiveAudio(item) {
  const outputBuffers = [];
  let referenceSilentFrame = null;

  for (let i = 0; i < item.clauses.length; i++) {
    const clause = item.clauses[i];
    const rawBuf = await synthClause(item.voice, clause);
    const { trimmed, silentFrame } = trimMP3Silence(rawBuf);
    if (silentFrame && !referenceSilentFrame) {
      referenceSilentFrame = silentFrame;
    }
    outputBuffers.push(trimmed);

    // แทรกจังหวะหยุดหายใจ (Break Time) ตามที่กำหนดในแต่ละวลี
    const pauseMs = clause.breakMs !== undefined ? clause.breakMs : 280;
    if (pauseMs > 0 && referenceSilentFrame && i < item.clauses.length - 1) {
      const pauseFrames = Math.max(1, Math.round(pauseMs / 24));
      for (let f = 0; f < pauseFrames; f++) {
        outputBuffers.push(referenceSilentFrame);
      }
    }
  }

  return Buffer.concat(outputBuffers);
}

const VOICE_SCRIPT = [
  // ==========================================================================
  // หมวด 1: ฉากเปิดเรื่อง (มุมอับหลังอาคาร 3)
  // ==========================================================================
  {
    file: '01_narrator_intro.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เวลา สิบหกนาฬิกา สิบห้านาที', pitch: '-3Hz', rate: '-6%', breakMs: 420 },
      { text: 'หลังเลิกเรียน', pitch: '-5Hz', rate: '-8%', breakMs: 550 },
      { text: 'บริเวณมุมอับ หลังอาคารสาม', pitch: '-2Hz', rate: '-5%', breakMs: 380 },
      { text: 'ใกล้ห้องน้ำเก่าและพงหญ้า', pitch: '-4Hz', rate: '-6%', breakMs: 450 },
      { text: 'ที่เงาตึก ทอดบังสายตาครู', pitch: '-8Hz', rate: '-10%', breakMs: 0 }
    ]
  },
  {
    file: '02_player_thought_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เลิกเรียนแล้วแท้ๆ...', pitch: '+8Hz', rate: '-4%', breakMs: 450 },
      { text: 'แต่บาส บอกให้ตามมาตรงนี้', pitch: '+5Hz', rate: '+2%', breakMs: 320 },
      { text: 'บอกมีอะไรเด็ดๆ จะให้ดู', pitch: '+9Hz', rate: '+4%', breakMs: 500 },
      { text: 'พอเดินมาถึงหลังตึก', pitch: '+4Hz', rate: '-4%', breakMs: 360 },
      { text: 'ถึงได้เห็นว่า พวกมันกำลังทำอะไรกันอยู่...', pitch: '+2Hz', rate: '-8%', breakMs: 0 }
    ]
  },
  {
    file: '02_player_thought_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'เลิกเรียนแล้วแท้ๆ...', pitch: '+4Hz', rate: '-4%', breakMs: 450 },
      { text: 'แต่บาส บอกให้ตามมาตรงนี้', pitch: '+2Hz', rate: '+2%', breakMs: 320 },
      { text: 'บอกมีอะไรเด็ดๆ จะให้ดู', pitch: '+6Hz', rate: '+4%', breakMs: 500 },
      { text: 'พอเดินมาถึงหลังตึก', pitch: '+1Hz', rate: '-4%', breakMs: 360 },
      { text: 'ถึงได้เห็นว่า พวกมันกำลังทำอะไรกันอยู่...', pitch: '-2Hz', rate: '-8%', breakMs: 0 }
    ]
  },
  {
    file: '03_mint_greet.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'อ้าว!', pitch: '+16Hz', rate: '+10%', volume: '+15%', breakMs: 300 },
      { text: 'มาช้าจังวะ?', pitch: '+10Hz', rate: '+4%', breakMs: 420 },
      { text: 'นึกว่าจะไม่กล้ามาซะแล้ว!', pitch: '+6Hz', rate: '+2%', breakMs: 0 }
    ]
  },
  {
    file: '04_arm_tease.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เด็กดีก็งี้แหละ...', pitch: '-6Hz', rate: '-6%', breakMs: 420 },
      { text: 'ปอดแหกเปล่าไม่รู้!', pitch: '-3Hz', rate: '+2%', volume: '+10%', breakMs: 300 },
      { text: 'หึๆ', pitch: '-10Hz', rate: '-10%', breakMs: 0 }
    ]
  },
  {
    file: '05_bas_offer.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เห้ย!', pitch: '+16Hz', rate: '+8%', volume: '+20%', breakMs: 350 },
      { text: 'ลองดูหน่อยเปล่า?', pitch: '+11Hz', rate: '-2%', breakMs: 320 },
      { text: 'ดีนะเว้ย!', pitch: '+15Hz', rate: '+6%', volume: '+15%', breakMs: 420 },
      { text: 'กลิ่นแตงโมอย่างหอมเลยยย', pitch: '+10Hz', rate: '-4%', breakMs: 300 },
      { text: 'ไม่แสบคอด้วย!', pitch: '+12Hz', rate: '+4%', breakMs: 420 },
      { text: 'ของนำเข้าเลยนะมึง', pitch: '+8Hz', rate: '+2%', breakMs: 340 },
      { text: 'ลองดูสักที จะได้คุยกับพวกกูรู้เรื่อง!', pitch: '+13Hz', rate: '+5%', volume: '+15%', breakMs: 0 }
    ]
  },
  {
    file: '06_narrator_choice.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'สายตาของเพื่อนทั้งสามคน กำลังจ้องมองมาที่คุณ', pitch: '-4Hz', rate: '-6%', breakMs: 480 },
      { text: 'บาส ยื่นบุหรี่ไฟฟ้ามาจ่อตรงหน้า', pitch: '-2Hz', rate: '-4%', breakMs: 520 },
      { text: 'คุณจะตอบว่าอย่างไร?', pitch: '+2Hz', rate: '-8%', volume: '+10%', breakMs: 0 }
    ]
  },

  // ==========================================================================
  // หมวด 2: การตอบรับเมื่อปฏิเสธ
  // ==========================================================================
  {
    file: '07_bas_reply_family.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เออๆ!', pitch: '+14Hz', rate: '+8%', breakMs: 300 },
      { text: 'รีบไปเหอะ ไอ้ลูกคุณหนู!', pitch: '+10Hz', rate: '+4%', breakMs: 420 },
      { text: 'เดี๋ยวแม่แกมารอ แล้วพวกกูซวยไปด้วย!', pitch: '+8Hz', rate: '+6%', breakMs: 0 }
    ]
  },
  {
    file: '08_bas_reply_sport.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เออว่ะ!', pitch: '+14Hz', rate: '+8%', breakMs: 320 },
      { text: 'ลืมไปว่ามึงมีซ้อม', pitch: '+9Hz', rate: '+2%', breakMs: 400 },
      { text: 'ไปฟิตให้รอดนะเว้ย!', pitch: '+13Hz', rate: '+6%', volume: '+10%', breakMs: 350 },
      { text: 'ถ้าแข่งแพ้ พวกกูตามไปล้อแน่!', pitch: '+10Hz', rate: '+4%', breakMs: 0 }
    ]
  },
  {
    file: '09_bas_reply_redirect.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เออ!', pitch: '+12Hz', rate: '+6%', breakMs: 320 },
      { text: 'งั้นฝากซื้อชาเขียวขวดนึง', pitch: '+9Hz', rate: '+2%', breakMs: 380 },
      { text: 'เดี๋ยวพวกกูรีบตามออกไป!', pitch: '+11Hz', rate: '+6%', breakMs: 0 }
    ]
  },

  // ==========================================================================
  // หมวด 3: ฉากจบที่ดี (Good Ending)
  // ==========================================================================
  {
    file: '10_player_escape1_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'โอเค!', pitch: '+12Hz', rate: '+8%', breakMs: 280 },
      { text: 'ดีแล้วที่ไม่โดนตื๊ออีก', pitch: '+8Hz', rate: '+4%', breakMs: 360 },
      { text: 'รีบไปดีกว่า!', pitch: '+12Hz', rate: '+10%', breakMs: 0 }
    ]
  },
  {
    file: '10_player_escape1_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'โอเค!', pitch: '+8Hz', rate: '+8%', breakMs: 280 },
      { text: 'ดีแล้วที่ไม่โดนตื๊ออีก', pitch: '+4Hz', rate: '+4%', breakMs: 360 },
      { text: 'รีบไปดีกว่า!', pitch: '+8Hz', rate: '+10%', breakMs: 0 }
    ]
  },
  {
    file: '11_narrator_walkaway.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'หันหลัง เดินก้าวเร็วๆ ออกมาจากซอกตึก', pitch: '-2Hz', rate: '+2%', breakMs: 420 },
      { text: 'แสงแดดส่องกระทบหน้า ลมพัดเย็นสบาย', pitch: '+0Hz', rate: '-6%', breakMs: 450 },
      { text: 'ความอึดอัดเมื่อครู่ ค่อยๆ หายไป', pitch: '-3Hz', rate: '-8%', breakMs: 0 }
    ]
  },
  {
    file: '12_player_sigh_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เฮ้อออ...', pitch: '+2Hz', rate: '-15%', breakMs: 520 },
      { text: 'นึกว่าจะโดนบังคับให้ลองซะแล้ว', pitch: '+6Hz', rate: '-2%', breakMs: 420 },
      { text: 'โชคดีที่พูดออกไปแบบนั้น!', pitch: '+9Hz', rate: '+2%', breakMs: 0 }
    ]
  },
  {
    file: '12_player_sigh_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'เฮ้อออ...', pitch: '-2Hz', rate: '-15%', breakMs: 520 },
      { text: 'นึกว่าจะโดนบังคับให้ลองซะแล้ว', pitch: '+3Hz', rate: '-2%', breakMs: 420 },
      { text: 'โชคดีที่พูดออกไปแบบนั้น!', pitch: '+6Hz', rate: '+2%', breakMs: 0 }
    ]
  },
  {
    file: '13_narrator_morning.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เช้าวันรุ่งขึ้น', pitch: '+0Hz', rate: '-6%', breakMs: 400 },
      { text: 'เวลา แปดนาฬิกาตรง', pitch: '-2Hz', rate: '-6%', breakMs: 420 },
      { text: 'ณ ลานเข้าแถวเคารพธงชาติ หน้าเสาธง', pitch: '-3Hz', rate: '-8%', breakMs: 0 }
    ]
  },
  {
    file: '14_player_wonder_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เอ๊ะ?', pitch: '+14Hz', rate: '+6%', breakMs: 380 },
      { text: 'แถวข้างๆ ทำไมแหว่งไปวะ?', pitch: '+9Hz', rate: '+2%', breakMs: 480 },
      { text: 'บาส... อาร์ม... มินต์...', pitch: '+6Hz', rate: '-8%', breakMs: 420 },
      { text: 'หายไปไหนกันหมดทั้งกลุ่มเลย?', pitch: '+11Hz', rate: '+2%', breakMs: 0 }
    ]
  },
  {
    file: '14_player_wonder_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'เอ๊ะ?', pitch: '+12Hz', rate: '+6%', breakMs: 380 },
      { text: 'แถวข้างๆ ทำไมแหว่งไปวะ?', pitch: '+6Hz', rate: '+2%', breakMs: 480 },
      { text: 'บาส... อาร์ม... มินต์...', pitch: '+3Hz', rate: '-8%', breakMs: 420 },
      { text: 'หายไปไหนกันหมดทั้งกลุ่มเลย?', pitch: '+8Hz', rate: '+2%', breakMs: 0 }
    ]
  },
  {
    file: '15_narrator_mic.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เสียงไมโครโฟนบนเวทีหน้าเสาธง ดังหวีดขึ้น!', pitch: '+0Hz', rate: '+2%', breakMs: 420 },
      { text: 'พร้อมร่างของครูอำนาจ ฝ่ายปกครอง', pitch: '-4Hz', rate: '-4%', breakMs: 380 },
      { text: 'ที่ก้าวขึ้นมาถือไมค์ ด้วยสีหน้าเคร่งขรึม', pitch: '-6Hz', rate: '-8%', breakMs: 0 }
    ]
  },
  {
    file: '16_teacher_announce.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'นักเรียนทุกคนฟัง!', pitch: '-14Hz', rate: '-6%', volume: '+25%', breakMs: 550 },
      { text: 'เมื่อวานช่วงเย็น', pitch: '-16Hz', rate: '-8%', volume: '+15%', breakMs: 350 },
      { text: 'ครูเวรได้ลงพื้นที่ตรวจ และจับกุมนักเรียนกลุ่มหนึ่ง', pitch: '-15Hz', rate: '-4%', volume: '+15%', breakMs: 420 },
      { text: 'มั่วสุมเสพบุหรี่และบุหรี่ไฟฟ้า บริเวณหลังอาคารสาม!', pitch: '-12Hz', rate: '-4%', volume: '+20%', breakMs: 550 },
      { text: 'ขณะนี้ ทางฝ่ายปกครองได้ยึดของกลาง', pitch: '-16Hz', rate: '-6%', volume: '+15%', breakMs: 420 },
      { text: 'และกำลังประสานผู้ปกครอง ของนักเรียนทุกคนในกลุ่ม ให้มาพบด่วน!', pitch: '-13Hz', rate: '-6%', volume: '+25%', breakMs: 0 }
    ]
  },
  {
    file: '17_player_realize_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เชี่ยยย!', pitch: '+16Hz', rate: '+4%', volume: '+20%', breakMs: 450 },
      { text: 'เมื่อวาน ครูลงตรวจจริงๆ ด้วย!', pitch: '+12Hz', rate: '+8%', volume: '+15%', breakMs: 480 },
      { text: 'ถ้าเมื่อวาน กูใจอ่อนลองไปคำเดียว', pitch: '+8Hz', rate: '+2%', breakMs: 380 },
      { text: 'ป่านนี้กูคงไปยืนก้มหน้าอยู่ในห้องปกครอง', pitch: '+5Hz', rate: '+4%', breakMs: 360 },
      { text: 'โดนเรียกพ่อแม่มาแล้ว!', pitch: '+10Hz', rate: '+6%', breakMs: 520 },
      { text: 'โคตรโชคดีเลย ที่รอดมาได้!', pitch: '+13Hz', rate: '-2%', volume: '+15%', breakMs: 0 }
    ]
  },
  {
    file: '17_player_realize_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'เชี่ยยย!', pitch: '+12Hz', rate: '+4%', volume: '+20%', breakMs: 450 },
      { text: 'เมื่อวาน ครูลงตรวจจริงๆ ด้วย!', pitch: '+9Hz', rate: '+8%', volume: '+15%', breakMs: 480 },
      { text: 'ถ้าเมื่อวาน เราใจอ่อนลองไปคำเดียว', pitch: '+5Hz', rate: '+2%', breakMs: 380 },
      { text: 'ป่านนี้เราคงไปยืนก้มหน้าอยู่ในห้องปกครอง', pitch: '+2Hz', rate: '+4%', breakMs: 360 },
      { text: 'โดนเรียกพ่อแม่มาแล้ว!', pitch: '+7Hz', rate: '+6%', breakMs: 520 },
      { text: 'โคตรโชคดีเลย ที่รอดมาได้!', pitch: '+10Hz', rate: '-2%', volume: '+15%', breakMs: 0 }
    ]
  },

  // ==========================================================================
  // หมวด 4: Bad Endings (สุ่ม 1 ใน 3)
  // ==========================================================================
  {
    file: '18_bas_cheer.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'มันต้องยังงี้ดิวะเพื่อน!', pitch: '+15Hz', rate: '+10%', volume: '+20%', breakMs: 360 },
      { text: 'มาๆ!', pitch: '+18Hz', rate: '+12%', volume: '+20%', breakMs: 260 },
      { text: 'ดูดลึกๆ เลย!', pitch: '+12Hz', rate: '+6%', volume: '+15%', breakMs: 0 }
    ]
  },
  {
    file: '19_teacher_catch.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'หยุดเดี๋ยวนี้!!', pitch: '-10Hz', rate: '+8%', volume: '+30%', breakMs: 420 },
      { text: 'ทำอะไรกันน่ะ?!', pitch: '-8Hz', rate: '+10%', volume: '+25%', breakMs: 400 },
      { text: 'อยู่กันครบกลุ่มเลยนะ!', pitch: '-12Hz', rate: '+4%', volume: '+20%', breakMs: 380 },
      { text: 'ส่งของในมือ มาให้หมดเดี๋ยวนี้!!', pitch: '-10Hz', rate: '+6%', volume: '+30%', breakMs: 0 }
    ]
  },
  {
    file: '20_bad_a_narrator.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'ที่ห้องฝ่ายปกครอง', pitch: '-6Hz', rate: '-10%', breakMs: 500 },
      { text: 'บาส มินต์ อาร์ม และเพื่อนๆ ยืนหน้าซีดตัวสั่น', pitch: '-4Hz', rate: '-6%', breakMs: 480 },
      { text: 'คุณแม่ของคุณ ต้องลางานกะทันหัน', pitch: '-5Hz', rate: '-8%', breakMs: 400 },
      { text: 'มานั่งยกมือไหว้ขอโทษครู ด้วยน้ำตา', pitch: '-8Hz', rate: '-12%', breakMs: 0 }
    ]
  },
  {
    file: '21_bad_a_regret_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'แค่ยอมลองคำเดียว เพราะกลัวเพื่อนล้อ...', pitch: '+2Hz', rate: '-10%', breakMs: 550 },
      { text: 'แต่คนที่ต้องมาร้องไห้ และอับอายที่สุด', pitch: '+0Hz', rate: '-8%', breakMs: 450 },
      { text: 'กลับเป็นแม่ของเราเอง...', pitch: '-4Hz', rate: '-14%', breakMs: 0 }
    ]
  },
  {
    file: '21_bad_a_regret_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'แค่ยอมลองคำเดียว เพราะกลัวเพื่อนล้อ...', pitch: '-2Hz', rate: '-10%', breakMs: 550 },
      { text: 'แต่คนที่ต้องมาร้องไห้ และอับอายที่สุด', pitch: '-4Hz', rate: '-8%', breakMs: 450 },
      { text: 'กลับเป็นแม่ของเราเอง...', pitch: '-6Hz', rate: '-14%', breakMs: 0 }
    ]
  },
  {
    file: '22_bad_b_cough_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'แค่ก! แค่กๆๆ!', pitch: '+14Hz', rate: '+12%', volume: '+20%', breakMs: 420 },
      { text: 'อ่อก... แสบคอ...', pitch: '+4Hz', rate: '-12%', breakMs: 480 },
      { text: 'หายใจ... ไม่ออก...', pitch: '-2Hz', rate: '-18%', breakMs: 0 }
    ]
  },
  {
    file: '22_bad_b_cough_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'แค่ก! แค่กๆๆ!', pitch: '+10Hz', rate: '+12%', volume: '+20%', breakMs: 420 },
      { text: 'อ่อก... แสบคอ...', pitch: '+0Hz', rate: '-12%', breakMs: 480 },
      { text: 'หายใจ... ไม่ออก...', pitch: '-5Hz', rate: '-18%', breakMs: 0 }
    ]
  },
  {
    file: '23_bad_b_narrator.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'สารเคมีและนิโคตินความเข้มข้นสูง', pitch: '-3Hz', rate: '-4%', breakMs: 380 },
      { text: 'ทำให้หลอดลม หดเกร็งเฉียบพลัน!', pitch: '+0Hz', rate: '+2%', volume: '+15%', breakMs: 480 },
      { text: 'คุณมึนหัว ตาพร่า', pitch: '-4Hz', rate: '-8%', breakMs: 400 },
      { text: 'และเมื่อถึงชั่วโมงซ้อมกีฬา ก็ทรุดลงไปกองกับพื้นสนาม', pitch: '-6Hz', rate: '-8%', breakMs: 0 }
    ]
  },
  {
    file: '24_bad_b_regret_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'ไหนบาสบอกว่า กลิ่นผลไม้ไม่แสบคอไง...', pitch: '+4Hz', rate: '-8%', breakMs: 500 },
      { text: 'แน่นหน้าอกไปหมด...', pitch: '+0Hz', rate: '-12%', breakMs: 450 },
      { text: 'วิ่งได้ไม่ถึงสองนาที ก็หอบจนหมดสิทธิ์คัดตัวแล้ว...', pitch: '-2Hz', rate: '-10%', breakMs: 0 }
    ]
  },
  {
    file: '24_bad_b_regret_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'ไหนบาสบอกว่า กลิ่นผลไม้ไม่แสบคอไง...', pitch: '+0Hz', rate: '-8%', breakMs: 500 },
      { text: 'แน่นหน้าอกไปหมด...', pitch: '-3Hz', rate: '-12%', breakMs: 450 },
      { text: 'ซ้อมได้ไม่ถึงสองนาที ก็หอบจนหมดสิทธิ์ลงแข่งแล้ว...', pitch: '-5Hz', rate: '-10%', breakMs: 0 }
    ]
  },
  {
    file: '25_bad_c_bas_money.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'เห็นปะล่ะว่าดี!', pitch: '+14Hz', rate: '+8%', breakMs: 420 },
      { text: 'อาทิตย์หน้า หัวพอตอันใหม่มา อันละสามร้อย', pitch: '+9Hz', rate: '+2%', breakMs: 400 },
      { text: 'มึงต้องหารกับพวกกูนะเว้ย!', pitch: '+12Hz', rate: '+6%', volume: '+15%', breakMs: 360 },
      { text: 'ไม่งั้น ไม่ให้เข้ากลุ่ม!', pitch: '+6Hz', rate: '-2%', volume: '+20%', breakMs: 0 }
    ]
  },
  {
    file: '26_bad_c_narrator.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'หนึ่งเดือนผ่านไป', pitch: '-5Hz', rate: '-10%', breakMs: 550 },
      { text: 'เงินค่าขนมและเงินเก็บ ที่คุณตั้งใจสะสมไว้ซื้อของที่อยากได้', pitch: '-4Hz', rate: '-6%', breakMs: 450 },
      { text: 'ถูกสูบหายไปกับค่าหัวพอตและน้ำยา จนเกลี้ยงกระเป๋า', pitch: '-7Hz', rate: '-10%', breakMs: 0 }
    ]
  },
  {
    file: '27_bad_c_regret_m.mp3',
    voice: 'th-TH-NiwatNeural',
    clauses: [
      { text: 'พอเราเริ่มไม่มีตังค์มาแชร์...', pitch: '+2Hz', rate: '-8%', breakMs: 480 },
      { text: 'บาสกับพวกก็เดินหนี ไม่ชวนคุยเหมือนเดิม', pitch: '+0Hz', rate: '-8%', breakMs: 520 },
      { text: 'สรุปที่ชวนเราวันนั้น', pitch: '+3Hz', rate: '-6%', breakMs: 380 },
      { text: 'ก็แค่หาคนช่วยออกตังค์ แค่นั้นเองเหรอ...', pitch: '-3Hz', rate: '-12%', breakMs: 0 }
    ]
  },
  {
    file: '27_bad_c_regret_f.mp3',
    voice: 'th-TH-PremwadeeNeural',
    clauses: [
      { text: 'พอเราเริ่มไม่มีตังค์มาแชร์...', pitch: '-1Hz', rate: '-8%', breakMs: 480 },
      { text: 'บาสกับพวกก็เดินหนี ไม่ชวนคุยเหมือนเดิม', pitch: '-3Hz', rate: '-8%', breakMs: 520 },
      { text: 'สรุปที่ชวนเราวันนั้น', pitch: '+0Hz', rate: '-6%', breakMs: 380 },
      { text: 'ก็แค่หาคนช่วยออกตังค์ แค่นั้นเองเหรอ...', pitch: '-5Hz', rate: '-12%', breakMs: 0 }
    ]
  }
];

async function generateAllExpressive() {
  console.log(`กำลังสร้างไฟล์เสียงพากย์แบบแยกวลีอารมณ์ (Multi-Segment SSML Prosody) ทั้งหมด ${VOICE_SCRIPT.length} ไฟล์...`);
  let count = 0;

  for (const item of VOICE_SCRIPT) {
    count++;
    const outPath = path.join(voiceDir, item.file);
    try {
      const audioBuffer = await buildExpressiveAudio(item);
      fs.writeFileSync(outPath, audioBuffer);
      console.log(`[${count}/${VOICE_SCRIPT.length}] สำเร็จ (${item.clauses.length} วลีอารมณ์): ${item.file}`);
    } catch (err) {
      console.error(`[${count}/${VOICE_SCRIPT.length}] ผิดพลาดที่ ${item.file}:`, err.message);
    }
  }
  console.log('เสร็จสิ้นการสร้างไฟล์เสียงพากย์แบบมีจังหวะและอารมณ์ทั้งหมด!');
}

generateAllExpressive();
