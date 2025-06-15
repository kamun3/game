const GITHUB_RAW_URL = "https://raw.githubusercontent.com/kamun3/celebrity-servers/main/servers.json";

let servers = [];

// تحميل السيرفرات من GitHub (ملف JSON)
async function loadServers() {
  try {
    const res = await fetch(GITHUB_RAW_URL + "?t=" + Date.now()); // منع الكاش
    servers = await res.json();
    updateServerList();
  } catch (error) {
    alert("فشل تحميل قائمة السيرفرات");
    console.error(error);
  }
}

// تحديث قائمة السيرفرات المعروضة حسب البحث
function updateServerList() {
  const search = document.getElementById("searchName").value.trim();
  const listDiv = document.getElementById("serverList");
  listDiv.innerHTML = "";

  const filtered = servers.filter(s => s.name.includes(search));

  if (filtered.length === 0) {
    listDiv.innerHTML = "<p>لا يوجد سيرفرات</p>";
    return;
  }

  filtered.forEach((server, idx) => {
    const div = document.createElement("div");
    div.classList.add("server-item");
    div.textContent = server.name;
    div.onclick = () => joinServer(idx);
    listDiv.appendChild(div);
  });
}

let selectedServerIndex = null;

// عند الضغط على سيرفر للدخول
function joinServer(idx) {
  selectedServerIndex = idx;
  const server = servers[idx];

  if (server.password && server.password.length > 0) {
    document.getElementById("joinPass").value = "";
    showSection("joinSection");
  } else {
    enterGameWithServer(server.name);
  }
}

// تأكيد كلمة مرور السيرفر عند الدخول
function confirmJoin() {
  const inputPass = document.getElementById("joinPass").value;
  const server = servers[selectedServerIndex];

  if (inputPass === server.password) {
    enterGameWithServer(server.name);
  } else {
    alert("كلمة المرور غير صحيحة");
  }
}

// الدخول للعبة (تقدر تضيف هنا منطق لعبتك)
function enterGameWithServer(serverName) {
  alert("تم الدخول للسيرفر: " + serverName);
  // أخفي القوائم وابدأ اللعبة
  showSection("gameArea");
  // تحديث اللعبة حسب السيرفر المختار ...
}

// إظهار القسم المطلوب وإخفاء الباقي
function showSection(id) {
  ["nameSection", "mainMenu", "createSection", "joinSection", "waitingScreen", "gameArea"].forEach(sec => {
    document.getElementById(sec).style.display = (sec === id) ? "block" : "none";
  });
}

// الدخول بالاسم فقط (بعدها يظهر القايمة الرئيسية)
function enterGame() {
  const playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("يرجى إدخال اسمك");
    return;
  }
  showSection("mainMenu");
  loadServers();
}

// عرض إنشاء سيرفر
function showCreate() {
  showSection("createSection");
  document.getElementById("serverName").value = "";
  document.getElementById("serverPass").value = "";
}

// إنشاء سيرفر جديد وإرساله للباك اند (API)
async function createServer() {
  const serverName = document.getElementById("serverName").value.trim();
  const serverPass = document.getElementById("serverPass").value.trim();

  if (!serverName) {
    alert("يرجى إدخال اسم السيرفر");
    return;
  }

  // تحقق عدم وجود اسم مشابه مسبقاً
  if (servers.find(s => s.name === serverName)) {
    alert("اسم السيرفر موجود مسبقاً");
    return;
  }

  const newServer = { name: serverName, password: serverPass };

  try {
    const res = await fetch("https://your-backend-url.com/api/addServer", { // غير العنوان للباك اند الحقيقي
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newServer),
    });

    if (!res.ok) throw new Error("فشل إضافة السيرفر");

    alert("تم إنشاء السيرفر بنجاح!");
    showSection("mainMenu");
    loadServers();

  } catch (error) {
    alert("حدث خطأ: " + error.message);
  }
}
