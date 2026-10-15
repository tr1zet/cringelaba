const $ = (selector) => document.querySelector(selector);

const welcome = $("#welcome");
const memeScreen = $("#meme-screen");
const form = $("#meme-form");
const questionInput = $("#question");
const answerInput = $("#answer");
const questionCaption = $("#question-caption");
const answerCaption = $("#answer-caption");
const editQuestion = $("#edit-question");
const editAnswer = $("#edit-answer");
const editor = $("#editor");
const topbar = $(".topbar");
const bottomActions = $(".bottom-actions");
const fullscreenEdges = document.querySelectorAll(".fullscreen-edge");
const fontSize = $("#font-size");
const fontSizeValue = $("#font-size-value");
const fontFamily = $("#font-family");
const customColor = $("#custom-color");
const toast = $("#toast");
const doneButton = $("#done-button");
const downloadButton = $("#download-button");

let downloadUnlockTimer;

const plainText = (element) => element.innerText.replace(/\n{3,}/g, "\n\n").trim();

function syncCaptionsFromEditor() {
  questionCaption.innerText = editQuestion.value;
  answerCaption.innerText = editAnswer.value;
}

function syncEditorFromCaptions() {
  editQuestion.value = plainText(questionCaption);
  editAnswer.value = plainText(answerCaption);
}

function showMeme(question, answer) {
  questionCaption.innerText = question;
  answerCaption.innerText = answer;
  syncEditorFromCaptions();
  welcome.hidden = true;
  memeScreen.hidden = false;
  document.title = `${question} — Миньон говорит`;
}

function openEditor() {
  syncEditorFromCaptions();
  editor.classList.add("open");
  editor.setAttribute("aria-hidden", "false");
  window.setTimeout(() => editQuestion.focus(), 200);
}

function closeEditor() {
  const wasOpen = editor.classList.contains("open");
  syncCaptionsFromEditor();
  editor.classList.remove("open");
  editor.setAttribute("aria-hidden", "true");

  // На телефонах тап по «Готово» иногда продолжается уже по кнопке скачивания,
  // которая оказывается под закрывшейся панелью. Короткая блокировка гасит этот ghost click.
  if (wasOpen) {
    downloadButton.disabled = true;
    window.clearTimeout(downloadUnlockTimer);
    downloadUnlockTimer = window.setTimeout(() => {
      downloadButton.disabled = false;
    }, 600);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showMeme(questionInput.value.trim(), answerInput.value.trim());
});

$("#edit-button").addEventListener("click", openEditor);
$("#close-editor").addEventListener("click", closeEditor);
$("#editor-backdrop").addEventListener("click", closeEditor);
doneButton.addEventListener("pointerdown", (event) => event.stopPropagation());
doneButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeEditor();
});
editQuestion.addEventListener("input", syncCaptionsFromEditor);
editAnswer.addEventListener("input", syncCaptionsFromEditor);
questionCaption.addEventListener("input", syncEditorFromCaptions);
answerCaption.addEventListener("input", syncEditorFromCaptions);

function applyCaptionSize() {
  const compactScreen = window.matchMedia("(max-width: 680px), (max-height: 500px) and (max-width: 900px)").matches;
  const mobileScale = compactScreen ? 0.66 : 1;
  document.documentElement.style.setProperty("--caption-size", `${Math.round(Number(fontSize.value) * mobileScale)}px`);
  fontSizeValue.value = fontSize.value;
}

fontSize.addEventListener("input", applyCaptionSize);
window.addEventListener("resize", applyCaptionSize);
applyCaptionSize();

function applyFontFamily() {
  const selectedFont = fontFamily.value;
  document.documentElement.style.setProperty("--caption-font", selectedFont);
  questionCaption.style.fontFamily = selectedFont;
  answerCaption.style.fontFamily = selectedFont;
  fontFamily.style.fontFamily = selectedFont;
}

// iOS/Android могут отправлять input раньше change у нативного select.
fontFamily.addEventListener("input", applyFontFamily);
fontFamily.addEventListener("change", applyFontFamily);
applyFontFamily();

document.querySelectorAll('input[name="text-color"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.documentElement.style.setProperty("--text-color", radio.value);
  });
});

customColor.addEventListener("input", () => {
  document.querySelectorAll('input[name="text-color"]').forEach((radio) => { radio.checked = false; });
  document.documentElement.style.setProperty("--text-color", customColor.value);
});

$("#restart-button").addEventListener("click", () => {
  closeEditor();
  memeScreen.hidden = true;
  welcome.hidden = false;
  document.title = "Миньон говорит — редактор мема";
  questionInput.focus();
});

$("#fullscreen-button").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      memeScreen.classList.remove("controls-visible");
      const requestFullscreen = memeScreen.requestFullscreen || memeScreen.webkitRequestFullscreen;
      if (!requestFullscreen) throw new Error("Fullscreen API is unavailable");
      await requestFullscreen.call(memeScreen);
    } else {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
      if (exitFullscreen) await exitFullscreen.call(document);
    }
  } catch {
    showToast("Полноэкранный режим недоступен");
  }
});

let fullscreenControlsArmed = false;

function isMemeFullscreen() {
  return document.fullscreenElement === memeScreen || document.webkitFullscreenElement === memeScreen;
}

function handleFullscreenChange() {
  memeScreen.classList.remove("controls-visible");
  fullscreenControlsArmed = false;

  if (isMemeFullscreen() && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

memeScreen.addEventListener("pointermove", (event) => {
  if (!isMemeFullscreen()) return;

  const activationEdge = 12;
  const atEdge = event.clientY <= activationEdge || event.clientY >= window.innerHeight - activationEdge;
  const overPanel = event.clientY <= topbar.offsetHeight || event.clientY >= window.innerHeight - bottomActions.offsetHeight;

  // После входа курсор остаётся на кнопке полноэкранного режима. Сначала
  // ждём, пока он уйдёт в центральную область, чтобы панели точно скрылись.
  if (!fullscreenControlsArmed) {
    if (!overPanel) fullscreenControlsArmed = true;
    return;
  }

  if (memeScreen.classList.contains("controls-visible")) {
    if (!overPanel) memeScreen.classList.remove("controls-visible");
  } else if (atEdge) {
    memeScreen.classList.add("controls-visible");
  }
});

memeScreen.addEventListener("pointerdown", (event) => {
  if (!isMemeFullscreen() || event.pointerType === "mouse") return;

  const controlsVisible = memeScreen.classList.contains("controls-visible");
  const overPanel = event.clientY <= topbar.offsetHeight || event.clientY >= window.innerHeight - bottomActions.offsetHeight;
  const editingCaption = event.target.closest?.(".caption");

  // На сенсорном экране hover отсутствует: первое касание в любом месте
  // показывает обе панели, касание по мему повторно их скрывает.
  if (!controlsVisible) {
    memeScreen.classList.add("controls-visible");
  } else if (!overPanel && !editingCaption) {
    memeScreen.classList.remove("controls-visible");
  }
});

fullscreenEdges.forEach((edge) => {
  edge.addEventListener("click", () => memeScreen.classList.add("controls-visible"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editor.classList.contains("open")) closeEditor();
});

function wrapLines(context, text, maxWidth) {
  const paragraphs = text.split(/\n/);
  const lines = [];
  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return lines.push("");
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

function drawCaption(context, text, y, fromBottom, canvas) {
  const size = Number(fontSize.value) * (canvas.width / $("#meme-frame").clientWidth);
  const lineHeight = size * 1.05;
  const selectedFont = getComputedStyle(questionCaption).fontFamily;
  context.font = `900 ${size}px ${selectedFont}`;
  context.textAlign = "center";
  context.textBaseline = "top";
  context.lineJoin = "round";
  context.lineWidth = Math.max(5, size * .12);
  context.strokeStyle = "#000000";
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-color").trim();
  const lines = wrapLines(context, text.toUpperCase(), canvas.width * .88);
  const totalHeight = lines.length * lineHeight;
  let currentY = fromBottom ? y - totalHeight : y;
  lines.forEach((line) => {
    context.strokeText(line, canvas.width / 2, currentY);
    context.fillText(line, canvas.width / 2, currentY);
    currentY += lineHeight;
  });
}

downloadButton.addEventListener("click", () => {
  const image = $("#meme-image");
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawCaption(context, plainText(questionCaption), canvas.height * .05, false, canvas);
  drawCaption(context, plainText(answerCaption), canvas.height * .96, true, canvas);
  const link = document.createElement("a");
  link.download = "minion-meme.jpg";
  link.href = canvas.toDataURL("image/jpeg", .94);
  link.click();
  showToast("Мем сохранён в JPG");
});
