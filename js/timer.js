(() => {
  const CIRCUMFERENCE = 2 * Math.PI * 126;

  const displayEl = document.getElementById("timer-display");
  const labelEl = document.getElementById("timer-label");
  const statusEl = document.getElementById("timer-status");
  const timerFace = document.querySelector(".timer-face");
  const ringEl = document.querySelector(".ring");
  const progressEl = document.querySelector(".ring__progress");
  const setupEl = document.getElementById("countdown-setup");
  const minutesInput = document.getElementById("input-minutes");
  const secondsInput = document.getElementById("input-seconds");
  const toggleBtn = document.getElementById("btn-toggle");
  const resetBtn = document.getElementById("btn-reset");
  const lapBtn = document.getElementById("btn-lap");
  const lapsSection = document.getElementById("laps-section");
  const lapsList = document.getElementById("laps-list");
  const modeButtons = document.querySelectorAll(".mode-switch__btn");

  const state = {
    mode: "stopwatch",
    running: false,
    elapsedMs: 0,
    remainingMs: 0,
    durationMs: 0,
    startedAt: 0,
    rafId: null,
    laps: [],
  };

  progressEl.style.strokeDasharray = String(CIRCUMFERENCE);
  progressEl.style.strokeDashoffset = String(CIRCUMFERENCE);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pad(num, size = 2) {
    return String(num).padStart(size, "0");
  }

  function formatTime(ms, withMs = true) {
    const total = Math.max(0, Math.floor(ms));
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const centis = Math.floor((total % 1000) / 10);

    if (withMs) {
      return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
    }

    return `${pad(minutes)}:${pad(seconds)}`;
  }

  function readCountdownDuration() {
    const minutes = clamp(Number.parseInt(minutesInput.value, 10) || 0, 0, 99);
    const seconds = clamp(Number.parseInt(secondsInput.value, 10) || 0, 0, 59);
    minutesInput.value = String(minutes);
    secondsInput.value = String(seconds);
    return (minutes * 60 + seconds) * 1000;
  }

  function setProgress(ratio) {
    const offset = CIRCUMFERENCE * (1 - clamp(ratio, 0, 1));
    progressEl.style.strokeDashoffset = String(offset);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateButtons() {
    const hasProgress =
      state.mode === "stopwatch"
        ? state.elapsedMs > 0 || state.running
        : state.durationMs > 0 && (state.remainingMs < state.durationMs || state.running);

    toggleBtn.textContent = state.running ? "暫停" : state.mode === "countdown" && state.remainingMs === 0 && state.durationMs > 0 ? "再來" : "開始";
    toggleBtn.classList.toggle("is-running", state.running);
    ringEl.classList.toggle("is-running", state.running);
    resetBtn.disabled = !hasProgress && !state.running;
    lapBtn.disabled = !(state.mode === "stopwatch" && state.running);
    lapBtn.hidden = state.mode !== "stopwatch";

    const setupLocked = state.running || (state.mode === "countdown" && state.remainingMs > 0 && state.remainingMs < state.durationMs);
    minutesInput.disabled = setupLocked;
    secondsInput.disabled = setupLocked;
  }

  function render() {
    if (state.mode === "stopwatch") {
      displayEl.textContent = formatTime(state.elapsedMs, true);
      const secondsFraction = (state.elapsedMs % 60000) / 60000;
      setProgress(state.elapsedMs === 0 ? 0 : secondsFraction || 1);
    } else {
      displayEl.textContent = formatTime(state.remainingMs, false);
      const ratio = state.durationMs === 0 ? 0 : state.remainingMs / state.durationMs;
      setProgress(ratio);
    }

    updateButtons();
  }

  function tick() {
    if (!state.running) return;

    const now = performance.now();

    if (state.mode === "stopwatch") {
      state.elapsedMs = now - state.startedAt;
      render();
      state.rafId = requestAnimationFrame(tick);
      return;
    }

    state.remainingMs = Math.max(0, state.durationMs - (now - state.startedAt));
    render();

    if (state.remainingMs <= 0) {
      state.running = false;
      state.remainingMs = 0;
      setStatus("時間到");
      timerFace.classList.add("is-ticking");
      updateButtons();
      return;
    }

    state.rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (state.mode === "countdown") {
      if (state.remainingMs <= 0) {
        state.durationMs = readCountdownDuration();
        state.remainingMs = state.durationMs;
      }

      if (state.durationMs <= 0) {
        setStatus("請設定時間");
        return;
      }

      state.startedAt = performance.now() - (state.durationMs - state.remainingMs);
      setStatus("倒數中");
    } else {
      state.startedAt = performance.now() - state.elapsedMs;
      setStatus("計時中");
    }

    state.running = true;
    timerFace.classList.add("is-ticking");
    updateButtons();
    state.rafId = requestAnimationFrame(tick);
  }

  function pause() {
    state.running = false;
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    setStatus("已暫停");
    updateButtons();
  }

  function reset() {
    pause();
    state.elapsedMs = 0;
    state.laps = [];
    lapsList.innerHTML = "";
    lapsSection.hidden = true;

    if (state.mode === "countdown") {
      state.durationMs = readCountdownDuration();
      state.remainingMs = state.durationMs;
      setStatus(state.durationMs > 0 ? "準備倒數" : "請設定時間");
    } else {
      state.durationMs = 0;
      state.remainingMs = 0;
      setStatus("準備開始");
    }

    render();
  }

  function addLap() {
    if (state.mode !== "stopwatch" || !state.running) return;

    const previous = state.laps[0] ? state.laps[0].total : 0;
    const total = state.elapsedMs;
    const split = total - previous;
    const lap = { total, split, index: state.laps.length + 1 };
    state.laps.unshift(lap);

    const item = document.createElement("li");
    item.className = "laps__item";
    item.innerHTML = `
      <span class="laps__item-index">第 ${lap.index} 段 · +${formatTime(lap.split)}</span>
      <span class="laps__item-time">${formatTime(lap.total)}</span>
    `;
    lapsList.prepend(item);
    lapsSection.hidden = false;
  }

  function switchMode(mode) {
    if (mode === state.mode) return;

    pause();
    state.mode = mode;
    state.elapsedMs = 0;
    state.laps = [];
    lapsList.innerHTML = "";
    lapsSection.hidden = true;

    modeButtons.forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    labelEl.textContent = mode === "stopwatch" ? "碼表" : "倒數";
    setupEl.hidden = mode !== "countdown";

    if (mode === "countdown") {
      state.durationMs = readCountdownDuration();
      state.remainingMs = state.durationMs;
      setStatus(state.durationMs > 0 ? "準備倒數" : "請設定時間");
    } else {
      state.durationMs = 0;
      state.remainingMs = 0;
      setStatus("準備開始");
    }

    render();
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
  });

  toggleBtn.addEventListener("click", () => {
    if (state.running) {
      pause();
    } else {
      start();
    }
  });

  resetBtn.addEventListener("click", reset);
  lapBtn.addEventListener("click", addLap);

  minutesInput.addEventListener("change", () => {
    if (!state.running) {
      state.durationMs = readCountdownDuration();
      state.remainingMs = state.durationMs;
      setStatus(state.durationMs > 0 ? "準備倒數" : "請設定時間");
      render();
    }
  });

  secondsInput.addEventListener("change", () => {
    if (!state.running) {
      state.durationMs = readCountdownDuration();
      state.remainingMs = state.durationMs;
      setStatus(state.durationMs > 0 ? "準備倒數" : "請設定時間");
      render();
    }
  });

  timerFace.addEventListener("animationend", () => {
    timerFace.classList.remove("is-ticking");
  });

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input")) return;

    if (event.code === "Space") {
      event.preventDefault();
      toggleBtn.click();
    } else if (event.key.toLowerCase() === "r") {
      resetBtn.click();
    } else if (event.key.toLowerCase() === "l") {
      lapBtn.click();
    }
  });

  render();
})();
