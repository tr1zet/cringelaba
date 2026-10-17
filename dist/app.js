const $ = (selector) => document.querySelector(selector);

const questionScreen = $("#question-screen");
const oracleScreen = $("#oracle-screen");
const form = $("#oracle-form");
const questionInput = $("#question");
const charCount = $("#char-count");
const summoning = $("#summoning");
const lightning = $("#lightning");
const askedQuestion = $("#asked-question");
const predictionBox = $("#prediction");
const speakingState = $("#speaking-state");
const soundToggle = $("#sound-toggle");
const soundText = soundToggle.querySelector(".sound__text");
const toast = $("#toast");
const introGate = $("#intro-gate");
const enterDarkness = $("#enter-darkness");
const menuMusic = $("#menu-music");
const siteHeader = $("#site-header");
const siteMain = $("#site-main");

const visions = [
  "Вижу дверь, которую ты долго боялся открыть.",
  "Три тени спорят о твоём будущем, и две из них ставят на тебя.",
  "До следующей полной луны судьба подбросит тебе странный знак.",
  "Очень скоро случайная встреча изменит твой привычный маршрут.",
  "То, что ты считаешь концом, окажется весьма подозрительным началом.",
  "В твоём будущем горит зелёный свет, но рядом почему-то стоит призрак с секундомером.",
  "Человек, от которого ты не ждёшь новостей, уже набирает сообщение.",
  "Твой самый нелепый план внезапно окажется единственным рабочим.",
  "Ночью тебе приснится ответ, но утром останется только ощущение, что он был гениальным.",
  "Старая ошибка скоро вернётся, переодетая в новую возможность.",
  "Вижу перед тобой развилку: одна дорога опасная, вторая закрыта на обед.",
  "Судьба положила в твой карман счастливый случай — проверь после стирки.",
  "Скоро ты услышишь фразу, после которой всё станет одновременно проще и страннее.",
  "За твоей спиной собирается удача. Не оборачивайся слишком резко.",
  "Следующие семь дней будут спокойными. Это и есть самое подозрительное.",
  "В полночь одно давнее желание наконец вспомнит дорогу к тебе.",
  "Кто-то тайно верит в тебя сильнее, чем ты сам.",
  "Твой вопрос разбудил древнюю силу. К счастью, сегодня она в хорошем настроении."
];

const twists = [
  "Ответ — да, но не тем способом, который ты сейчас представляешь.",
  "Ответ — нет, и позже ты будешь благодарен этому маленькому проклятию.",
  "Всё получится, если первым делом перестать делать вид, что времени ещё много.",
  "Решение уже рядом; оно маскируется под слишком простую идею.",
  "Тебе помогут, но сначала придётся вслух признать, что помощь действительно нужна.",
  "Не спеши: самое важное произойдёт на один шаг позже, чем ты рассчитываешь.",
  "Даже оракул удивлён, но вероятность успеха неприлично высока.",
  "Твоё сомнение громкое, а удача ходит тихо — поэтому ты пока её не слышишь.",
  "Сделай наоборот, а затем уверенно скажи, что таков был план.",
  "Верный момент наступит сразу после того, как ты перестанешь его караулить.",
  "Ответ появится в сообщении, которое ты сначала захочешь проигнорировать.",
  "Тебе придётся выбрать между разумным решением и историей, которую будет весело рассказывать.",
  "Знаки благоприятны, но дедлайн смотрит на тебя очень недобро.",
  "Ключом окажется человек с самым нелепым советом.",
  "События сложатся удачно, если не вмешается твоя привычка всё усложнять.",
  "Луна говорит: рискни. Здравый смысл просит хотя бы сохранить резервную копию.",
  "Твоё первое решение будет неправильным, зато второе — почти легендарным.",
  "Ответ изменится, когда ты задашь себе более честный вопрос."
];

const warnings = [
  "И не доверяй человеку, который скажет: это займёт пять минут.",
  "Берегись вторника и файлов с названием финал_точно_последний.",
  "Но никогда не заключай сделки с котом, который умеет открывать двери.",
  "Главное — не оглядывайся, когда холодильник снова назовёт тебя по имени.",
  "Только не рассказывай об этом зеркалу: оно любит портить сюрпризы.",
  "Цена ответа — одна бессонная ночь и две чашки чего-нибудь горячего.",
  "После этого выброси печенье с предсказанием: оно работает на конкурентов.",
  "Помни: если погаснет свет, это не обязательно мистика. Но беги на всякий случай.",
  "До рассвета никому не показывай эту страницу — особенно тыквам.",
  "И если услышишь три стука из шкафа, просто сделай музыку громче.",
  "Не соглашайся на лёгкий путь: там слишком давно никто не возвращался.",
  "Поторопись — судьба терпелива, а вот будильник совершенно безжалостен.",
  "Оракул мог бы уточнить детали, но духи требуют доплату конфетами.",
  "Будь осторожен с обещаниями, данными после полуночи и до первой кружки кофе.",
  "Если всё пойдёт слишком хорошо, проверь, не спишь ли ты на занятии.",
  "И да: пароль действительно был с заглавной буквы."
];

let currentQuestion = "";
let currentPrediction = "";
let soundEnabled = true;
let audioContext;
let ambienceGain;
let ambienceNodes = [];
let ghostTimer;
let typingTimer;
let toastTimer;
let musicFadeFrame;
let ritualEntered = false;
let demonicVoiceNodes = [];
let demonicVoiceTimer;

function hashText(text) {
  let hash = 2166136261;
  for (const character of text.toLowerCase()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededIndex(seed, length, shift) {
  const mixed = Math.imul(seed ^ shift, 2654435761) >>> 0;
  return mixed % length;
}

function buildProphecy(text) {
  const seed = hashText(text);
  return `${visions[seededIndex(seed, visions.length, 11)]} ${twists[seededIndex(seed, twists.length, 37)]} ${warnings[seededIndex(seed, warnings.length, 83)]}`;
}

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  return audioContext;
}

function fadeMenuMusic(target, duration = 900, pauseAfter = false) {
  window.cancelAnimationFrame(musicFadeFrame);
  if (!menuMusic) return;
  const from = menuMusic.volume;
  const started = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    menuMusic.volume = Math.max(0, Math.min(1, from + ((target - from) * eased)));
    if (progress < 1) musicFadeFrame = window.requestAnimationFrame(step);
    else if (pauseAfter) menuMusic.pause();
  };
  musicFadeFrame = window.requestAnimationFrame(step);
}

async function startMenuMusic(restart = false) {
  if (!ritualEntered || !soundEnabled || !menuMusic) return;
  if (restart) menuMusic.currentTime = 0;
  menuMusic.volume = 0;
  try {
    await menuMusic.play();
    fadeMenuMusic(.34, 1400);
  } catch {
    showToast("Коснись значка звука, чтобы разбудить музыку");
  }
}

function stopMenuMusic() {
  fadeMenuMusic(0, 650, true);
}

function startAmbience() {
  if (!soundEnabled || ambienceGain) return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();
  ambienceGain = context.createGain();
  const filter = context.createBiquadFilter();
  ambienceGain.gain.value = .035;
  filter.type = "lowpass";
  filter.frequency.value = 180;
  filter.Q.value = 5;
  filter.connect(ambienceGain).connect(context.destination);
  [38, 41.3, 57].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 2 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? .8 : .35;
    oscillator.connect(gain).connect(filter);
    oscillator.start();
    ambienceNodes.push(oscillator, gain);
  });
  scheduleGhost();
}

function stopAmbience() {
  window.clearTimeout(ghostTimer);
  ambienceNodes.forEach((node) => { try { if (node.stop) node.stop(); } catch {} });
  ambienceNodes = [];
  ambienceGain?.disconnect();
  ambienceGain = null;
}

function playGhostWail(intensity = 1) {
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const carrier = context.createOscillator();
  const overtone = context.createOscillator();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  carrier.type = "sine"; overtone.type = "triangle"; lfo.type = "sine";
  carrier.frequency.setValueAtTime(155, now); carrier.frequency.exponentialRampToValueAtTime(72, now + 3.4);
  overtone.frequency.setValueAtTime(310, now); overtone.frequency.exponentialRampToValueAtTime(137, now + 3.4);
  lfo.frequency.value = 5.3; lfoGain.gain.value = 18;
  lfo.connect(lfoGain).connect(carrier.frequency);
  filter.type = "bandpass"; filter.frequency.value = 420; filter.Q.value = 2.5;
  gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.045 * intensity, now + .65); gain.gain.exponentialRampToValueAtTime(.0001, now + 3.5);
  carrier.connect(filter); overtone.connect(filter); filter.connect(gain).connect(context.destination);
  [carrier, overtone, lfo].forEach((node) => { node.start(now); node.stop(now + 3.6); });
}

function scheduleGhost() {
  window.clearTimeout(ghostTimer);
  ghostTimer = window.setTimeout(() => {
    playGhostWail(.75);
    scheduleGhost();
  }, 7000 + Math.random() * 6500);
}

function playSummoningSound() {
  startAmbience();
  playGhostWail(1.5);
  const context = getAudioContext();
  if (!soundEnabled || !context) return;
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.18, now + .05); gain.gain.exponentialRampToValueAtTime(.0001, now + 1.1);
  const oscillator = context.createOscillator();
  oscillator.type = "sawtooth"; oscillator.frequency.setValueAtTime(95, now); oscillator.frequency.exponentialRampToValueAtTime(28, now + 1.1);
  oscillator.connect(gain).connect(context.destination); oscillator.start(now); oscillator.stop(now + 1.2);
}

function makeDistortionCurve(amount = 70) {
  const curve = new Float32Array(256);
  for (let index = 0; index < curve.length; index += 1) {
    const x = (index * 2 / curve.length) - 1;
    curve[index] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function stopDemonicVoice() {
  window.clearInterval(demonicVoiceTimer);
  demonicVoiceNodes.forEach((node) => {
    try { if (node.stop) node.stop(); }
    catch {}
    try { node.disconnect(); }
    catch {}
  });
  demonicVoiceNodes = [];
}

function startDemonicVoice() {
  stopDemonicVoice();
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  const distortion = context.createWaveShaper();
  const tremolo = context.createOscillator();
  const tremoloDepth = context.createGain();
  master.gain.setValueAtTime(.0001, now);
  master.gain.exponentialRampToValueAtTime(.075, now + .32);
  filter.type = "lowpass";
  filter.frequency.value = 135;
  filter.Q.value = 8;
  distortion.curve = makeDistortionCurve(95);
  distortion.oversample = "4x";
  tremolo.frequency.value = 3.2;
  tremoloDepth.gain.value = .022;
  tremolo.connect(tremoloDepth).connect(master.gain);
  [34, 42.5, 51].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 1 ? "sawtooth" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 1 ? .22 : .5;
    oscillator.connect(gain).connect(filter);
    oscillator.start();
    demonicVoiceNodes.push(oscillator, gain);
  });
  filter.connect(distortion).connect(master).connect(context.destination);
  tremolo.start();
  demonicVoiceNodes.push(master, filter, distortion, tremolo, tremoloDepth);
  demonicVoiceTimer = window.setInterval(() => {
    playGhostWail(.28);
    playDemonicCrackle();
  }, 1900);
}

function playDemonicCrackle() {
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const length = Math.floor(context.sampleRate * .34);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    const envelope = 1 - (index / length);
    data[index] = (Math.random() * 2 - 1) * envelope * (Math.random() > .82 ? 1 : .16);
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = "bandpass";
  filter.frequency.value = 230 + Math.random() * 190;
  filter.Q.value = 7;
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.055, now + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .34);
  source.buffer = buffer;
  source.playbackRate.value = .45;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(now);
}

function selectVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const russian = voices.filter((voice) => voice.lang.toLowerCase().startsWith("ru"));
  const maleNames = /pavel|pavel|paul|maxim|maksim|yuri|yuriy|dmit|alexander|aleksandr|mikhail|nikolai|ivan|vladimir|anton|artem|sergey|male|муж/i;
  return russian.find((voice) => maleNames.test(voice.name))
    || voices.find((voice) => maleNames.test(voice.name))
    || null;
}

function speak(text = currentPrediction) {
  if (!text || !soundEnabled) return;
  window.speechSynthesis?.cancel();
  window.setTimeout(() => {
    if (!soundEnabled || oracleScreen.hidden) return;
    startDemonicVoice();
    oracleScreen.classList.add("is-speaking");
  }, 60);
  if (!("speechSynthesis" in window)) {
    window.setTimeout(() => { stopDemonicVoice(); oracleScreen.classList.remove("is-speaking"); }, Math.max(3600, text.length * 70));
    return;
  }
  const maleVoice = selectVoice();
  if (!maleVoice) {
    window.setTimeout(() => { stopDemonicVoice(); oracleScreen.classList.remove("is-speaking"); }, Math.max(3600, text.length * 70));
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = maleVoice;
  utterance.lang = maleVoice.lang || "ru-RU";
  utterance.rate = .5;
  utterance.pitch = 0;
  utterance.volume = 1;
  utterance.onstart = () => oracleScreen.classList.add("is-speaking");
  utterance.onend = () => { stopDemonicVoice(); oracleScreen.classList.remove("is-speaking"); };
  utterance.onerror = () => { stopDemonicVoice(); oracleScreen.classList.remove("is-speaking"); };
  window.speechSynthesis.speak(utterance);
  window.setTimeout(() => playGhostWail(.45), 900);
}

function typePrediction(text) {
  window.clearInterval(typingTimer);
  predictionBox.textContent = "";
  oracleScreen.classList.remove("is-complete");
  speakingState.innerHTML = "<span></span> Слушай внимательно…";
  speak(text);
  let index = 0;
  typingTimer = window.setInterval(() => {
    predictionBox.textContent += text[index];
    index += 1;
    if (index >= text.length) {
      window.clearInterval(typingTimer);
      oracleScreen.classList.add("is-complete");
      speakingState.innerHTML = "<span></span> Пророчество завершено";
      if (!window.speechSynthesis?.speaking) oracleScreen.classList.remove("is-speaking");
    }
  }, 28);
}

function openOracle() {
  askedQuestion.textContent = `«${currentQuestion}»`;
  currentPrediction = buildProphecy(currentQuestion);
  questionScreen.hidden = true;
  questionScreen.classList.remove("is-active");
  oracleScreen.hidden = false;
  oracleScreen.classList.add("is-active");
  summoning.classList.remove("is-visible");
  summoning.setAttribute("aria-hidden", "true");
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  window.setTimeout(() => typePrediction(currentPrediction), 480);
}

function summonOracle(text) {
  currentQuestion = text;
  stopMenuMusic();
  summoning.classList.add("is-visible");
  summoning.setAttribute("aria-hidden", "false");
  playSummoningSound();
  window.setTimeout(() => lightning.classList.add("flash"), 850);
  window.setTimeout(() => {
    lightning.classList.remove("flash");
    openOracle();
  }, 1550);
}

function returnToQuestion() {
  window.clearInterval(typingTimer);
  window.speechSynthesis?.cancel();
  oracleScreen.hidden = true;
  oracleScreen.classList.remove("is-active", "is-speaking", "is-complete");
  questionScreen.hidden = false;
  questionScreen.classList.add("is-active");
  stopAmbience();
  stopDemonicVoice();
  startMenuMusic(true);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  window.setTimeout(() => questionInput.focus(), 250);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function createEmbers() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 30; index += 1) {
    const dot = document.createElement("i");
    dot.className = "ember-dot";
    dot.style.setProperty("--x", `${Math.random() * 100}%`);
    dot.style.setProperty("--s", `${1 + Math.random() * 2.4}px`);
    dot.style.setProperty("--d", `${8 + Math.random() * 11}s`);
    dot.style.setProperty("--delay", `${-Math.random() * 18}s`);
    dot.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
    fragment.appendChild(dot);
  }
  $("#embers").appendChild(fragment);
}

questionInput.addEventListener("input", () => { charCount.textContent = questionInput.value.length; });
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = questionInput.value.trim();
  if (!text) return questionInput.focus();
  summonOracle(text);
});
$("#ask-again").addEventListener("click", returnToQuestion);
$("#brand-home").addEventListener("click", returnToQuestion);
$("#repeat-prophecy").addEventListener("click", () => {
  if (!soundEnabled) return showToast("Сначала включи звук");
  speak();
});
$("#copy-prophecy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(`Вопрос: ${currentQuestion}\nПророчество: ${currentPrediction}`);
    showToast("Пророчество скопировано");
  } catch { showToast("Духи закрыли доступ к буферу"); }
});

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Выключить звук" : "Включить звук");
  soundText.textContent = soundEnabled ? "Звук включён" : "Без звука";
  if (!soundEnabled) {
    window.cancelAnimationFrame(musicFadeFrame); window.speechSynthesis?.cancel(); stopAmbience(); stopDemonicVoice(); menuMusic?.pause(); oracleScreen.classList.remove("is-speaking");
  } else if (!oracleScreen.hidden) {
    startAmbience(); speak();
  } else if (ritualEntered) {
    startMenuMusic();
  }
});

enterDarkness.addEventListener("click", async () => {
  ritualEntered = true;
  document.body.classList.remove("intro-open");
  siteHeader.inert = false;
  siteMain.inert = false;
  siteHeader.removeAttribute("aria-hidden");
  siteMain.removeAttribute("aria-hidden");
  introGate.classList.add("is-leaving");
  introGate.setAttribute("aria-hidden", "true");
  startAmbience();
  await startMenuMusic(true);
  window.setTimeout(() => {
    introGate.hidden = true;
    introGate.removeAttribute("role");
    introGate.removeAttribute("aria-modal");
    questionInput.focus();
  }, 1050);
});

createEmbers();
