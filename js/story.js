/**
 * ============================================================================
 * ไฟล์เนื้อเรื่องและบทสนทนาทั้งหมด (STORY.JS)
 * ============================================================================
 * โครงสร้าง:
 * - สามารถแก้ไขข้อความในเครื่องหมายคำพูด "..." ได้โดยตรง
 * - ช่อง voice: คือพาธไฟล์เสียงพากย์ในโฟลเดอร์ assets/voices/
 *   (สามารถนำไฟล์เสียงพากย์ .mp3 มาวางตามชื่อไฟล์ที่ระบุไว้ได้เลย)
 * - ตัวแปรอัตโนมัติที่ใช้ในข้อความได้:
 *   {name} = ชื่อผู้เล่น (เช่น นนท์ หรือ เนย)
 * ============================================================================
 */

window.STORY_DATA = {
  // ==========================================================================
  // ฉากที่ 1: มุมอับหลังอาคารเรียน 3 (Opening Scene)
  // ==========================================================================
  opening: [
    {
      id: "open_1",
      bg: "BG_01",
      sprites: ["SPRITE_FRIENDS"],
      speaker: "บรรยาย",
      mood: "tense",
      voice: "assets/voices/01_narrator_intro.mp3",
      text: "เวลา 16.15 น. หลังเลิกเรียน... บริเวณมุมอับหลังอาคาร 3 ใกล้ห้องน้ำเก่าและพงหญ้า ที่เงาตึกทอดบังสายตาครู"
    },
    {
      id: "open_2",
      bg: "BG_01",
      sprites: ["SPRITE_FRIENDS"],
      speaker: "player",
      isThought: true,
      mood: "tense",
      voiceMale: "assets/voices/02_player_thought_m.mp3",
      voiceFemale: "assets/voices/02_player_thought_f.mp3",
      text: "เลิกเรียนแล้วแท้ๆ... แต่บาสบอกให้ตามมาตรงนี้ บอกมีอะไรเด็ดๆ จะให้ดู พอเดินมาถึงหลังตึก ถึงได้เห็นว่าพวกมันกำลังทำอะไรกันอยู่..."
    },
    {
      id: "open_3",
      bg: "BG_01",
      sprites: ["SPRITE_FRIENDS"],
      activeSprite: "SPRITE_FRIENDS",
      speaker: "มินต์",
      mood: "smirk",
      voice: "assets/voices/03_mint_greet.mp3",
      text: "อ้าว {name} มาช้าจังวะ นึกว่าจะไม่กล้ามาซะแล้ว"
    },
    {
      id: "open_4",
      bg: "BG_01",
      sprites: ["SPRITE_FRIENDS"],
      activeSprite: "SPRITE_FRIENDS",
      speaker: "อาร์ม",
      mood: "mock",
      voice: "assets/voices/04_arm_tease.mp3",
      text: "เด็กดีก็งี้แหละ ปอดแหกเปล่าไม่รู้ หึๆ"
    },
    {
      id: "open_5",
      bg: "BG_BAS_OFFER",
      sprites: [],
      activeSprite: "",
      speaker: "บาส",
      mood: "challenge",
      sfx: "heartbeat",
      text: "เห้ย {name}... ลองดูเปล่า ดีนะเว้ย กลิ่นแตงโมอย่างหอมเลย ไม่แสบคอด้วย ของนำเข้าเลยนะมึง ลองดูสักทีจะได้คุยกับพวกกูรู้เรื่อง"
    },
    {
      id: "open_choice",
      bg: "BG_BAS_OFFER",
      sprites: [],
      activeSprite: "",
      speaker: "บรรยาย",
      mood: "pressure",
      sfx: "heartbeat",
      text: "สายตาของเพื่อนทั้ง 3 คนกำลังจ้องมองมาที่คุณ... บาสยื่นบุหรี่ไฟฟ้ามาจ่อตรงหน้า คุณจะตอบว่าอย่างไร?",
      choices: [
        {
          id: "choice_family",
          tag: "กลยุทธ์ที่ 1: อ้างครอบครัว",
          text: "“ไม่ได้เลย วันนี้แม่มารับเร็ว เดี๋ยวโดนเช็กของในกระเป๋า”",
          nextBranch: "refuse_family"
        },
        {
          id: "choice_sport",
          tag: "กลยุทธ์ที่ 2: อ้างสุขภาพ/กิจกรรม",
          textMale: "“ไม่ล่ะมึง เดี๋ยวมีคัดตัวนักบอลโรงเรียน หายใจไม่ทัน โค้ชด่าตาย”",
          textFemale: "“ไม่ล่ะแก เดี๋ยวมีซ้อมหลีด/ซ้อมวอลเลย์ หายใจไม่ทัน โดนบ่นตาย”",
          nextBranch: "refuse_sport"
        },
        {
          id: "choice_redirect",
          tag: "กลยุทธ์ที่ 3: เบี่ยงประเด็น/แยกตัว",
          text: "“พวกมึงสูบไปเหอะ เดี๋ยวกูไปซื้อน้ำหน้าปากซอย มีใครเอาอะไรไหม”",
          nextBranch: "refuse_redirect"
        },
        {
          id: "choice_accept",
          tag: "ยอมตามกระแสเพื่อน",
          text: "“เออ... ลองหน่อยก็ได้วะ”",
          isDanger: true,
          nextBranch: "RANDOM_BAD_ENDING"
        }
      ]
    }
  ],

  // ==========================================================================
  // กิ่งย่อยเมื่อเลือกปฏิเสธ (3 กลยุทธ์ -> เชื่อมเข้าสู่ Good Ending)
  // ==========================================================================
  refuse_family: [
    {
      bg: "BG_BAS_OFFER",
      sprites: [],
      activeSprite: "",
      speaker: "บาส",
      mood: "shrug",
      text: "เออๆ รีบไปเหอะไอ้ลูกคุณหนู เดี๋ยวแม่แกมารอแล้วพวกกูซวยไปด้วย!"
    },
    {
      nextBranch: "good_escape"
    }
  ],

  refuse_sport: [
    {
      bg: "BG_BAS_OFFER",
      sprites: [],
      activeSprite: "",
      speaker: "บาส",
      mood: "shrug",
      text: "เออว่ะ ลืมไปว่ามึงมีซ้อม ไปฟิตให้รอดนะเว้ย ถ้าแข่งแพ้พวกกูตามไปล้อแน่!"
    },
    {
      nextBranch: "good_escape"
    }
  ],

  refuse_redirect: [
    {
      bg: "BG_BAS_OFFER",
      sprites: [],
      activeSprite: "",
      speaker: "บาส",
      mood: "shrug",
      text: "เออ งั้นฝากซื้อชาเขียวขวดนึง เดี๋ยวพวกกูรีบตามออกไป"
    },
    {
      nextBranch: "good_escape"
    }
  ],

  // ==========================================================================
  // ฉากเดินแยกตัวออกมา + ฉากจบที่ดี (Good Ending: ความจริงหน้าเสาธง)
  // ==========================================================================
  good_escape: [
    {
      bg: "BG_01",
      sprites: [],
      speaker: "player",
      isThought: true,
      mood: "relief",
      voiceMale: "assets/voices/10_player_escape1_m.mp3",
      voiceFemale: "assets/voices/10_player_escape1_f.mp3",
      text: "โอเคดีเเล้วที่ไม่โดนตื๊ออีก รีบไปดีกว่า!"
    },
    {
      bg: "BG_02",
      sprites: [],
      speaker: "บรรยาย",
      mood: "calm",
      sfx: "breeze",
      voice: "assets/voices/11_narrator_walkaway.mp3",
      text: "{name} หันหลังเดินก้าวเร็วๆ ออกมาจากซอกตึก แสงแดดส่องกระทบหน้า ลมพัดเย็นสบาย ความอึดอัดเมื่อครู่ค่อยๆ หายไป"
    },
    {
      bg: "BG_02",
      sprites: [],
      speaker: "player",
      mood: "relief",
      voiceMale: "assets/voices/12_player_sigh_m.mp3",
      voiceFemale: "assets/voices/12_player_sigh_f.mp3",
      text: "เฮ้อ... นึกว่าจะโดนบังคับให้ลองซะแล้ว โชคดีที่พูดออกไปแบบนั้น"
    },
    {
      bg: "BG_02",
      sprites: [],
      speaker: "บรรยาย",
      mood: "morning",
      sfx: "chime",
      voice: "assets/voices/13_narrator_morning.mp3",
      text: "เช้าวันรุ่งขึ้น เวลา 08.00 น. ณ ลานเข้าแถวเคารพธงชาติหน้าเสาธง..."
    },
    {
      bg: "BG_02",
      sprites: [],
      speaker: "player",
      isThought: true,
      mood: "curious",
      voiceMale: "assets/voices/14_player_wonder_m.mp3",
      voiceFemale: "assets/voices/14_player_wonder_f.mp3",
      text: "เอ๊ะ... แถวข้างๆ ทำไมแหว่งไปวะ? บาส อาร์ม มินต์... หายไปไหนกันหมดทั้งกลุ่มเลย?"
    },
    {
      bg: "BG_02",
      sprites: ["SPRITE_TEACHER"],
      activeSprite: "SPRITE_TEACHER",
      speaker: "บรรยาย",
      mood: "shock",
      sfx: "mic_feedback",
      voice: "assets/voices/15_narrator_mic.mp3",
      text: "วี๊ดดดด...!! (เสียงไมโครโฟนบนเวทีหน้าเสาธงดังหวีดขึ้น พร้อมร่างของครูอำนาจ ฝ่ายปกครองที่ก้าวขึ้นมาถือไมค์ด้วยสีหน้าเคร่งขรึม)"
    },
    {
      bg: "BG_02",
      sprites: ["SPRITE_TEACHER"],
      activeSprite: "SPRITE_TEACHER",
      speaker: "ครูอำนาจ",
      mood: "stern",
      voice: "assets/voices/16_teacher_announce.mp3",
      text: "นักเรียนทุกคนฟัง! เมื่อวานช่วงเย็น ครูเวรได้ลงพื้นที่ตรวจและจับกุมนักเรียนกลุ่มหนึ่งมั่วสุมเสพบุหรี่และบุหรี่ไฟฟ้าบริเวณหลังอาคาร 3... ขณะนี้ทางฝ่ายปกครองได้ยึดของกลาง และกำลังประสานผู้ปกครองของนักเรียนทุกคนในกลุ่มให้มาพบด่วน!"
    },
    {
      bg: "BG_02",
      cg: "CG_GOOD",
      sprites: [],
      speaker: "player",
      isThought: true,
      mood: "shock_relief",
      sfx: "heartbeat",
      voiceMale: "assets/voices/17_player_realize_m.mp3",
      voiceFemale: "assets/voices/17_player_realize_f.mp3",
      text: "เชี่ยยย... เมื่อวานครูลงตรวจจริงๆ ด้วย! ถ้าเมื่อวานกูใจอ่อนลองไปคำเดียว ป่านนี้กูคงไปยืนก้มหน้าอยู่ในห้องปกครอง โดนเรียกพ่อแม่มาแล้ว... โคตรโชคดีเลยที่รอดมาได้!"
    },
    {
      ending: {
        type: "GOOD",
        code: "GOOD_ENDING",
        badge: "🎉 MISSION COMPLETE: รอดพ้นด้วยไหวพริบ",
        title: "ความจริงหน้าเสาธง",
        cg: "CG_GOOD",
        summary: "คุณใช้ทักษะการปฏิเสธอย่างมีชั้นเชิง สามารถเอาตัวรอดจากสถานการณ์กดดันหลังโรงเรียนได้โดยไม่เสียเพื่อน ไม่เสียสุขภาพ และไม่ต้องถูกเรียกผู้ปกครองเข้าห้องปกครอง",
        lessons: [
          "การอ้างผู้ปกครอง กิจกรรมชมรม/กีฬา หรือการขอตัวไปทำธุระ เป็นเกราะป้องกันที่เพื่อนมักไม่เซ้าซี้ต่อ",
          "ความกล้าหาญที่แท้จริง ไม่ใช่การยอมทำตามคำท้า แต่คือการกล้าปกป้องอนาคตของตัวเอง",
          "การพาตัวเองออกจากพื้นที่เสี่ยงให้เร็วที่สุด ช่วยตัดโอกาสการถูกกดดันซ้ำ"
        ]
      }
    }
  ],

  // ==========================================================================
  // กิ่ง Bad Ending (สุ่ม 1 ใน 3 เมื่อผู้เล่นเลือก "เออ... ลองหน่อยก็ได้วะ")
  // ==========================================================================
  bad_endings: {
    // แบบที่ 1: ด้านระเบียบวินัยและครอบครัว
    BAD_A: [
      {
        bg: "BG_BAS_OFFER",
        sprites: [],
        activeSprite: "",
        speaker: "บาส",
        mood: "smirk",
        text: "มันต้องยังงี้ดิวะเพื่อน มาๆ ดูดลึกๆ เลย!"
      },
      {
        bg: "BG_01",
        sprites: ["SPRITE_TEACHER"],
        activeSprite: "SPRITE_TEACHER",
        speaker: "ครูอำนาจ",
        mood: "stern",
        sfx: "siren",
        screenShake: true,
        voice: "assets/voices/19_teacher_catch.mp3",
        text: "หยุดเดี๋ยวนี้!! ทำอะไรกันน่ะ! อยู่กันครบกลุ่มเลยนะ ส่งของในมือมาให้หมดเดี๋ยวนี้!!"
      },
      {
        bg: "BG_03",
        cg: "CG_BAD_A",
        sprites: [],
        speaker: "บรรยาย",
        mood: "sad",
        voice: "assets/voices/20_bad_a_narrator.mp3",
        text: "ที่ห้องฝ่ายปกครอง... บาส มินต์ อาร์ม และ {name} ยืนหน้าซีดตัวสั่น คุณแม่ของคุณต้องลางานกะทันหันมานั่งยกมือไหว้ขอโทษครูด้วยน้ำตา"
      },
      {
        bg: "BG_03",
        cg: "CG_BAD_A",
        sprites: [],
        speaker: "player",
        isThought: true,
        mood: "regret",
        voiceMale: "assets/voices/21_bad_a_regret_m.mp3",
        voiceFemale: "assets/voices/21_bad_a_regret_f.mp3",
        text: "แค่ยอมลองคำเดียวเพราะกลัวเพื่อนล้อ... แต่คนที่ต้องมาร้องไห้และอับอายที่สุดกลับเป็นแม่ของเราเอง..."
      },
      {
        ending: {
          type: "BAD",
          code: "BAD_ENDING_A",
          randomSlot: "สุ่มผลลัพธ์แบบที่ 1 / 3 : ด้านระเบียบวินัยและครอบครัว",
          badge: "⚠️ BAD ENDING A: น้ำตาในห้องปกครอง",
          title: "ผลกระทบด้านระเบียบและครอบครัว",
          cg: "CG_BAD_A",
          summary: "ครูเวรเดินมาตรวจพบขณะคุณกำลังลองสูบ คุณถูกยึดของกลาง ตัดคะแนนความประพฤติ พักการเรียน และต้องเชิญผู้ปกครองมารับทราบความผิด",
          lessons: [
            "การอยู่ในกลุ่มมั่วสุมแม้เพียง 'ลองคำเดียว' เมื่อถูกตรวจพบจะต้องรับโทษทางวินัยเท่ากันทั้งหมด",
            "บุหรี่ไฟฟ้าเป็นสิ่งผิดกฎหมายและผิดระเบียบสถานศึกษาอย่างร้ายแรง",
            "ความสนุกชั่ววูบแลกมาด้วยความเสียใจของผู้ปกครองและประวัติที่ติดตัว"
          ]
        }
      }
    ],

    // แบบที่ 2: ด้านสุขภาพและสมรรถภาพร่างกายเฉพาะหน้า
    BAD_B: [
      {
        bg: "BG_BAS_OFFER",
        sprites: [],
        activeSprite: "",
        speaker: "บาส",
        mood: "smirk",
        text: "มันต้องยังงี้ดิวะเพื่อน มาๆ ดูดลึกๆ เลย!"
      },
      {
        bg: "BG_01",
        sprites: ["SPRITE_FRIENDS", "SPRITE_BAS"],
        speaker: "player",
        mood: "pain",
        sfx: "cough",
        screenShake: true,
        voiceMale: "assets/voices/22_bad_b_cough_m.mp3",
        voiceFemale: "assets/voices/22_bad_b_cough_f.mp3",
        text: "แค่ก!! แค่กๆๆ!! อ่อก... แสบคอ... หายใจไม่ออก..."
      },
      {
        bg: "BG_01",
        cg: "CG_BAD_B",
        sprites: [],
        speaker: "บรรยาย",
        mood: "danger",
        voice: "assets/voices/23_bad_b_narrator.mp3",
        text: "สารเคมีและนิโคตินความเข้มข้นสูงทำให้หลอดลมหดเกร็งเฉียบพลัน คุณมึนหัว ตาพร่า และเมื่อถึงชั่วโมงซ้อมกีฬาก็ทรุดลงไปกองกับพื้นสนาม"
      },
      {
        bg: "BG_01",
        cg: "CG_BAD_B",
        sprites: [],
        speaker: "player",
        isThought: true,
        mood: "regret",
        voiceMale: "assets/voices/24_bad_b_regret_m.mp3",
        voiceFemale: "assets/voices/24_bad_b_regret_f.mp3",
        text: "ไหนบาสบอกว่ากลิ่นผลไม้ไม่แสบคอไง... แน่นหน้าอกไปหมด วิ่งได้ไม่ถึงสองนาทีก็หอบจนหมดสิทธิ์คัดตัวแล้ว..."
      },
      {
        ending: {
          type: "BAD",
          code: "BAD_ENDING_B",
          randomSlot: "สุ่มผลลัพธ์แบบที่ 2 / 3 : ด้านร่างกายและสมรรถภาพเฉพาะหน้า",
          badge: "⚠️ BAD ENDING B: ปอดพัง หมดสิทธิ์ลงสนาม",
          title: "ผลกระทบด้านสุขภาพเฉียบพลัน",
          cg: "CG_BAD_B",
          summary: "ไอระเหยและนิโคตินเข้มข้นทำให้เกิดอาการหลอดลมตีบและระคายเคืองเฉียบพลัน สมรรถภาพปอดลดลงจนไม่สามารถเล่นกีฬาหรือทำกิจกรรมที่รักได้",
          lessons: [
            "กลิ่นหอมผลไม้ในบุหรี่ไฟฟ้าเป็นเพียงสารแต่งกลิ่นที่ใช้กลบความรุนแรงของนิโคตินและสารพิษ",
            "ไอบุหรี่ไฟฟ้ามีอนุภาคโลหะหนักและสารเคมีที่ทำลายถุงลมปอดได้ทันทีตั้งแต่ครั้งแรกที่สูดดม",
            "วัยรุ่นอายุ 12-13 ปี ระบบทางเดินหายใจและสมองยังพัฒนาไม่เต็มที่ จึงไวต่อพิษของนิโคตินมากกว่าผู้ใหญ่"
          ]
        }
      }
    ],

    // แบบที่ 3: ด้านการเงินและความสัมพันธ์ลวง
    BAD_C: [
      {
        bg: "BG_BAS_OFFER",
        sprites: [],
        activeSprite: "",
        speaker: "บาส",
        mood: "smirk",
        text: "มันต้องยังงี้ดิวะเพื่อน มาๆ ดูดลึกๆ เลย!"
      },
      {
        bg: "BG_01",
        sprites: ["SPRITE_BAS"],
        activeSprite: "SPRITE_BAS",
        speaker: "บาส",
        mood: "greedy",
        voice: "assets/voices/25_bad_c_bas_money.mp3",
        text: "เห็นปะล่ะว่าดี... อาทิตย์หน้าหัวพอตอันใหม่มา อันละ 300 มึงต้องหารกับพวกกูนะเว้ย ไม่งั้นไม่ให้เข้ากลุ่ม"
      },
      {
        bg: "BG_01",
        cg: "CG_BAD_C",
        sprites: [],
        speaker: "บรรยาย",
        mood: "sad",
        voice: "assets/voices/26_bad_c_narrator.mp3",
        text: "1 เดือนผ่านไป... เงินค่าขนมและเงินเก็บที่คุณตั้งใจสะสมไว้ซื้อของที่อยากได้ ถูกสูบหายไปกับค่าหัวพอตและน้ำยาจนเกลี้ยงกระเป๋า"
      },
      {
        bg: "BG_01",
        cg: "CG_BAD_C",
        sprites: [],
        speaker: "player",
        isThought: true,
        mood: "regret",
        voiceMale: "assets/voices/27_bad_c_regret_m.mp3",
        voiceFemale: "assets/voices/27_bad_c_regret_f.mp3",
        text: "พอเราเริ่มไม่มีตังค์มาแชร์... บาสกับพวกก็เดินหนี ไม่ชวนคุยเหมือนเดิม สรุปที่ชวนเราวันนั้น ก็แค่หาคนช่วยออกตังค์แค่นั้นเองเหรอ..."
      },
      {
        ending: {
          type: "BAD",
          code: "BAD_ENDING_C",
          randomSlot: "สุ่มผลลัพธ์แบบที่ 3 / 3 : ด้านการเงินและมิตรภาพจอมปลอม",
          badge: "⚠️ BAD ENDING C: กระเป๋าตังค์ฉีก ติดกับดักพอต",
          title: "ผลกระทบด้านการเงินและความสัมพันธ์",
          cg: "CG_BAD_C",
          summary: "คุณเริ่มติดนิโคตินและถูกเพื่อนกดดันให้ช่วยออกเงินซื้อหัวพอตเรื่อยๆ จนเงินเก็บหมดเกลี้ยง และเมื่อไม่มีเงิน เพื่อนกลุ่มนั้นก็ตีตัวออกห่าง",
          lessons: [
            "นิโคตินในบุหรี่ไฟฟ้าทำให้สมองเสพติดอย่างรวดเร็ว นำไปสู่รายจ่ายต่อเนื่องไม่รู้จบ",
            "หลายครั้งการชักชวนในกลุ่มวัยรุ่นมีเรื่อง 'การหาคนหารค่าของ' หรือ 'การขายต่อ' แอบแฝงอยู่",
            "เพื่อนที่ดีจริงจะไม่วัดคุณค่าของเรากันที่การสูบบุหรี่หรือการออกเงินซื้อสิ่งผิดกฎหมาย"
          ]
        }
      }
    ]
  }
};
