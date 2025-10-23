import { db, ref, push, set, onValue, get, child } from "./firebase.js";

// Elemen
const promptEl = document.getElementById("prompt");
const toneEl = document.getElementById("tone");
const generateBtn = document.getElementById("generateBtn");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const historyList = document.getElementById("historyList");

// User ID persist
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = `guest_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem("userId", userId);
}

let lastResult = "";

// Load history
function loadHistory() {
  try {
    const historyRef = ref(db, `history/${userId}`);
    onValue(historyRef, (snapshot) => {
      const val = snapshot.val() || {};
      const items = Object.entries(val).reverse();
      renderHistory(items);
    }, (error) => {
      console.error("Firebase onValue error:", error);
    });
  } catch (e) {
    console.warn("Gagal memuat riwayat:", e);
  }
}

// Render history
function renderHistory(items) {
  if (!items.length) {
    historyList.innerHTML = `<p class="opacity-80 text-sm">Belum ada riwayat — buat motivasi pertama kamu!</p>`;
    return;
  }

  historyList.innerHTML = items
    .map(([id, data]) => {
      const short = data.text.length > 120 ? data.text.slice(0, 120) + "…" : data.text;
      return `
      <div class="p-3 rounded-lg bg-white/6 flex justify-between items-start">
        <div>
          <div class="text-sm opacity-80">${data.prompt}</div>
          <div class="mt-1">${short}</div>
          <div class="text-xs opacity-70 mt-2">${new Date(data.createdAt).toLocaleString()}</div>
        </div>
        <div class="ml-4 flex flex-col gap-2">
          <button onclick="useHistory('${id}')" class="text-xs px-2 py-1 rounded bg-white/10">Gunakan</button>
        </div>
      </div>`;
    })
    .join("");
}

// Gunakan history
window.useHistory = async function (key) {
  try {
    const snapshot = await get(child(ref(db), `history/${userId}/${key}`));
    const data = snapshot.val();
    if (!data) return;
    resultText.textContent = data.text;
    lastResult = data.text;
    resultCard.classList.remove("hidden");
  } catch (err) {
    console.error("Gagal mengambil riwayat:", err);
  }
};

// Generate motivasi
generateBtn.addEventListener("click", async () => {
  const prompt = promptEl.value.trim();
  const tone = toneEl.value;

  if (!prompt) return alert("Tolong isi prompt terlebih dahulu.");

  generateBtn.disabled = true;
  generateBtn.textContent = "Sedang generate...";

  try {
    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, tone, length: "short" }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || "Terjadi error server");

    const text = data.result || "Maaf, terjadi kesalahan.";
    lastResult = text;
    resultText.textContent = text;
    resultCard.classList.remove("hidden");

    // Simpan ke Firebase
    const historyRef = ref(db, `history/${userId}`);
    const newItem = push(historyRef);
    await set(newItem, { prompt, tone, text, createdAt: Date.now() });

  } catch (err) {
    console.error(err);
    alert("Error: " + (err.message || "Coba lagi"));
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Dapatkan Motivasi";
  }
});

// Copy & Save
copyBtn.addEventListener("click", async () => {
  if (!lastResult) return;
  await navigator.clipboard.writeText(lastResult);
  copyBtn.textContent = "Disalin!";
  setTimeout(() => (copyBtn.textContent = "Salin"), 1500);
});

saveBtn.addEventListener("click", async () => {
  if (!lastResult) return;
  const savedRef = ref(db, `saved/${userId}`);
  const newSave = push(savedRef);
  await set(newSave, { text: lastResult, savedAt: Date.now() });
  saveBtn.textContent = "Disimpan ✅";
  setTimeout(() => (saveBtn.textContent = "Simpan"), 1500);
});

// Init
loadHistory();
