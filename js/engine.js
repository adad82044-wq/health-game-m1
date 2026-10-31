/**
 * ============================================================================
 * ตัวขับเคลื่อนเกมหลัก (ENGINE.JS - Visual Novel Core Engine)
 * ============================================================================
 * หน้าที่:
 * 1. จัดการหน้าเลือกเพศและชื่อผู้เล่น
 * 2. แสดงฉากหลัง สไปรต์ตัวละคร และกล่องบทสนทนาแบบพิมพ์ทีละตัวอักษร
 * 3. ระบบตรวจสอบไฟล์รูปจริง (หากยังไม่มีรูปในโฟลเดอร์ จะวาด SVG Anime Art แทน)
 * 4. ระบบสุ่มผลลัพธ์ 1 ใน 3 (Smart Randomizer)
 * ============================================================================
 */

window.VNEngine = {
  state: {
    gender: "male",
    playerName: "นนท์",
    currentBranch: [],
    stepIndex: 0,
    isTyping: false,
    typingTimer: null,
    fullCurrentText: "",
    seenEndings: new Set(),
    unseenBadPool: ["BAD_A", "BAD_B", "BAD_C"]
  },

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.selectGender("male");
  },

  cacheDOM() {
    // Screens
    this.startScreen = document.getElementById("start-screen");
    this.gameScreen = document.getElementById("game-screen");
    this.endingModal = document.getElementById("ending-modal");

    // Start Screen Elements
    this.btnMale = document.getElementById("btn-gender-male");
    this.btnFemale = document.getElementById("btn-gender-female");
    this.nameInput = document.getElementById("player-name-input");
    this.btnStartGame = document.getElementById("btn-start-game");

    // Stage Elements
    this.stageContainer = document.getElementById("vn-stage");
    this.ambientBgLayer = document.getElementById("ambient-bg-layer");
    this.sceneViewport = document.getElementById("scene-viewport");
    this.bgLayer = document.getElementById("bg-layer");
    this.cgLayer = document.getElementById("cg-layer");
    this.spriteLayer = document.getElementById("sprite-layer");
    this.assetHintBadge = document.getElementById("asset-hint-badge");

    // HUD & Dialogue Elements
    this.dialogueBox = document.getElementById("dialogue-box");
    this.speakerBadge = document.getElementById("speaker-badge");
    this.speakerRole = document.getElementById("speaker-role");
    this.dialogueText = document.getElementById("dialogue-text");
    this.nextIndicator = document.getElementById("next-indicator");
    this.playerAvatarBox = document.getElementById("player-avatar-box");
    this.choicesOverlay = document.getElementById("choices-overlay");
    this.choicesList = document.getElementById("choices-list");

    // Top Bar Controls
    this.btnFitToggle = document.getElementById("btn-fit-toggle");
    this.rotateHint = document.getElementById("rotate-hint");
    this.btnCloseHint = document.getElementById("btn-close-hint");
    this.btnMute = document.getElementById("btn-mute");
    this.btnRestartTop = document.getElementById("btn-restart-top");

    // Ending Screen Elements
    this.endBadge = document.getElementById("end-badge");
    this.endRandomSlot = document.getElementById("end-random-slot");
    this.endTitle = document.getElementById("end-title");
    this.endCgPreview = document.getElementById("end-cg-preview");
    this.endSummary = document.getElementById("end-summary");
    this.endLessons = document.getElementById("end-lessons");
    this.endProgressText = document.getElementById("end-progress-text");
    this.btnReplayChoice = document.getElementById("btn-replay-choice");
    this.btnRestartFull = document.getElementById("btn-restart-full");

    // Reflection Box Elements
    this.studentReflectionInput = document.getElementById("student-reflection-input");
    this.btnCopyReflection = document.getElementById("btn-copy-reflection");
    this.copyFeedback = document.getElementById("copy-feedback");

    // Elements for Saving Ending Card as Image
    this.endingCardCapture = document.getElementById("ending-card-capture");
    this.endStudentInfo = document.getElementById("end-student-info");
    this.endCgImg = document.getElementById("end-cg-img");
    this.reflectionPrintView = document.getElementById("reflection-print-view");
    this.btnSaveCardImage = document.getElementById("btn-save-card-image");
    this.saveStatusMsg = document.getElementById("save-status-msg");
    this.imagePreviewModal = document.getElementById("image-preview-modal");
    this.generatedCardPreview = document.getElementById("generated-card-preview");
    this.btnDirectDownload = document.getElementById("btn-direct-download");
    this.btnCloseImageModal = document.getElementById("btn-close-image-modal");
    this.btnDoneImageModal = document.getElementById("btn-done-image-modal");
  },

  bindEvents() {
    this.btnMale.addEventListener("click", () => {
      SoundManager.playClick();
      this.selectGender("male");
    });

    this.btnFemale.addEventListener("click", () => {
      SoundManager.playClick();
      this.selectGender("female");
    });

    this.btnStartGame.addEventListener("click", () => {
      SoundManager.playClick();
      this.startGame();
    });

    // คลิกที่กล่องข้อความหรือกรอบภาพฉากเพื่อไปต่อ หรือแสดงข้อความทันที
    this.dialogueBox.addEventListener("click", () => {
      this.handleDialogueAdvance();
    });

    if (this.sceneViewport) {
      this.sceneViewport.addEventListener("click", () => {
        this.handleDialogueAdvance();
      });
    }

    // รองรับปุ่ม Spacebar / Enter บนคีย์บอร์ด
    window.addEventListener("keydown", (e) => {
      if (
        (e.code === "Space" || e.code === "Enter") &&
        this.gameScreen.classList.contains("active") &&
        !this.choicesOverlay.classList.contains("visible") &&
        !this.endingModal.classList.contains("visible")
      ) {
        e.preventDefault();
        this.handleDialogueAdvance();
      }
    });

    this.btnMute.addEventListener("click", (e) => {
      e.stopPropagation();
      const isMuted = SoundManager.toggleMute();
      this.btnMute.textContent = isMuted ? "🔇 ปิดเสียง" : "🔊 เปิดเสียง";
    });

    this.btnRestartTop.addEventListener("click", (e) => {
      e.stopPropagation();
      SoundManager.playClick();
      this.returnToTitle();
    });

    // ปุ่มสลับโหมดภาพ พอดีจอ (Fit) / เต็มจอ (Cover) บนมือถือ
    if (this.btnFitToggle) {
      this.btnFitToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        SoundManager.playClick();
        const isContain = this.stageContainer.classList.toggle("fit-mode-contain");
        this.btnFitToggle.textContent = isContain ? "🔍 ภาพเต็มจอ" : "🖼️ ภาพพอดีจอ";
      });
    }

    if (this.rotateHint) {
      this.rotateHint.addEventListener("click", () => {
        if (this.btnFitToggle) this.btnFitToggle.click();
      });
    }

    if (this.btnCloseHint) {
      this.btnCloseHint.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.rotateHint) this.rotateHint.style.display = "none";
      });
    }

    this.btnReplayChoice.addEventListener("click", () => {
      SoundManager.playClick();
      this.endingModal.classList.remove("visible");
      this.jumpToChoiceNode();
    });

    this.btnRestartFull.addEventListener("click", () => {
      SoundManager.playClick();
      this.endingModal.classList.remove("visible");
      this.returnToTitle();
    });

    // ปุ่มคัดลอกคำตอบสะท้อนคิดท้ายเกม
    if (this.btnCopyReflection) {
      this.btnCopyReflection.addEventListener("click", () => {
        SoundManager.playClick();
        const text = (this.studentReflectionInput.value || "").trim();
        if (!text) {
          alert("กรุณาพิมพ์คำตอบของคุณก่อนกดคัดลอกครับ");
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            this.showCopyFeedback();
          }).catch(() => {
            this.fallbackCopyText();
          });
        } else {
          this.fallbackCopyText();
        }
      });
    }

    // บันทึกคำตอบลง localStorage อัตโนมัติขณะพิมพ์
    if (this.studentReflectionInput) {
      this.studentReflectionInput.addEventListener("input", () => {
        if (this.state.currentEndingCode) {
          try {
            localStorage.setItem(
              `health_game_reflection_${this.state.currentEndingCode}`,
              this.studentReflectionInput.value
            );
          } catch (e) {
            // Ignore localStorage errors
          }
        }
      });
    }

    // ปุ่มบันทึก UI ผลการเรียนรู้เป็นรูปภาพลงเครื่อง (ส่งครู)
    if (this.btnSaveCardImage) {
      this.btnSaveCardImage.addEventListener("click", () => {
        SoundManager.playClick();
        this.saveCardAsImage();
      });
    }

    if (this.btnCloseImageModal) {
      this.btnCloseImageModal.addEventListener("click", () => {
        this.imagePreviewModal.classList.remove("visible");
      });
    }

    if (this.btnDoneImageModal) {
      this.btnDoneImageModal.addEventListener("click", () => {
        this.imagePreviewModal.classList.remove("visible");
      });
    }
  },

  saveCardAsImage() {
    if (typeof html2canvas === "undefined") {
      alert("ระบบบันทึกรูปภาพกำลังโหลด กรุณารอสักครู่แล้วลองใหม่อีกครั้งครับ");
      return;
    }

    const reflectionText = (this.studentReflectionInput.value || "").trim();
    if (!reflectionText) {
      const confirmSave = confirm("คุณยังไม่ได้พิมพ์คำตอบสะท้อนคิด ต้องการบันทึกรูปภาพเลยหรือไม่?");
      if (!confirmSave) {
        this.studentReflectionInput.focus();
        return;
      }
    }

    if (this.saveStatusMsg) {
      this.saveStatusMsg.textContent = "กำลังสร้างรูปภาพ... ⏳";
      this.saveStatusMsg.classList.add("visible");
    }

    // สลับเอาข้อความที่พิมพ์มาใส่ใน reflectionPrintView ชั่วคราวเพื่อให้ html2canvas เรนเดอร์ได้คมชัดสมบูรณ์
    if (this.reflectionPrintView) {
      this.reflectionPrintView.textContent = reflectionText || "(ไม่ได้ระบุความคิดเห็นเพิ่มเติม)";
      this.reflectionPrintView.style.display = "block";
    }
    if (this.studentReflectionInput) {
      this.studentReflectionInput.style.display = "none";
    }

    const filename = `ผลการเรียนรู้สุขศึกษา_${this.state.playerName || "นักเรียน"}_${this.state.currentEndingCode || "ENDING"}.png`;

    html2canvas(this.endingCardCapture, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#0f172a",
      logging: false,
      ignoreElements: (element) => {
        return element.classList.contains("no-capture");
      }
    }).then((canvas) => {
      // คืนค่าการแสดงผลเดิม
      if (this.reflectionPrintView) {
        this.reflectionPrintView.style.display = "none";
      }
      if (this.studentReflectionInput) {
        this.studentReflectionInput.style.display = "block";
      }
      if (this.saveStatusMsg) {
        this.saveStatusMsg.classList.remove("visible");
      }

      const imgData = canvas.toDataURL("image/png");

      // ใส่รูปลงใน Modal พรีวิว
      if (this.generatedCardPreview) {
        this.generatedCardPreview.src = imgData;
      }
      if (this.btnDirectDownload) {
        this.btnDirectDownload.href = imgData;
        this.btnDirectDownload.download = filename;
      }

      // พยายามดาวน์โหลดอัตโนมัติลงเครื่อง
      try {
        const link = document.createElement("a");
        link.download = filename;
        link.href = imgData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        // Fallback to preview modal
      }

      // แสดง Modal แจ้งเตือนเพื่อให้ผู้ใช้มือถือสามารถแตะค้างเซฟรูปได้แน่นอน 100%
      if (this.imagePreviewModal) {
        this.imagePreviewModal.classList.add("visible");
      }
    }).catch((err) => {
      console.error("Capture error:", err);
      if (this.reflectionPrintView) this.reflectionPrintView.style.display = "none";
      if (this.studentReflectionInput) this.studentReflectionInput.style.display = "block";
      if (this.saveStatusMsg) this.saveStatusMsg.classList.remove("visible");
      alert("เกิดข้อผิดพลาดในการสร้างภาพ กรุณาลองใหม่อีกครั้งครับ");
    });
  },

  showCopyFeedback() {
    if (!this.copyFeedback) return;
    this.copyFeedback.classList.add("visible");
    setTimeout(() => {
      this.copyFeedback.classList.remove("visible");
    }, 2500);
  },

  fallbackCopyText() {
    if (!this.studentReflectionInput) return;
    this.studentReflectionInput.select();
    try {
      document.execCommand("copy");
      this.showCopyFeedback();
    } catch (err) {
      alert("ไม่สามารถคัดลอกได้อัตโนมัติ กรุณากดเลือกข้อความแล้วคัดลอกด้วยตนเองครับ");
    }
  },

  selectGender(gender) {
    this.state.gender = gender;
    const def = GAME_CONFIG.defaultCharacters[gender];
    this.btnMale.classList.toggle("selected", gender === "male");
    this.btnFemale.classList.toggle("selected", gender === "female");
    this.nameInput.value = def.name;
  },

  startGame() {
    const customName = this.nameInput.value.trim();
    const def = GAME_CONFIG.defaultCharacters[this.state.gender];
    this.state.playerName = customName || def.name;

    this.startScreen.classList.remove("active");
    this.gameScreen.classList.add("active");
    this.endingModal.classList.remove("visible");

    this.loadBranch("opening", 0);
  },

  returnToTitle() {
    clearTimeout(this.state.typingTimer);
    this.gameScreen.classList.remove("active");
    this.endingModal.classList.remove("visible");
    this.startScreen.classList.add("active");
  },

  jumpToChoiceNode() {
    // กระโดดกลับไปยังจุดตัดสินใจทันทีเพื่อให้ลองเลือกทางอื่นได้สะดวก
    const openingBranch = STORY_DATA.opening;
    const choiceIdx = openingBranch.findIndex((s) => Array.isArray(s.choices));
    this.loadBranch("opening", choiceIdx >= 0 ? choiceIdx : 0);
  },

  loadBranch(branchName, startIndex = 0) {
    if (branchName === "RANDOM_BAD_ENDING") {
      // สุ่ม 1 ใน 3 แบบฉลาด (ให้ความสำคัญกับฉากที่ผู้เล่นยังไม่เคยเจอก่อน)
      if (this.state.unseenBadPool.length === 0) {
        this.state.unseenBadPool = ["BAD_A", "BAD_B", "BAD_C"];
      }
      const randIdx = Math.floor(Math.random() * this.state.unseenBadPool.length);
      const pickedKey = this.state.unseenBadPool.splice(randIdx, 1)[0];
      this.state.currentBranch = STORY_DATA.bad_endings[pickedKey];
      this.state.stepIndex = 0;
      this.renderCurrentStep();
      return;
    }

    if (STORY_DATA[branchName]) {
      this.state.currentBranch = STORY_DATA[branchName];
      this.state.stepIndex = startIndex;
      this.renderCurrentStep();
    }
  },

  getStepText(step) {
    if (!step) return "";
    if (this.state.gender === "female" && step.textFemale) {
      return step.textFemale;
    }
    if (this.state.gender === "male" && step.textMale) {
      return step.textMale;
    }
    return step.text || "";
  },

  formatText(rawText) {
    if (!rawText) return "";
    return rawText.replace(/\{name\}/g, this.state.playerName);
  },

  renderCurrentStep() {
    const step = this.state.currentBranch[this.state.stepIndex];
    if (!step) return;

    const stepText = this.getStepText(step);

    // กรณีเป็นตัวเชื่อมไปกิ่งอื่นทันที
    if (step.nextBranch && !stepText && !step.ending) {
      this.loadBranch(step.nextBranch, 0);
      return;
    }

    // กรณีเป็นหน้าสรุปฉากจบ (Ending Screen)
    if (step.ending) {
      this.showEndingScreen(step.ending);
      return;
    }

    // เอฟเฟกต์สั่นหน้าจอ
    this.stageContainer.classList.remove("shake-anim");
    if (step.screenShake) {
      void this.stageContainer.offsetWidth;
      this.stageContainer.classList.add("shake-anim");
    }

    // เล่นเสียงประกอบ (SFX)
    if (step.sfx) {
      SoundManager.playSFX(step.sfx);
    }

    // 1. อัปเดตฉากหลัง (Background)
    if (step.bg) {
      this.renderBackground(step.bg);
    }

    // 2. อัปเดตภาพ CG พิเศษ (ถ้ามี)
    if (step.cg) {
      this.renderCG(step.cg);
    } else {
      this.cgLayer.innerHTML = "";
      this.cgLayer.classList.remove("active");
    }

    // 3. อัปเดตสไปรต์ตัวละคร (Character Sprites)
    this.renderSprites(step.sprites || [], step.activeSprite);

    // 4. อัปเดตป้ายชื่อผู้พูดและอวาตาร์
    this.renderSpeaker(step.speaker, step.isThought);

    // 5. พิมพ์ข้อความทีละตัวอักษร
    const formatted = this.formatText(stepText);
    this.startTyping(formatted, () => {
      // เมื่อพิมพ์จบ ถ้ามีตัวเลือก ให้แสดงหน้าต่างตัวเลือก
      if (Array.isArray(step.choices)) {
        this.renderChoices(step.choices);
      }
    });
  },

  renderBackground(bgKey) {
    const bgConf = GAME_CONFIG.assets.backgrounds[bgKey];
    if (!bgConf) return;

    const fallbackSVG = this.getSVGBackground(bgConf.theme, bgConf.label);
    const bgStyle = `url('${bgConf.path}'), url("${fallbackSVG}")`;
    this.bgLayer.style.backgroundImage = bgStyle;
    if (this.ambientBgLayer) {
      this.ambientBgLayer.style.backgroundImage = bgStyle;
    }

    if (GAME_CONFIG.showAssetDebugHint) {
      this.assetHintBadge.textContent = `📁 ฉาก: ${bgConf.path}`;
      this.assetHintBadge.style.display = "inline-block";
    } else {
      this.assetHintBadge.style.display = "none";
    }
  },

  renderCG(cgKey) {
    const cgConf = GAME_CONFIG.assets.cgs[cgKey];
    if (!cgConf) return;

    const fallbackSVG = this.getSVGCG(cgConf.theme, cgConf.label);
    const cgStyle = `url("${cgConf.path}"), url("${fallbackSVG}")`;
    this.cgLayer.innerHTML = "";
    const frame = document.createElement("div");
    frame.className = "cg-frame";
    frame.style.backgroundImage = cgStyle;
    this.cgLayer.appendChild(frame);
    this.cgLayer.classList.add("active");

    if (this.ambientBgLayer) {
      this.ambientBgLayer.style.backgroundImage = cgStyle;
    }

    if (GAME_CONFIG.showAssetDebugHint) {
      this.assetHintBadge.textContent = `📁 ภาพ CG: ${cgConf.path}`;
    }
  },

  renderSprites(spriteKeys, activeKey) {
    this.spriteLayer.innerHTML = "";
    if (!spriteKeys || spriteKeys.length === 0) return;

    spriteKeys.forEach((key) => {
      const spConf = GAME_CONFIG.assets.sprites[key];
      if (!spConf) return;

      const wrapper = document.createElement("div");
      wrapper.className = `sprite-item sprite-${spConf.character} ${
        activeKey === key ? "is-speaking" : "is-dimmed"
      }`;

      const img = document.createElement("img");
      img.src = spConf.path;
      img.alt = spConf.label;
      img.onerror = () => {
        img.onerror = null;
        img.src = this.getSVGSprite(spConf.character, spConf.label);
      };

      wrapper.appendChild(img);
      this.spriteLayer.appendChild(wrapper);
    });
  },

  renderSpeaker(speakerKey, isThought) {
    const isPlayer = speakerKey === "player";
    const displayName = isPlayer ? this.state.playerName : speakerKey;
    const colorConf =
      GAME_CONFIG.speakerColors[speakerKey] || GAME_CONFIG.speakerColors["บรรยาย"];

    this.speakerBadge.textContent = isThought
      ? `${displayName} (คิดในใจ)`
      : displayName;
    this.speakerBadge.style.backgroundColor = colorConf.bg;
    this.speakerBadge.style.borderColor = colorConf.border;
    this.speakerRole.textContent = colorConf.role || "";

    this.dialogueBox.classList.toggle("thought-mode", Boolean(isThought));

    // แสดงอวาตาร์มุมซ้ายเมื่อเป็นบทพูดของผู้เล่น
    if (isPlayer) {
      const avKey =
        this.state.gender === "male" ? "AVATAR_M" : "AVATAR_F";
      const avConf = GAME_CONFIG.assets.avatars[avKey];
      const fallbackAv = this.getSVGAvatar(this.state.gender);
      this.playerAvatarBox.style.display = "flex";
      this.playerAvatarBox.innerHTML = `
        <img src="${avConf.path}" alt="${displayName}" onerror="this.onerror=null;this.src='${fallbackAv}';" />
      `;
    } else {
      this.playerAvatarBox.style.display = "none";
    }
  },

  startTyping(text, onComplete) {
    clearTimeout(this.state.typingTimer);
    this.state.fullCurrentText = text;
    this.state.isTyping = true;
    this.dialogueText.textContent = "";
    this.nextIndicator.classList.remove("visible");
    this.choicesOverlay.classList.remove("visible");
    this.stageContainer.classList.remove("choices-mode");

    let charIdx = 0;
    const speed = GAME_CONFIG.typingSpeed || 28;

    const typeNext = () => {
      if (charIdx < text.length) {
        this.dialogueText.textContent += text.charAt(charIdx);
        charIdx++;
        this.state.typingTimer = setTimeout(typeNext, speed);
      } else {
        this.finishTyping(onComplete);
      }
    };

    typeNext();
  },

  finishTyping(onComplete) {
    clearTimeout(this.state.typingTimer);
    this.state.isTyping = false;
    this.dialogueText.textContent = this.state.fullCurrentText;

    const step = this.state.currentBranch[this.state.stepIndex];
    if (step && Array.isArray(step.choices)) {
      this.nextIndicator.classList.remove("visible");
      this.renderChoices(step.choices);
    } else {
      this.nextIndicator.classList.add("visible");
    }

    if (typeof onComplete === "function") {
      onComplete();
    }
  },

  handleDialogueAdvance() {
    const step = this.state.currentBranch[this.state.stepIndex];
    if (!step) return;

    // หากกำลังพิมพ์อยู่ การคลิกจะแสดงข้อความทั้งหมดทันที
    if (this.state.isTyping) {
      this.finishTyping();
      return;
    }

    // หากมีตัวเลือกค้างอยู่ บังคับให้กดเลือกจากปุ่มตัวเลือก
    if (Array.isArray(step.choices)) {
      return;
    }

    SoundManager.playClick();
    this.state.stepIndex++;
    if (this.state.stepIndex < this.state.currentBranch.length) {
      this.renderCurrentStep();
    }
  },

  renderChoices(choices) {
    this.choicesList.innerHTML = "";
    choices.forEach((ch, idx) => {
      const btn = document.createElement("button");
      btn.className = `choice-btn ${ch.isDanger ? "choice-danger" : "choice-strategic"}`;

      const choiceText =
        this.state.gender === "female" && ch.textFemale
          ? ch.textFemale
          : ch.textMale || ch.text;

      btn.innerHTML = `
        <div class="choice-header">
          <span class="choice-num">ทางเลือกที่ ${idx + 1}</span>
          <span class="choice-tag">${ch.tag}</span>
        </div>
        <div class="choice-body">${this.formatText(choiceText)}</div>
      `;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        SoundManager.playClick();
        this.choicesOverlay.classList.remove("visible");
        this.stageContainer.classList.remove("choices-mode");
        this.loadBranch(ch.nextBranch, 0);
      });

      this.choicesList.appendChild(btn);
    });

    this.choicesOverlay.classList.add("visible");
    this.stageContainer.classList.add("choices-mode");
  },

  showEndingScreen(endingData) {
    this.state.currentEndingCode = endingData.code;
    this.state.seenEndings.add(endingData.code);
    if (endingData.type === "GOOD") {
      SoundManager.playSFX("chime");
    } else {
      SoundManager.playSFX("siren");
    }

    this.endBadge.textContent = endingData.badge;
    this.endBadge.className = `ending-badge ${
      endingData.type === "GOOD" ? "badge-good" : "badge-bad"
    }`;

    if (endingData.randomSlot) {
      this.endRandomSlot.textContent = `🎲 ${endingData.randomSlot}`;
      this.endRandomSlot.style.display = "inline-block";
    } else {
      this.endRandomSlot.style.display = "none";
    }

    this.endTitle.textContent = endingData.title;
    this.endSummary.textContent = this.formatText(endingData.summary);

    // ข้อมูลชื่อผู้เรียนและวันที่ทำกิจกรรม
    if (this.endStudentInfo) {
      const now = new Date();
      const dateStr = now.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
      this.endStudentInfo.textContent = `👤 ผู้เรียน: ${this.state.playerName} (ม.1) • ${dateStr}`;
    }

    // รูปประกอบฉากจบ (ทั้ง img และ background)
    const cgConf = GAME_CONFIG.assets.cgs[endingData.cg];
    if (cgConf) {
      const fallbackSVG = this.getSVGCG(cgConf.theme, cgConf.label);
      this.endCgPreview.style.backgroundImage = `url("${cgConf.path}"), url("${fallbackSVG}")`;
      if (this.endCgImg) {
        this.endCgImg.src = cgConf.path;
        this.endCgImg.onerror = () => {
          this.endCgImg.onerror = null;
          this.endCgImg.src = fallbackSVG;
        };
      }
    }

    // รายการบทเรียนสุขศึกษา
    this.endLessons.innerHTML = "";
    (endingData.lessons || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      this.endLessons.appendChild(li);
    });

    this.endProgressText.textContent = `ปลดล็อกฉากจบแล้ว ${this.state.seenEndings.size} / 4 รูปแบบ (ฉากจบดี 1 แบบ + ฉากจบสุ่มเมื่อลองสูบ 3 แบบ)`;

    // โหลดคำตอบสะท้อนคิดเดิมที่เคยบันทึกไว้ (ถ้ามี)
    if (this.studentReflectionInput) {
      try {
        const saved = localStorage.getItem(`health_game_reflection_${endingData.code}`) || "";
        this.studentReflectionInput.value = saved;
      } catch (e) {
        this.studentReflectionInput.value = "";
      }
    }
    if (this.copyFeedback) {
      this.copyFeedback.classList.remove("visible");
    }

    this.endingModal.classList.add("visible");
  },

  // ==========================================================================
  // ระบบสร้างภาพกราฟิก Anime SVG อัตโนมัติ (ใช้แสดงผลทันทีแม้ยังไม่ได้ใส่ไฟล์รูปจริง)
  // ==========================================================================
  getSVGBackground(theme, label) {
    let svg = "";
    if (theme === "alley") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'>
        <defs>
          <linearGradient id='g1' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stop-color='#1e1b2e'/>
            <stop offset='60%' stop-color='#332940'/>
            <stop offset='100%' stop-color='#181824'/>
          </linearGradient>
        </defs>
        <rect width='1280' height='720' fill='url(#g1)'/>
        <polygon points='0,0 450,140 450,620 0,720' fill='#252336'/>
        <polygon points='1280,0 820,130 820,600 1280,720' fill='#1f1d2b'/>
        <rect x='450' y='130' width='370' height='470' fill='#2d2b42'/>
        <rect x='490' y='210' width='110' height='80' rx='6' fill='#3e3c59' stroke='#525075' stroke-width='4'/>
        <circle cx='545' cy='250' r='28' fill='#1f1d2b'/>
        <path d='M0,620 Q640,590 1280,630 L1280,720 L0,720 Z' fill='#141c18'/>
        <circle cx='680' cy='380' r='180' fill='#ffffff' opacity='0.04'/>
        <circle cx='580' cy='310' r='110' fill='#ffffff' opacity='0.05'/>
      </svg>`;
    } else if (theme === "morning") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'>
        <defs>
          <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stop-color='#0284c7'/>
            <stop offset='65%' stop-color='#7dd3fc'/>
            <stop offset='100%' stop-color='#fef08a'/>
          </linearGradient>
        </defs>
        <rect width='1280' height='720' fill='url(#sky)'/>
        <circle cx='1050' cy='140' r='90' fill='#fef9c3' opacity='0.85'/>
        <rect x='140' y='280' width='1000' height='220' fill='#f8fafc' stroke='#cbd5e1' stroke-width='4'/>
        <rect x='634' y='90' width='12' height='420' fill='#e2e8f0'/>
        <rect x='646' y='100' width='110' height='72' fill='#ef4444'/>
        <rect x='646' y='112' width='110' height='48' fill='#ffffff'/>
        <rect x='646' y='124' width='110' height='24' fill='#1d4ed8'/>
        <rect x='0' y='500' width='1280' height='220' fill='#94a3b8'/>
      </svg>`;
    } else {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'>
        <rect width='1280' height='720' fill='#1e293b'/>
        <rect x='120' y='80' width='1040' height='460' fill='#334155'/>
        <rect x='260' y='440' width='760' height='220' fill='#451a03'/>
        <text x='640' y='200' fill='#94a3b8' font-size='32' text-anchor='middle' font-family='sans-serif'>ห้องฝ่ายปกครอง</text>
      </svg>`;
    }
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg).replace(/'/g, "%27");
  },

  getSVGSprite(charType, label) {
    let svg = "";
    if (charType === "bas") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 560'>
        <defs>
          <radialGradient id='podGlow' cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stop-color='#ec4899' stop-opacity='0.9'/>
            <stop offset='100%' stop-color='#ec4899' stop-opacity='0'/>
          </radialGradient>
        </defs>
        <!-- Body School Shirt -->
        <path d='M85,300 Q210,270 335,300 L365,560 L55,560 Z' fill='#f8fafc' stroke='#334155' stroke-width='5'/>
        <polygon points='170,290 210,365 250,290' fill='#1e293b'/>
        <!-- Head -->
        <circle cx='210' cy='185' r='78' fill='#fde68a' stroke='#334155' stroke-width='5'/>
        <!-- Stylish Messy Black Hair -->
        <path d='M125,180 Q130,85 215,92 Q295,90 295,185 Q275,135 235,145 Q195,125 155,155 Z' fill='#0f172a'/>
        <!-- Smirk Face -->
        <line x1='165' y1='170' x2='195' y2='176' stroke='#0f172a' stroke-width='5' stroke-linecap='round'/>
        <line x1='225' y1='176' x2='255' y2='168' stroke='#0f172a' stroke-width='5' stroke-linecap='round'/>
        <circle cx='182' cy='188' r='6' fill='#0f172a'/>
        <circle cx='238' cy='188' r='6' fill='#0f172a'/>
        <path d='M190,222 Q218,234 240,214' fill='none' stroke='#0f172a' stroke-width='5' stroke-linecap='round'/>
        <!-- Hand offering Vape Pod -->
        <circle cx='295' cy='385' r='65' fill='url(#podGlow)'/>
        <rect x='275' y='330' width='36' height='95' rx='10' fill='#ec4899' stroke='#ffffff' stroke-width='4'/>
        <rect x='283' y='312' width='20' height='22' rx='4' fill='#1e293b'/>
        <circle cx='293' cy='395' r='28' fill='#fde68a' stroke='#334155' stroke-width='4'/>
        <rect x='80' y='510' width='260' height='36' rx='18' fill='#0f172a' opacity='0.85'/>
        <text x='210' y='534' fill='#f8fafc' font-size='18' font-family='sans-serif' font-weight='bold' text-anchor='middle'>บาส (ยื่นบุหรี่ไฟฟ้า)</text>
      </svg>`;
    } else if (charType === "friends") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 520'>
        <!-- Mint (Left) -->
        <path d='M55,300 Q140,280 220,300 L240,520 L40,520 Z' fill='#f1f5f9' stroke='#475569' stroke-width='4'/>
        <circle cx='140' cy='200' r='62' fill='#fef3c7' stroke='#475569' stroke-width='4'/>
        <path d='M75,210 Q80,120 140,125 Q205,120 205,220 Q180,165 140,165 Q100,165 75,210 Z' fill='#7c2d12'/>
        <polygon points='115,285 140,335 165,285' fill='#1e3a8a'/>
        <!-- Arm (Right) -->
        <path d='M275,285 Q365,265 445,285 L465,520 L255,520 Z' fill='#e2e8f0' stroke='#475569' stroke-width='4'/>
        <circle cx='360' cy='185' r='65' fill='#fde68a' stroke='#475569' stroke-width='4'/>
        <path d='M295,175 Q360,105 425,175 Z' fill='#1e293b'/>
        <!-- Vapor Cloud -->
        <circle cx='235' cy='155' r='36' fill='#ffffff' opacity='0.35'/>
        <circle cx='265' cy='125' r='48' fill='#ffffff' opacity='0.25'/>
        <rect x='90' y='470' width='320' height='34' rx='17' fill='#1e293b' opacity='0.85'/>
        <text x='250' y='493' fill='#e2e8f0' font-size='17' font-family='sans-serif' text-anchor='middle'>มินต์ &amp; อาร์ม (เพื่อนในกลุ่ม)</text>
      </svg>`;
    } else {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 560'>
        <path d='M70,300 Q210,270 350,300 L380,560 L40,560 Z' fill='#d6d3d1' stroke='#44403c' stroke-width='5'/>
        <circle cx='210' cy='185' r='78' fill='#fcd34d' stroke='#44403c' stroke-width='5'/>
        <rect x='150' y='165' width='50' height='28' rx='4' fill='none' stroke='#0f172a' stroke-width='6'/>
        <rect x='220' y='165' width='50' height='28' rx='4' fill='none' stroke='#0f172a' stroke-width='6'/>
        <line x1='200' y1='178' x2='220' y2='178' stroke='#0f172a' stroke-width='6'/>
        <line x1='180' y1='232' x2='240' y2='232' stroke='#0f172a' stroke-width='6'/>
        <!-- Microphone -->
        <rect x='285' y='285' width='22' height='75' rx='8' fill='#1e293b'/>
        <circle cx='296' cy='272' r='22' fill='#475569'/>
        <rect x='80' y='510' width='260' height='36' rx='18' fill='#065f46' opacity='0.9'/>
        <text x='210' y='534' fill='#ffffff' font-size='18' font-family='sans-serif' font-weight='bold' text-anchor='middle'>ครูอำนาจ (ฝ่ายปกครอง)</text>
      </svg>`;
    }
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg).replace(/'/g, "%27");
  },

  getSVGAvatar(gender) {
    const bg = gender === "male" ? "#1d4ed8" : "#be185d";
    const hair = gender === "male" ? "#0f172a" : "#451a03";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <rect width='120' height='120' rx='60' fill='${bg}'/>
      <circle cx='60' cy='54' r='30' fill='#fde68a'/>
      <path d='M28,50 Q60,15 92,50 Z' fill='${hair}'/>
      <path d='M25,115 Q60,82 95,115 Z' fill='#f8fafc'/>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg).replace(/'/g, "%27");
  },

  getSVGCG(theme, label) {
    const colors = {
      good: ["#0284c7", "#38bdf8", "รอดพ้นหน้าเสาธง"],
      bad_family: ["#450a0a", "#991b1b", "ห้องปกครองและน้ำตาของแม่"],
      bad_health: ["#14532d", "#dc2626", "ทรุดกลางสนาม หายใจไม่ออก"],
      bad_money: ["#1e1b4b", "#475569", "กระเป๋าตังค์ว่างเปล่าและถูกเมิน"]
    };
    const c = colors[theme] || colors.good;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'>
      <defs>
        <linearGradient id='cgGrad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${c[0]}'/>
          <stop offset='100%' stop-color='${c[1]}'/>
        </linearGradient>
      </defs>
      <rect width='1280' height='720' fill='url(#cgGrad)'/>
      <rect x='90' y='70' width='1100' height='580' rx='24' fill='none' stroke='#ffffff' stroke-opacity='0.25' stroke-width='4'/>
      <text x='640' y='340' fill='#ffffff' font-size='44' font-family='sans-serif' font-weight='bold' text-anchor='middle'>${c[2]}</text>
      <text x='640' y='400' fill='#e2e8f0' font-size='24' font-family='sans-serif' text-anchor='middle'>(${label})</text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg).replace(/'/g, "%27");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  window.VNEngine.init();
});
