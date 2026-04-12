const DEFAULT_PASSWORD = "admin123";

const HIDDEN_WORDS = [
  { word: "solve.",     context: "...which are easier to solve." },
  { word: "it.",        context: "...is to experiment with it." },
  { word: "numbers:",   context: "...the simple task of adding two numbers:" },
  { word: "steps:",     context: "...the program follows these steps:" },
  { word: "result.",    context: "...the program stops there and returns the result." },
  { word: "itself.",    context: "...the method never stops calling itself." },
  { word: "becomes 0.", context: "...the halting condition is when the parameter k becomes 0." },
  { word: "concept.",   context: "...to better understand the concept." },
  { word: "an end.",    context: "...between a start and an end." },
  { word: "end is",     context: "...when end is not greater than start:" },
  { word: "start:",     context: "...not greater than start:" }
];

function getPassword() {
  return localStorage.getItem("hw_admin_password") || DEFAULT_PASSWORD;
}

function getWordData() {
  const raw = localStorage.getItem("hw_word_data");
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  const data = {};
  HIDDEN_WORDS.forEach(w => { data[w.word] = ""; });
  return data;
}

function saveWordData(data) {
  localStorage.setItem("hw_word_data", JSON.stringify(data));
}

function loadFromServer() {
  return fetch("data.json?" + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      saveWordData(data);
      return data;
    })
    .catch(function() { return getWordData(); });
}

// --- Login ---

document.getElementById("passwordInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") tryLogin();
});

function tryLogin() {
  const input = document.getElementById("passwordInput").value;
  const error = document.getElementById("errorMsg");

  if (input === getPassword()) {
    sessionStorage.setItem("hw_admin_auth", "true");
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadFromServer().then(function() { renderWords(); });
  } else {
    error.textContent = "Incorrect password. Try again.";
    document.getElementById("passwordInput").value = "";
    document.getElementById("passwordInput").focus();
  }
}

function logout() {
  sessionStorage.removeItem("hw_admin_auth");
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("passwordInput").value = "";
  document.getElementById("errorMsg").textContent = "";
}

// --- Auto-login if session is active ---
if (sessionStorage.getItem("hw_admin_auth") === "true") {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  loadFromServer().then(function() { renderWords(); });
}

// --- Render word cards ---
function renderWords() {
  const grid = document.getElementById("wordsGrid");
  const data = getWordData();

  grid.innerHTML = "";

  HIDDEN_WORDS.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `
      <div class="word-card-header">
        <div class="word-label">
          <div class="word-index">${i + 1}</div>
          <div class="word-name">${escapeHtml(item.word)}</div>
        </div>
        <div class="word-context">${escapeHtml(item.context)}</div>
      </div>
      <div class="word-card-body">
        <textarea
          id="input_${i}"
          data-word="${escapeHtml(item.word)}"
          placeholder="Text to copy to clipboard when this word is clicked..."
        >${escapeHtml(data[item.word] || "")}</textarea>
      </div>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- Collect current form data ---
function collectData() {
  const data = {};
  HIDDEN_WORDS.forEach((item, i) => {
    const textarea = document.getElementById("input_" + i);
    data[item.word] = textarea.value;
  });
  return data;
}

// --- Save & Download data.json ---
function saveAll() {
  const data = collectData();
  saveWordData(data);

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const status = document.getElementById("saveStatus");
  status.textContent = "\u2713 data.json downloaded! Replace the file in your project and push to GitHub.";
  status.classList.add("show");
  setTimeout(() => { status.classList.remove("show"); }, 5000);
}

// --- Section switching ---
function showSection(name) {
  document.getElementById("sectionWords").style.display = name === "words" ? "block" : "none";
  document.getElementById("sectionSettings").style.display = name === "settings" ? "block" : "none";

  document.querySelectorAll(".admin-nav-link").forEach(link => link.classList.remove("active"));
  event.target.classList.add("active");
}

// --- Change password ---
function changePassword() {
  const current = document.getElementById("currentPass").value;
  const newP = document.getElementById("newPass").value;
  const conf = document.getElementById("confirmPass").value;
  const status = document.getElementById("passStatus");

  if (current !== getPassword()) {
    status.textContent = "\u2717 Current password is incorrect.";
    status.style.color = "#e74c3c";
    status.classList.add("show");
    setTimeout(() => { status.classList.remove("show"); }, 3000);
    return;
  }

  if (newP.length < 4) {
    status.textContent = "\u2717 Password must be at least 4 characters.";
    status.style.color = "#e74c3c";
    status.classList.add("show");
    setTimeout(() => { status.classList.remove("show"); }, 3000);
    return;
  }

  if (newP !== conf) {
    status.textContent = "\u2717 Passwords do not match.";
    status.style.color = "#e74c3c";
    status.classList.add("show");
    setTimeout(() => { status.classList.remove("show"); }, 3000);
    return;
  }

  localStorage.setItem("hw_admin_password", newP);

  document.getElementById("currentPass").value = "";
  document.getElementById("newPass").value = "";
  document.getElementById("confirmPass").value = "";

  status.textContent = "\u2713 Password updated!";
  status.style.color = "#04AA6D";
  status.classList.add("show");
  setTimeout(() => { status.classList.remove("show"); }, 3000);
}

// --- Reset all ---
function resetAll() {
  if (confirm("Are you sure you want to clear all clipboard text assignments?")) {
    const data = {};
    HIDDEN_WORDS.forEach(w => { data[w.word] = ""; });
    saveWordData(data);
    renderWords();

    const status = document.getElementById("saveStatus");
    status.textContent = "\u2713 All data has been reset. Don't forget to Save & Download.";
    status.classList.add("show");
    setTimeout(() => { status.classList.remove("show"); }, 3000);
  }
}
