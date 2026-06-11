const STORAGE_KEY = 'studyTimeApp.v1';

const DEFAULT_STATE = {
  version: 1,
  sessions: [],
  activeTimer: null,
};

let state = loadState();
let tickInterval = null;
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedDateKey = toDateKey(new Date());

const els = {
  timerDisplay: document.getElementById('timerDisplay'),
  timerStatus: document.getElementById('timerStatus'),
  startBtn: document.getElementById('startBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  resumeBtn: document.getElementById('resumeBtn'),
  stopBtn: document.getElementById('stopBtn'),
  subjectInput: document.getElementById('subjectInput'),
  topicInput: document.getElementById('topicInput'),
  notesInput: document.getElementById('notesInput'),
  manualForm: document.getElementById('manualForm'),
  manualDateInput: document.getElementById('manualDateInput'),
  manualMinutesInput: document.getElementById('manualMinutesInput'),
  prevMonthBtn: document.getElementById('prevMonthBtn'),
  nextMonthBtn: document.getElementById('nextMonthBtn'),
  calendarMonthLabel: document.getElementById('calendarMonthLabel'),
  calendarGrid: document.getElementById('calendarGrid'),
  dayDetailDate: document.getElementById('dayDetailDate'),
  dayDetailTotal: document.getElementById('dayDetailTotal'),
  sessionList: document.getElementById('sessionList'),
  emptyDayMessage: document.getElementById('emptyDayMessage'),
};

function getStudyFields() {
  return {
    subject: els.subjectInput.value.trim(),
    topic: els.topicInput.value.trim(),
    notes: els.notesInput.value.trim(),
  };
}

function setStudyFields(fields) {
  els.subjectInput.value = fields.subject ?? '';
  els.topicInput.value = fields.topic ?? '';
  els.notesInput.value = fields.notes ?? '';
}

function persist() {
  saveState(state);
}

function updateTimerDisplay() {
  const ms = state.activeTimer ? getElapsedMs(state.activeTimer) : 0;
  els.timerDisplay.textContent = formatDuration(ms);
}

function updateTimerControls() {
  const active = state.activeTimer;
  const running = isRunning(active);
  const paused = active && active.pausedAt;

  els.startBtn.disabled = Boolean(active);
  els.pauseBtn.disabled = !running;
  els.resumeBtn.disabled = !paused;
  els.stopBtn.disabled = !active;

  const fieldsDisabled = Boolean(active);
  els.subjectInput.disabled = fieldsDisabled;
  els.topicInput.disabled = fieldsDisabled;
  els.notesInput.disabled = fieldsDisabled;

  if (!active) {
    els.timerStatus.textContent = '停止中';
  } else if (running) {
    els.timerStatus.textContent = '計測中';
  } else {
    els.timerStatus.textContent = '一時停止中';
  }
}

function startTicking() {
  stopTicking();
  tickInterval = setInterval(() => {
    updateTimerDisplay();
  }, 1000);
}

function stopTicking() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function refreshTimerUI() {
  updateTimerDisplay();
  updateTimerControls();
  if (state.activeTimer && isRunning(state.activeTimer)) {
    startTicking();
  } else {
    stopTicking();
  }
}

function renderDayDetail() {
  const sessions = getSessionsForDate(state, selectedDateKey);
  const totalMs = getTotalMsForDate(state, selectedDateKey);

  els.dayDetailDate.textContent = formatDayLabel(selectedDateKey);
  els.dayDetailTotal.textContent = `合計: ${formatDurationShort(totalMs)}`;

  els.sessionList.innerHTML = '';
  if (sessions.length === 0) {
    els.emptyDayMessage.hidden = false;
    return;
  }

  els.emptyDayMessage.hidden = true;
  for (const session of sessions) {
    const li = document.createElement('li');
    li.className = 'session-item';

    const title =
      [session.subject, session.topic].filter(Boolean).join(' — ') || '（内容未入力）';

    const top = document.createElement('div');
    top.className = 'session-item__top';
    top.innerHTML = `<span>${escapeHtml(title)}</span><span>${formatDurationShort(session.durationMs)}</span>`;

    const meta = document.createElement('div');
    meta.className = 'session-item__meta';
    const sourceLabel = session.source === 'manual' ? '手動' : 'タイマー';
    const parts = [`<span class="session-item__badge">${sourceLabel}</span>`];
    if (session.notes) {
      parts.push(escapeHtml(session.notes));
    }
    meta.innerHTML = parts.join(' · ');

    li.appendChild(top);
    li.appendChild(meta);
    els.sessionList.appendChild(li);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderCalendar() {
  els.calendarMonthLabel.textContent = formatMonthLabel(calendarYear, calendarMonth);
  els.calendarGrid.innerHTML = '';

  const studyDates = getDatesWithSessions(state);
  const todayKey = toDateKey(new Date());
  const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(calendarYear, calendarMonth, 1 - startOffset);

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    const dateKey = toDateKey(cellDate);
    const inMonth = isSameMonth(cellDate, calendarYear, calendarMonth);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.textContent = String(cellDate.getDate());
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute(
      'aria-label',
      `${cellDate.getFullYear()}年${cellDate.getMonth() + 1}月${cellDate.getDate()}日`
    );

    if (!inMonth) btn.classList.add('calendar-day--muted');
    if (studyDates.has(dateKey)) btn.classList.add('calendar-day--has-study');
    if (dateKey === todayKey) btn.classList.add('calendar-day--today');
    if (dateKey === selectedDateKey) btn.classList.add('calendar-day--selected');

    btn.addEventListener('click', () => {
      selectedDateKey = dateKey;
      renderCalendar();
      renderDayDetail();
    });

    els.calendarGrid.appendChild(btn);
  }
}

function renderAll() {
  refreshTimerUI();
  renderCalendar();
  renderDayDetail();
}

function handleStart() {
  if (state.activeTimer) return;
  const fields = getStudyFields();
  state = setActiveTimer(state, startTimer(fields));
  persist();
  renderAll();
}

function handlePause() {
  if (!state.activeTimer || !isRunning(state.activeTimer)) return;
  state = setActiveTimer(state, pauseTimer(state.activeTimer));
  persist();
  renderAll();
}

function handleResume() {
  if (!state.activeTimer || !state.activeTimer.pausedAt) return;
  state = setActiveTimer(state, resumeTimer(state.activeTimer));
  persist();
  renderAll();
}

function handleStop() {
  if (!state.activeTimer) return;
  const session = buildSessionFromTimer(state.activeTimer);
  if (session.durationMs < 1000) {
    const ok = window.confirm('1秒未満の記録です。破棄しますか？');
    if (!ok) return;
    state = setActiveTimer(state, null);
    persist();
    renderAll();
    return;
  }
  state = addSession(setActiveTimer(state, null), session);
  persist();
  selectedDateKey = session.date;
  renderAll();
}

function handleManualSubmit(event) {
  event.preventDefault();
  const dateKey = els.manualDateInput.value;
  const minutes = Number(els.manualMinutesInput.value);
  if (!dateKey || !Number.isFinite(minutes) || minutes <= 0) return;

  const fields = getStudyFields();
  state = addSession(state, {
    date: dateKey,
    subject: fields.subject,
    topic: fields.topic,
    notes: fields.notes,
    durationMs: Math.round(minutes * 60000),
    startedAt: null,
    endedAt: null,
    source: 'manual',
  });
  persist();
  selectedDateKey = dateKey;

  const viewed = parseDateKey(dateKey);
  calendarYear = viewed.getFullYear();
  calendarMonth = viewed.getMonth();

  renderAll();
}

function shiftMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear -= 1;
  } else if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear += 1;
  }
  renderCalendar();
}

function initManualDateDefault() {
  els.manualDateInput.value = toDateKey(new Date());
}

function restoreActiveTimerFields() {
  if (!state.activeTimer) return;
  setStudyFields(state.activeTimer);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateTimerDisplay();
  }
});

els.startBtn.addEventListener('click', handleStart);
els.pauseBtn.addEventListener('click', handlePause);
els.resumeBtn.addEventListener('click', handleResume);
els.stopBtn.addEventListener('click', handleStop);
els.manualForm.addEventListener('submit', handleManualSubmit);
els.prevMonthBtn.addEventListener('click', () => shiftMonth(-1));
els.nextMonthBtn.addEventListener('click', () => shiftMonth(1));

initManualDateDefault();
restoreActiveTimerFields();
renderAll();

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function formatDurationShort(ms) {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}分`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

function formatMonthLabel(year, monthIndex) {
  return `${year}年${monthIndex + 1}月`;
}

function formatDayLabel(dateKey) {
  const d = parseDateKey(dateKey);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

function isSameMonth(date, year, monthIndex) {
  return date.getFullYear() === year && date.getMonth() === monthIndex;
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeSession(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const durationMs = Number(raw.durationMs);
  if (!Number.isFinite(durationMs) || durationMs < 0) return null;
  const date = typeof raw.date === 'string' ? raw.date : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : createId(),
    date,
    subject: String(raw.subject ?? '').trim(),
    topic: String(raw.topic ?? '').trim(),
    notes: String(raw.notes ?? '').trim(),
    durationMs: Math.floor(durationMs),
    startedAt: raw.startedAt ?? null,
    endedAt: raw.endedAt ?? null,
    source: raw.source === 'manual' ? 'manual' : 'timer',
  };
}

function normalizeActiveTimer(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const startedAt = raw.startedAt;
  if (typeof startedAt !== 'string') return null;
  return {
    startedAt,
    subject: String(raw.subject ?? '').trim(),
    topic: String(raw.topic ?? '').trim(),
    notes: String(raw.notes ?? '').trim(),
    accumulatedMs: Math.max(0, Number(raw.accumulatedMs) || 0),
    pausedAt: raw.pausedAt ?? null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return cloneDefaultState();

    const sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions.map(normalizeSession).filter(Boolean)
      : [];

    const activeTimer = normalizeActiveTimer(parsed.activeTimer);

    return {
      version: 1,
      sessions,
      activeTimer,
    };
  } catch {
    return cloneDefaultState();
  }
}

function saveState(state) {
  const payload = {
    version: 1,
    sessions: state.sessions,
    activeTimer: state.activeTimer,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function addSession(state, session) {
  const entry = normalizeSession({ ...session, id: createId() });
  if (!entry) return state;
  return {
    ...state,
    sessions: [...state.sessions, entry],
  };
}

function setActiveTimer(state, activeTimer) {
  return { ...state, activeTimer };
}

function getSessionsForDate(state, dateKey) {
  return state.sessions
    .filter((s) => s.date === dateKey)
    .sort((a, b) => (a.startedAt || '').localeCompare(b.startedAt || ''));
}

function getDatesWithSessions(state) {
  const set = new Set();
  for (const s of state.sessions) {
    set.add(s.date);
  }
  return set;
}

function getTotalMsForDate(state, dateKey) {
  return getSessionsForDate(state, dateKey).reduce((sum, s) => sum + s.durationMs, 0);
}

{ createId };

function getElapsedMs(activeTimer, now = Date.now()) {
  if (!activeTimer) return 0;
  let total = activeTimer.accumulatedMs || 0;
  if (!activeTimer.pausedAt && activeTimer.startedAt) {
    const segmentStart = new Date(activeTimer.startedAt).getTime();
    if (Number.isFinite(segmentStart)) {
      total += now - segmentStart;
    }
  }
  return Math.max(0, total);
}

function isRunning(activeTimer) {
  return activeTimer && !activeTimer.pausedAt;
}

function startTimer(fields) {
  return {
    startedAt: new Date().toISOString(),
    subject: fields.subject,
    topic: fields.topic,
    notes: fields.notes,
    accumulatedMs: 0,
    pausedAt: null,
  };
}

function pauseTimer(activeTimer, now = Date.now()) {
  if (!activeTimer || activeTimer.pausedAt) return activeTimer;
  return {
    ...activeTimer,
    accumulatedMs: getElapsedMs(activeTimer, now),
    pausedAt: new Date(now).toISOString(),
    startedAt: null,
  };
}

function resumeTimer(activeTimer, now = Date.now()) {
  if (!activeTimer || !activeTimer.pausedAt) return activeTimer;
  return {
    ...activeTimer,
    startedAt: new Date(now).toISOString(),
    pausedAt: null,
  };
}

function buildSessionFromTimer(activeTimer, now = Date.now()) {
  const durationMs = getElapsedMs(activeTimer, now);
  const endedAt = new Date(now).toISOString();
  const date = toDateKey(new Date(now));
  return {
    date,
    subject: activeTimer.subject,
    topic: activeTimer.topic,
    notes: activeTimer.notes,
    durationMs,
    startedAt: activeTimer.startedAt || endedAt,
    endedAt,
    source: 'timer',
  };
}


