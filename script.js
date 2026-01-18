/***********************
  LIFE AS A GAME – JS
************************/

/* CONFIG */
const XP_PER_TASK = 20;

/* SELECTORS */
const taskList = document.querySelector(".task-list");
const addTaskInput = document.querySelector(".add-task input");
const addTaskBtn = document.querySelector(".add-task button");
const progressCircle = document.querySelector(".progress-circle span");
const progressRing = document.querySelector(".progress-circle");
const tasksCompletedEl = document.getElementById("tasks-completed");
const tasksTotalEl = document.getElementById("tasks-total");
const monthTotalEl = document.getElementById("month-total");
const monthCompletedEl = document.getElementById("month-completed");
const monthSuccessEl = document.getElementById("month-success");
const currentStreakEl = document.getElementById("current-streak");
const bestStreakEl = document.getElementById("best-streak");
const levelEl = document.getElementById("level-value");
const xpEl = document.getElementById("xp-value");
const xpFillEl = document.getElementById("xp-fill");
/***********************
 PLAYER PROFILE SELECTORS
************************/
const playerModal = document.getElementById("player-modal");
const playerNameInput = document.getElementById("player-name-input");
const playerAgeInput = document.getElementById("player-age-input");
const startGameBtn = document.getElementById("start-game-btn");

const playerNameEl = document.getElementById("player-name");
const playerAgeEl = document.getElementById("player-age");

/* STORAGE KEYS */
const STORAGE_KEY = "life_as_a_game_data";
const PLAYER_KEY = "life_as_a_game_player";

/* DEFAULT DATA */
const defaultData = {
  level: 0,
  xp: 0,
  tasks: [],
  currentStreak: 0,
  bestStreak: 0,
  weeklyProgress: {} // ✅ REQUIRED for Weekly Overview
};

/* LOAD DATA */
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  loadPlayerProfile();
  renderAll();
});

/* EVENTS */
addTaskBtn.addEventListener("click", addTask);
addTaskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

/* FUNCTIONS */

function addTask() {
  const text = addTaskInput.value.trim();
  if (!text) return;

  data.tasks.push({
    id: Date.now(),
    text,
    done: false
  });

  addTaskInput.value = "";
  saveData();
  renderTasks();
}

function toggleTask(id) {
  const task = data.tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;

  if (task.done) {
  data.xp += XP_PER_TASK;
  checkLevelUp();
} else {
  data.xp -= XP_PER_TASK;
  if (data.xp < 0) data.xp = 0;
}

  saveData();
  renderAll();
}

function deleteTask(id) {
  data.tasks = data.tasks.filter(t => t.id !== id);
  saveData();
  renderAll();
}

function checkLevelUp() {
  const xpNeeded = 100 + (data.level * 40);

  if (data.xp >= xpNeeded) {
    data.level += 1;
    data.xp = 0; // 🔥 CRITICAL: reset XP
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  data.tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.done ? "checked" : ""}>
        <span>${task.text}</span>
      </div>
      <button class="delete-task">🗑️</button>
    `;

    li.querySelector("input").addEventListener("change", () => toggleTask(task.id));
    li.querySelector(".delete-task").addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(li);
  });
}

function renderStats() {

  // 🎮 PLAYER STATS (NEW LOGIC)
levelEl.textContent = data.level;
xpEl.textContent = `${data.xp} XP`;

const xpNeeded = 100 + (data.level * 40);
const xpPercent = Math.min((data.xp / xpNeeded) * 100, 100);

xpFillEl.style.width = xpPercent + "%";


  const completed = data.tasks.filter(t => t.done).length;
const total = data.tasks.length;

let percent = 0;
if (total > 0) {
  percent = Math.round((completed / total) * 100);
}

// 🔥 THIS WAS MISSING
tasksCompletedEl.textContent = completed;
tasksTotalEl.textContent = total;

progressCircle.textContent = percent + "%";
progressRing.style.background =
  percent === 0
    ? "#1c2530"
    : `conic-gradient(#00ffb3 ${percent}%, #1c2530 0)`;

  // 📊 Monthly Stats (for now = lifetime stats)
const monthTotal = data.tasks.length;
const monthCompleted = data.tasks.filter(t => t.done).length;

let successRate = 0;
if (monthTotal > 0) {
  successRate = Math.round((monthCompleted / monthTotal) * 100);
}

monthTotalEl.textContent = monthTotal;
monthCompletedEl.textContent = monthCompleted;
monthSuccessEl.textContent = successRate + "%";

// 🔥 Streak display
currentStreakEl.textContent = data.currentStreak;
bestStreakEl.textContent = data.bestStreak;
}

function renderWeeklyOverview() {
  if (!data.weeklyProgress) return;

  const dayBoxes = document.querySelectorAll(".day-box");
  if (!dayBoxes.length) return;

  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // ✅ Monday = 0

  dayBoxes.forEach(box => {
    if (!box.dataset.day) return;

    // Default style (future / untouched)
    box.style.background = "#0b1117";
    box.style.color = "#eaeaea";

    const dayIndex = Number(box.dataset.day);
    if (isNaN(dayIndex)) return;

    const date = new Date(now);
    date.setDate(now.getDate() - todayIndex + dayIndex);

    const key = date.toISOString().split("T")[0];

    if (data.weeklyProgress[key] === "win") {
      box.style.background = "#00ffb3";
      box.style.color = "#000";
    } 
    else if (data.weeklyProgress[key] === "lose") {
      box.style.background = "#ff4d4d";
      box.style.color = "#000";
    }
  });
}

/***********************
 PLAYER PROFILE LOGIC
************************/

function loadPlayerProfile() {
  const savedPlayer = JSON.parse(localStorage.getItem(PLAYER_KEY));

  if (!playerModal || !playerNameEl || !playerAgeEl) return;

  if (!savedPlayer || !savedPlayer.name || !savedPlayer.age) {
    playerNameEl.textContent = "Player";
    playerAgeEl.textContent = "Age";
    playerModal.classList.remove("hidden");
    return;
  }

  playerNameEl.textContent = `Player: ${savedPlayer.name}`;
  playerAgeEl.textContent = `Age: ${savedPlayer.age}`;
}

if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    const age = playerAgeInput.value.trim();

    if (!name || !age) {
      alert("Please enter both name and age");
      return;
    }

    const playerData = { name, age };
    localStorage.setItem(PLAYER_KEY, JSON.stringify(playerData));

    if (playerNameEl) playerNameEl.textContent = `Player: ${name}`;
    if (playerAgeEl) playerAgeEl.textContent = `Age: ${age}`;

    if (playerModal) playerModal.classList.add("hidden");
  });
}

function renderAll() {
  renderTasks();
  renderStats();
  renderWeeklyOverview();
}



function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
/***********************
 DAILY RESET + TIMER
************************/

const countdownEl = document.getElementById("countdown");

// Get or set next reset time (midnight)
function getNextResetTime() {
  const saved = localStorage.getItem("nextResetTime");
  if (saved) return new Date(saved);

  const now = new Date();
  const next = new Date();
  next.setHours(24, 0, 0, 0); // next midnight

  localStorage.setItem("nextResetTime", next);
  return next;
}

let nextResetTime = getNextResetTime();

function updateCountdown() {
  const now = new Date();
  const diff = nextResetTime - now;

  if (diff <= 0) {
    resetForNewDay();
    return;
  }

  const hrs = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

  countdownEl.textContent = `${hrs}:${mins}:${secs}`;
}

function resetForNewDay() {
  const total = data.tasks.length;
  const completed = data.tasks.filter(t => t.done).length;

    // 📅 WEEKLY OVERVIEW LOGIC
  const today = new Date();
  const dateKey = today.toISOString().split("T")[0];

  if (total > 0 && completed === total) {
    data.weeklyProgress[dateKey] = "win";
  } else {
    data.weeklyProgress[dateKey] = "lose";
  }

  // 🔥 STREAK LOGIC
  if (total > 0 && completed === total) {
    data.currentStreak += 1;

    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak;
    }
  } else {
    data.currentStreak = 0;
  }

  // Reset tasks for new day
  data.tasks.forEach(t => t.done = false);

  // Set next reset time
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  localStorage.setItem("nextResetTime", next);
  nextResetTime = next;

  saveData();
  renderAll();
}

// Update timer every second
setInterval(updateCountdown, 1000);
updateCountdown();
/***********************
 FULL RESET (START FROM SCRATCH)
************************/

const resetAllBtn = document.getElementById("full-reset-btn");

if (resetAllBtn) {
  resetAllBtn.addEventListener("click", () => {
    const confirmReset = confirm(
      "This will delete ALL progress, XP, levels and tasks.\nAre you sure?"
    );

    if (!confirmReset) return;

    // Clear only this app's data
    localStorage.removeItem("life_as_a_game_data");
    localStorage.removeItem("nextResetTime");
    localStorage.removeItem("life_as_a_game_player"); // 🔥 ADD THIS

    // Reload page to reinitialize everything
    location.reload();
  });
}
