(() => {
  const CIRCUMFERENCE = 2 * Math.PI * 108;

  const timeDisplay = document.getElementById("time-display");
  const displayWrap = document.querySelector(".display-wrap");
  const ringProgress = document.querySelector(".ring-progress");
  const presetsEl = document.getElementById("presets");
  const btnToggle = document.getElementById("btn-toggle");
  const btnReset = document.getElementById("btn-reset");
  const modeButtons = document.querySelectorAll(".mode-btn");
  const presetButtons = document.querySelectorAll(".preset-btn");

  const state = {
    mode: "stopwatch",
    running: false,
    elapsedMs: 0,
    durationMs: 60_000,
    lastStamp: 0,
    rafId: null,
  };

  ringProgress.style.strokeDasharray = String(CIRCUMFERENCE);

  function pad(n, len = 2) {
    return String(n).padStart(len, "0");
  }

  function formatTime(ms, { showHours = false } = {}) {
    const totalCs = Math.floor(Math.max(0, ms) / 10);
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const sec = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const min = totalMin % 60;
    const hours = Math.floor(totalMin / 60);

    if (showHours || hours > 0) {
      return `${pad(hours)}:${pad(min)}:${pad(sec)}`;
    }
    return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
  }

  function remainingMs() {
    return Math.max(0, state.durationMs - state.elapsedMs);
  }

  function updateRing() {
    if (state.mode === "stopwatch") {
      const cycle = 60_000;
      const progress = (state.elapsedMs % cycle) / cycle;
      ringProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
      return;
    }

    const ratio = state.durationMs > 0 ? remainingMs() / state.durationMs : 0;
    ringProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - ratio));
  }

  function render() {
    const ms = state.mode === "stopwatch" ? state.elapsedMs : remainingMs();
    const showHours = state.mode === "countdown" && state.durationMs >= 3_600_000;
    const text = formatTime(ms, { showHours });

    if (timeDisplay.textContent !== text) {
      timeDisplay.textContent = text;
      timeDisplay.classList.remove("is-tick");
      void timeDisplay.offsetWidth;
      timeDisplay.classList.add("is-tick");
    }

    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    timeDisplay.setAttribute(
      "datetime",
      hours > 0 ? `PT${hours}H${minutes}M${seconds}S` : `PT${minutes}M${seconds}S`
    );

    updateRing();
    displayWrap.classList.toggle("is-running", state.running);
    btnToggle.classList.toggle("is-running", state.running);
    btnToggle.textContent = state.running ? "暫停" : "開始";
    btnToggle.setAttribute("aria-label", state.running ? "暫停" : "開始");
  }

  function tick(now) {
    if (!state.running) return;

    const delta = now - state.lastStamp;
    state.lastStamp = now;
    state.elapsedMs += delta;

    if (state.mode === "countdown" && state.elapsedMs >= state.durationMs) {
      state.elapsedMs = state.durationMs;
      state.running = false;
      state.rafId = null;
      displayWrap.classList.add("is-complete");
      render();
      return;
    }

    render();
    state.rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (state.running) return;
    if (state.mode === "countdown" && remainingMs() <= 0) {
      state.elapsedMs = 0;
      displayWrap.classList.remove("is-complete");
    }
    state.running = true;
    state.lastStamp = performance.now();
    displayWrap.classList.remove("is-complete");
    state.rafId = requestAnimationFrame(tick);
    render();
  }

  function pause() {
    if (!state.running) return;
    state.running = false;
    if (state.rafId != null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    render();
  }

  function toggle() {
    if (state.running) pause();
    else start();
  }

  function reset() {
    pause();
    state.elapsedMs = 0;
    displayWrap.classList.remove("is-complete");
    render();
  }

  function setMode(mode) {
    if (mode === state.mode) return;
    pause();
    state.mode = mode;
    state.elapsedMs = 0;
    displayWrap.classList.remove("is-complete");

    modeButtons.forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    presetsEl.hidden = mode !== "countdown";
    render();
  }

  function setDuration(seconds) {
    pause();
    state.durationMs = seconds * 1000;
    state.elapsedMs = 0;
    displayWrap.classList.remove("is-complete");

    presetButtons.forEach((btn) => {
      btn.classList.toggle("is-selected", Number(btn.dataset.seconds) === seconds);
    });

    render();
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => setDuration(Number(btn.dataset.seconds)));
  });

  btnToggle.addEventListener("click", toggle);
  btnReset.addEventListener("click", reset);

  document.addEventListener("keydown", (event) => {
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;

    if (event.code === "Space") {
      event.preventDefault();
      toggle();
    } else if (event.key === "r" || event.key === "R") {
      reset();
    }
  });

  setDuration(60);
  render();
})();
