const $ = (selector) => document.querySelector(selector);
const form = $("#oracle-form");
const question = $("#question");
const charCount = $("#char-count");
const stage = $("#oracle-stage");
const stageCaption = $("#stage-caption");
const result = $("#result");
const resultQuestion = $("#result-question");
const prediction = $("#prediction");
const soundToggle = $("#sound-toggle");
const soundLabel = soundToggle.querySelector(".sound-toggle__label");
const toast = $("#toast");

const prophecies = [
  "Да. Но только после того, как ты перестанешь обновлять страницу каждые три минуты.",
  "Звёзды говорят: возможно. Тыква говорит: принеси печенье — обсудим.",
  "Твоё будущее прекрасно. Жаль, что будильник прозвенит раньше.",
  "Очень скоро случится нечто неожиданное: ты вспомнишь, зачем вошёл в комнату.",
  "Ответ скрыт во тьме… рядом с носком, который пропал после стирки.",
  "Не сегодня. Сегодня у судьбы технические работы до рассвета.",
  "Да, но цена велика: придётся ответить на сообщение, которое ты игнорируешь третий день.",
  "В полночь ты услышишь странный звук. Не бойся — это холодильник зовёт тебя по имени.",
  "Тени шепчут, что всё получится. Они часто врут, но сейчас звучали убедительно.",
  "Оракул видит успех, славу и… открытые двадцать семь вкладок в браузере.",
  "Нет. Хотя если сделать вид, что так и было задумано, то определённо да.",
  "Судьба уже отправила тебе знак. Ты случайно смахнул уведомление.",
  "Приготовься: скоро кто-то произнесёт: есть минутка? И исчезнут два часа твоей жизни.",
  "Луна благосклонна. Дедлайн — нет. Беги, смертный.",
  "Твой вопрос потревожил древнее зло. Оно просит больше конкретики.",
  "Вероятность успеха — восемьдесят семь процентов. Остальные заняты драматичной музыкой.",
  "Ты стоишь на пороге великого открытия: пароль всё это время был с заглавной буквы.",
  "Будущее туманно, зато в нём точно есть кофе и одно сомнительное решение.",
  "Сбудется на третью пятницу после дождя. Или завтра. У тыквы мелкий шрифт не читается.",
  "Духи единогласно проголосовали: да. Один воздержался — он просто уснул."
];

let soundEnabled = true;
let audioContext;
let typingTimer;
let toastTimer;

function hashText(text) {
  let hash = 17;
  for (const character of text.toLowerCase()) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash;
}

function chooseProphecy(text) {
  return prophecies[hashText(text) % prophecies.length];
}

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  return audioContext;
}

function playAwakeningSound() {
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();
  const now = context.currentTime;
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  master.gain.setValueAtTime(.0001, now);
  master.gain.exponentialRampToValueAtTime(.16, now + .12);
  master.gain.exponentialRampToValueAtTime(.0001, now + 2.7);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(700, now);
  filter.frequency.exponentialRampToValueAtTime(110, now + 2.7);
  filter.connect(master).connect(context.destination);
  [55, 82.4, 110].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 1 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? .7 : .23;
    oscillator.connect(gain).connect(filter);
    oscillator.start(now + index * .04);
    oscillator.stop(now + 2.8);
  });
}

function speakProphecy(text) {
  if (!soundEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ru")) || null;
  utterance.lang = "ru-RU";
  utterance.rate = .78;
  utterance.pitch = .55;
  utterance.volume = .95;
  utterance.onstart = () => stage.classList.add("is-speaking");
  utterance.onend = () => stage.classList.remove("is-speaking");
  utterance.onerror = () => stage.classList.remove("is-speaking");
  window.speechSynthesis.speak(utterance);
}

function typeProphecy(text) {
  window.clearInterval(typingTimer);
  prediction.textContent = "";
  result.classList.remove("is-complete");
  stage.classList.add("is-speaking");
  speakProphecy(text);
  let index = 0;
  typingTimer = window.setInterval(() => {
    prediction.textContent += text[index];
    index += 1;
    if (index >= text.length) {
      window.clearInterval(typingTimer);
      if (!window.speechSynthesis?.speaking) stage.classList.remove("is-speaking");
      result.classList.add("is-complete");
      stageCaption.textContent = "Пророчество завершено";
    }
  }, 34);
}

function revealProphecy(text) {
  const answer = chooseProphecy(text);
  resultQuestion.textContent = `«${text}»`;
  result.hidden = false;
  stage.classList.add("is-awake");
  stageCaption.textContent = "Связь с потусторонним установлена";
  playAwakeningSound();
  window.setTimeout(() => {
    typeProphecy(answer);
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 720);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function createEmbers() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 24; index += 1) {
    const ember = document.createElement("i");
    ember.className = "ember";
    ember.style.setProperty("--x", `${Math.random() * 100}%`);
    ember.style.setProperty("--size", `${1 + Math.random() * 2.2}px`);
    ember.style.setProperty("--duration", `${7 + Math.random() * 10}s`);
    ember.style.setProperty("--delay", `${Math.random() * -15}s`);
    ember.style.setProperty("--drift", `${-50 + Math.random() * 100}px`);
    fragment.appendChild(ember);
  }
  $("#embers").appendChild(fragment);
}

question.addEventListener("input", () => { charCount.textContent = question.value.length; });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = question.value.trim();
  if (!text) return question.focus();
  revealProphecy(text);
});

$("#again-button").addEventListener("click", () => {
  window.clearInterval(typingTimer);
  window.speechSynthesis?.cancel();
  result.hidden = true;
  result.classList.remove("is-complete");
  stage.classList.remove("is-speaking", "is-awake");
  stageCaption.textContent = "Оракул снова дремлет…";
  question.value = "";
  charCount.textContent = "0";
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => question.focus(), 450);
});

$("#share-button").addEventListener("click", async () => {
  const text = `Мой вопрос: ${resultQuestion.textContent}\nПророчество: ${prediction.textContent}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Пророчество скопировано");
  } catch {
    showToast("Тьма не дала доступ к буферу обмена");
  }
});

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Выключить звук" : "Включить звук");
  soundLabel.textContent = soundEnabled ? "Звук включён" : "Без звука";
  if (!soundEnabled) {
    window.speechSynthesis?.cancel();
    stage.classList.remove("is-speaking");
  } else {
    const context = getAudioContext();
    if (context?.state === "suspended") context.resume();
  }
});

window.addEventListener("pointermove", (event) => {
  if (event.pointerType && event.pointerType !== "mouse") return;
  const x = Math.max(-9, Math.min(9, (event.clientX / window.innerWidth - .5) * 18));
  const y = Math.max(-6, Math.min(6, (event.clientY / window.innerHeight - .5) * 12));
  document.querySelectorAll(".pupil").forEach((pupil) => {
    pupil.style.setProperty("--eye-x", `${x}px`);
    pupil.style.setProperty("--eye-y", `${y}px`);
  });
});

createEmbers();
