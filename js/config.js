/**
 * ============================================================================
 * ไฟล์ตั้งค่าระบบและพาธรูปภาพ (CONFIG.JS)
 * ============================================================================
 * วิธีเปลี่ยนรูปภาพ:
 * 1. นำรูปที่เจนจาก AI มาวางในโฟลเดอร์ assets/ ตามหมวดหมู่
 * 2. ตั้งชื่อไฟล์ให้ตรงกับที่ระบุไว้ด้านล่าง (หรือแก้ชื่อไฟล์ในโค้ดนี้ได้เลย)
 * 3. หากรูปลิงก์ไม่เจอ ระบบจะแสดงภาพกราฟิกจำลอง (SVG Placeholder) ให้อัตโนมัติ
 * ============================================================================
 */

window.GAME_CONFIG = {
  // ตั้งค่าความเร็วตัวอักษร (มิลลิวินาทีต่อตัวอักษร - ยิ่งน้อยยิ่งพิมพ์เร็ว)
  typingSpeed: 28,

  // แสดงป้ายบอกชื่อไฟล์รูปมุมบนซ้ายหรือไม่ (ตั้งเป็น false เมื่อนำรูปจริงใส่ครบแล้ว)
  showAssetDebugHint: true,

  // ค่าเริ่มต้นของตัวละครผู้เล่น
  defaultCharacters: {
    male: {
      name: "นนท์",
      pronounSelf: "กู",
      pronounFriend: "มึง",
      sportActivity: "คัดตัวนักบอลโรงเรียน",
      coachTitle: "โค้ช",
      avatarKey: "AVATAR_M"
    },
    female: {
      name: "เนย",
      pronounSelf: "เรา",
      pronounFriend: "แก",
      sportActivity: "ซ้อมวอลเลย์บอลโรงเรียน",
      coachTitle: "ครูฝึก",
      avatarKey: "AVATAR_F"
    }
  },

  // สีป้ายชื่อตัวละคร (Speaker Badge Color)
  speakerColors: {
    "player": { bg: "#2563eb", border: "#60a5fa", role: "ตัวคุณ" },
    "บาส": { bg: "#dc2626", border: "#f87171", role: "เพื่อนขาโจ๋" },
    "มินต์": { bg: "#db2777", border: "#f472b6", role: "เพื่อนในกลุ่ม" },
    "อาร์ม": { bg: "#d97706", border: "#fbbf24", role: "เพื่อนในกลุ่ม" },
    "ครูอำนาจ": { bg: "#059669", border: "#34d399", role: "ครูฝ่ายปกครอง" },
    "บรรยาย": { bg: "#475569", border: "#94a3b8", role: "เหตุการณ์" }
  },

  // ==========================================================================
  // พาธรูปภาพทั้งหมด (ตรงกับไฟล์ image_prompts.txt)
  // ==========================================================================
  assets: {
    backgrounds: {
      BG_01: {
        path: "assets/backgrounds/bg-01.png",
        label: "BG-01: มุมอับหลังอาคาร 3",
        theme: "alley"
      },
      BG_BAS_OFFER: {
        path: "assets/backgrounds/bg-bas-offer.png",
        label: "BG: บาสยื่นพอตในซอกตึก",
        theme: "alley"
      },
      BG_02: {
        path: "assets/backgrounds/bg-02.png",
        label: "BG-02: ลานหน้าเสาธงตอนเช้า",
        theme: "morning"
      },
      BG_03: {
        path: "assets/backgrounds/bg-03.png",
        label: "BG-03: ห้องฝ่ายปกครอง",
        theme: "office"
      }
    },

    sprites: {
      SPRITE_BAS: {
        path: "assets/sprites/sprite-01-bas.png",
        label: "SPRITE-01: บาส (ยื่นพอต)",
        character: "bas"
      },
      SPRITE_FRIENDS: {
        path: "assets/sprites/sprite-02-friends.png",
        label: "SPRITE-02: มินต์ & อาร์ม",
        character: "friends"
      },
      SPRITE_TEACHER: {
        path: "assets/sprites/sprite-03-teacher.png",
        label: "SPRITE-03: ครูอำนาจ",
        character: "teacher"
      }
    },

    avatars: {
      AVATAR_M: {
        path: "assets/avatars/avatar-m.png",
        label: "AVATAR-M: นนท์ (ชาย)"
      },
      AVATAR_F: {
        path: "assets/avatars/avatar-f.png",
        label: "AVATAR-F: เนย (หญิง)"
      }
    },

    cgs: {
      CG_BAS_OFFER: {
        path: "assets/cgs/cg-bas-offer.png",
        label: "CG: บาสยื่นพอตหลังตึก",
        theme: "bas_offer"
      },
      CG_GOOD: {
        path: "assets/cgs/cg-good.png",
        label: "CG-GOOD: รอดพ้นหน้าเสาธง",
        theme: "good"
      },
      CG_BAD_A: {
        path: "assets/cgs/cg-bad-a.png",
        label: "CG-BAD-A: ห้องปกครอง & แม่ร้องไห้",
        theme: "bad_family"
      },
      CG_BAD_B: {
        path: "assets/cgs/cg-bad-b.png",
        label: "CG-BAD-B: ทรุดข้างสนาม หายใจไม่ออก",
        theme: "bad_health"
      },
      CG_BAD_C: {
        path: "assets/cgs/cg-bad-c.png",
        label: "CG-BAD-C: กระเป๋าตังค์ฉีก & ถูกเมิน",
        theme: "bad_money"
      }
    }
  }
};
