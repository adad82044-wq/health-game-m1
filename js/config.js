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

  // แสดงป้ายบอกชื่อไฟล์รูปมุมบนซ้ายหรือไม่ (ตั้งเป็น false เพื่อความสวยงาม)
  showAssetDebugHint: false,

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
    "พี่กาย": { bg: "#4f46e5", border: "#818cf8", role: "รุ่นพี่ที่คุยอยู่" },
    "ครูอำนาจ": { bg: "#059669", border: "#34d399", role: "ครูฝ่ายปกครอง" },
    "บรรยาย": { bg: "#475569", border: "#94a3b8", role: "เหตุการณ์" }
  },

  // ==========================================================================
  // พาธรูปภาพทั้งหมด (ตรงกับไฟล์ในโฟลเดอร์ assets/scenes และ assets/avatars)
  // ==========================================================================
  assets: {
    backgrounds: {
      BG_01: {
        path: "assets/scenes/08_bg_empty_alley.png?v=8",
        label: "08: ซอกตึกหลังอาคาร 3 (ฉากเปล่า)",
        theme: "alley"
      },
      BG_MINT_ARM: {
        path: "assets/scenes/01_scene_mint_arm.png?v=8",
        label: "01: มินต์และอาร์มในซอกตึก",
        theme: "alley"
      },
      BG_BAS_OFFER: {
        path: "assets/scenes/02_scene_bas_offer.png?v=8",
        label: "02: บาสยื่นพอตในซอกตึก",
        theme: "alley"
      },
      BG_02: {
        path: "assets/scenes/03_scene_assembly_flagpole.png?v=8",
        label: "03: ลานหน้าเสาธงตอนเช้า",
        theme: "morning"
      },
      BG_TEACHER_PODIUM: {
        path: "assets/scenes/04_scene_teacher_amnat.png?v=8",
        label: "04: ครูอำนาจประกาศหน้าเสาธง",
        theme: "morning"
      },
      BG_03: {
        path: "assets/scenes/05_ending_bad_a_discipline.png?v=8",
        label: "05: ห้องฝ่ายปกครอง & แม่ร้องไห้",
        theme: "office"
      },
      BG_BAD_B: {
        path: "assets/scenes/06_ending_bad_b_health.png?v=8",
        label: "06: ทรุดคาสนามฟุตบอล หายใจไม่ออก",
        theme: "alley"
      },
      BG_BAD_C: {
        path: "assets/scenes/07_ending_bad_c_wallet.png?v=13",
        label: "07: กระเป๋าตังค์ฉีก & เพื่อนทิ้ง",
        theme: "alley"
      },
      BG_TEACHER_CATCH: {
        path: "assets/scenes/09_scene_teacher_catch_alley.png?v=13",
        label: "09: ครูอำนาจบุกจับได้หลังตึก 3",
        theme: "alley"
      },
      BG_THREE_FRIENDS: {
        path: "assets/scenes/10_scene_three_friends_alley.png?v=14",
        label: "10: เพื่อนทั้ง 3 คน (มินต์ บาส อาร์ม) ยืนกดดันหลังตึก",
        theme: "alley"
      },
      BG_BAD_B_FEMALE: {
        path: "assets/scenes/11_ending_bad_b_female_guy.png?v=14",
        label: "11: พี่กายผิดหวังเดินหนี เนยร้องไห้เสียใจ",
        theme: "alley"
      }
    },

    sprites: {
      SPRITE_BAS: {
        path: "assets/scenes/02_scene_bas_offer.png?v=8",
        label: "02: บาส (ยื่นพอต)",
        character: "bas"
      },
      SPRITE_FRIENDS: {
        path: "assets/scenes/01_scene_mint_arm.png?v=8",
        label: "01: มินต์ & อาร์ม",
        character: "friends"
      },
      SPRITE_TEACHER: {
        path: "assets/scenes/04_scene_teacher_amnat.png?v=8",
        label: "04: ครูอำนาจ",
        character: "teacher"
      }
    },

    avatars: {
      AVATAR_M: {
        path: "assets/avatars/avatar_non_male.png?v=13",
        label: "อวาตาร์ นนท์ (ปกติ)"
      },
      AVATAR_F: {
        path: "assets/avatars/avatar_noey_female.png?v=13",
        label: "อวาตาร์ เนย (ปกติ)"
      },
      AVATAR_M_RELIEF: {
        path: "assets/avatars/avatar_non_relief.png?v=13",
        label: "อวาตาร์ นนท์ (โล่งใจ/ภูมิใจ)"
      },
      AVATAR_F_RELIEF: {
        path: "assets/avatars/avatar_noey_relief.png?v=13",
        label: "อวาตาร์ เนย (โล่งใจ/ภูมิใจ)"
      },
      AVATAR_M_STRESS: {
        path: "assets/avatars/avatar_non_stress.png?v=13",
        label: "อวาตาร์ นนท์ (เครียด/สำนึกผิด)"
      },
      AVATAR_F_STRESS: {
        path: "assets/avatars/avatar_noey_stress.png?v=13",
        label: "อวาตาร์ เนย (เครียด/สำนึกผิด)"
      }
    },

    cgs: {
      CG_BAS_OFFER: {
        path: "assets/scenes/02_scene_bas_offer.png?v=8",
        label: "02: บาสยื่นพอตหลังตึก",
        theme: "bas_offer"
      },
      CG_GOOD: {
        path: "assets/scenes/03_scene_assembly_flagpole.png?v=8",
        label: "03: รอดพ้นหน้าเสาธง",
        theme: "good"
      },
      CG_BAD_A: {
        path: "assets/scenes/05_ending_bad_a_discipline.png?v=8",
        label: "05: ห้องปกครอง & แม่ร้องไห้",
        theme: "bad_family"
      },
      CG_BAD_B: {
        path: "assets/scenes/06_ending_bad_b_health.png?v=14",
        label: "06: ทรุดข้างสนาม หายใจไม่ออก",
        theme: "bad_health"
      },
      CG_BAD_B_FEMALE: {
        path: "assets/scenes/11_ending_bad_b_female_guy.png?v=14",
        label: "11: พี่กายผิดหวังเดินจากไป",
        theme: "bad_health"
      },
      CG_BAD_C: {
        path: "assets/scenes/07_ending_bad_c_wallet.png?v=8",
        label: "07: กระเป๋าตังค์ฉีก & ถูกเมิน",
        theme: "bad_money"
      }
    }
  }
};
