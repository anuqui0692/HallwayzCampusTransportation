/* =========================================================
   GLOBAL SETTINGS
========================================================= */

const DEFAULT_LOCATION = "Pampanga State Agricultural University";
const MAP_ZOOM = 17;

/* =========================================================
   ELEMENTS
========================================================= */

const signUpBtn = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");

const searchInput = document.getElementById("searchInput");
const mapFrame = document.querySelector("iframe");

const fromInput = document.getElementById("fromInput");
const toInput = document.getElementById("searchInput");

/* =========================================================
   NAVIGATION
========================================================= */

function goTo(page) {
  const routes = {
    home: "map.html",
    message: "message.html",
    profile: "profile.html",
    notification: "notification.html"
  };

  if (routes[page]) window.location.href = routes[page];
}

/* =========================================================
   MAP FUNCTIONS
========================================================= */

function updateMap(location, type = "m") {
  const query = location || DEFAULT_LOCATION;

  const url =
    "https://maps.google.com/maps?q=" +
    encodeURIComponent(query) +
    "&t=" + type +
    "&z=" + MAP_ZOOM +
    "&output=embed";

  if (mapFrame) mapFrame.src = url;
}

function searchLocation() {
  const value = searchInput?.value.trim();
  if (value) updateMap(value);
  else alert("Please enter a location");
}

searchInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchLocation();
});

function setMapType(type) {
  const value = searchInput?.value.trim();
  updateMap(value, type === "satellite" ? "k" : "m");
}

/* =========================================================
   AUTH SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const signupSubmit = document.getElementById("signupSubmit");
  const loginSubmit = document.getElementById("loginSubmit");

  signupSubmit?.addEventListener("click", () => {
    const username = document.getElementById("su_username")?.value.trim();
    const email = document.getElementById("su_email")?.value.trim();
    const password = document.getElementById("su_password")?.value.trim();
    const phone = document.getElementById("su_phone")?.value.trim();

    if (!username || !email || !password || !phone)
      return alert("Please fill all fields.");

    signupSubmit.innerHTML = "Redirecting...";
    setTimeout(() => (window.location.href = "map.html"), 800);
  });

  loginSubmit?.addEventListener("click", () => {
    const username = document.getElementById("si_username")?.value.trim();
    const password = document.getElementById("si_password")?.value.trim();

    if (!username || !password)
      return alert("Please fill all fields.");

    loginSubmit.innerHTML = "Redirecting...";
    setTimeout(() => (window.location.href = "map.html"), 800);
  });

  loadBookingPage();
  loadMessageList();
  loadChatPage();
  loadNotifications();
  loadProfile();
  pushWebsiteUpdate();
});

/* =========================================================
   ROUTE / BOOKING
========================================================= */

function searchRoute() {
  const from = fromInput?.value.trim();
  const to = toInput?.value.trim();

  if (!from || !to) return alert("Please enter both From and To");

  localStorage.setItem("fromLocation", from);
  localStorage.setItem("toLocation", to);

  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;

  window.open(url, "_blank");
  estimateDistance();
}

function estimateDistance() {
  const km = Math.floor(Math.random() * 5) + 1;
  localStorage.setItem("distanceKM", km);
  alert("Estimated Distance: " + km + " km");
}

function goToBooking() {
  const from = fromInput?.value.trim();
  const to = toInput?.value.trim();

  if (!from || !to) {
    document.getElementById("routeNotif")?.classList.add("show");
    setTimeout(() => document.getElementById("routeNotif")?.classList.remove("show"), 2500);
    return;
  }

  localStorage.setItem("fromLocation", from);
  localStorage.setItem("toLocation", to);

  window.location.href = "booking.html";
}

function loadBookingPage() {
  const text = document.getElementById("destinationText");

  const from = localStorage.getItem("fromLocation");
  const to = localStorage.getItem("toLocation");
  const km = localStorage.getItem("distanceKM");

  if (text && from && to) {
    text.innerHTML = `
      <strong>From:</strong> ${from}<br>
      <strong>To:</strong> ${to}<br>
      <strong>Distance:</strong> ${km} km
    `;
  }
}

/* =========================================================
   RIDE SELECTION
========================================================= */

let selectedRide = null;
let selectedPrice = 0;

function selectRide(type, rate, cardId) {

  document.querySelectorAll(".ride-card")
    .forEach(c => c.classList.remove("selected"));

  document.getElementById(cardId)?.classList.add("selected");

  const km = parseFloat(localStorage.getItem("distanceKM")) || 1;

  selectedRide = type;
  selectedPrice = Number((km * rate).toFixed(2));

  console.log("Selected:", selectedRide, selectedPrice);
}

function confirmRide() {

  if (!selectedRide) {
    alert("Please select a ride.");
    return;
  }

  // ALWAYS fetch latest saved values
  const from = localStorage.getItem("fromLocation") || "N/A";
  const to = localStorage.getItem("toLocation") || "N/A";

  const km = localStorage.getItem("distanceKM") || "1";

  // FINAL CALCULATION SAFETY
  const fare = selectedPrice || (km * 1);

  // SAVE FIRST (important)
  localStorage.setItem("finalFrom", from);
  localStorage.setItem("finalTo", to);
  localStorage.setItem("finalRide", selectedRide);
  localStorage.setItem("finalFare", fare);

  // UPDATE UI BEFORE SWITCH
  const fromText = document.getElementById("fromText");
  const toText = document.getElementById("toText");
  const rideText = document.getElementById("rideText");
  const fareText = document.getElementById("fareText");

  if (fromText) fromText.innerText = "From: " + from;
  if (toText) toText.innerText = "To: " + to;
  if (rideText) rideText.innerText = selectedRide;
  if (fareText) fareText.innerText = "₱" + fare;

  // SWITCH VIEW LAST (IMPORTANT)
  document.getElementById("bookingSection").style.display = "none";
  document.getElementById("fareSummary").style.display = "flex";

  alert("Booking Confirmed!");
  pushNotification("Booking Confirmed", "Your ride booking was confirmed.");
}

function finishBooking() {
  document.querySelector(".done-btn")?.classList.add("active");
  setTimeout(() => (window.location.href = "thankyouu.html"), 500);
}

/* =========================================================
   NOTIFICATIONS SYSTEM
========================================================= */

/* =========================================================
   PUSH NOTIFICATION (SYSTEM ONLY)
========================================================= */

function pushNotification(title, message, type = "system") {

  let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  const notif = {
    title,
    message,
    type, // system-only filter
    time: new Date().toLocaleString(),
    unread: true
  };

  notifications.unshift(notif);

  localStorage.setItem("notifications", JSON.stringify(notifications));
}

/* =========================================================
   LOAD NOTIFICATIONS LIST
========================================================= */

function loadNotifications() {

  const container = document.getElementById("notifList");
  if (!container) return;

  let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  // KEEP ONLY SYSTEM NOTIFICATIONS
  notifications = notifications.filter(n => n.type === "system");

  container.innerHTML = "";

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-notif">
        No notifications yet
      </div>
    `;
    return;
  }

  notifications.forEach((notif, index) => {

    const div = document.createElement("div");
    div.className = notif.unread ? "sms-item unread-notif" : "sms-item";

    div.innerHTML = `
      <div class="sms-left">

        <div class="sms-avatar">🔔</div>

        <div class="sms-info">
          <div class="sms-name">${notif.title}</div>
          <div class="sms-preview">${notif.message}</div>
        </div>

      </div>

      <button class="delete-btn" onclick="deleteNotification(event, ${index})">
        ⋮
      </button>
    `;

    /* OPEN FULL VIEW */
    div.addEventListener("click", () => {

      notif.unread = false;

      localStorage.setItem("notifications", JSON.stringify(notifications));
      localStorage.setItem("currentNotification", index);

      window.location.href = "viewnotification.html";
    });

    container.appendChild(div);
  });

  localStorage.setItem("notifications", JSON.stringify(notifications));
}

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

function deleteNotification(event, index) {

  event.stopPropagation();

  let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  if (!confirm("Delete this notification?")) return;

  notifications.splice(index, 1);

  localStorage.setItem("notifications", JSON.stringify(notifications));

  loadNotifications();
}

/* =========================================================
   LOAD SINGLE NOTIFICATION VIEW PAGE
========================================================= */

function loadNotificationView() {

  const container = document.getElementById("notificationView");
  if (!container) return;

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  const index =
    localStorage.getItem("currentNotification");

  const notif = notifications[index];

  if (!notif) return;

  container.innerHTML = `
    <div class="notif-view-card">

      <div class="notif-view-title">
        ${notif.title}
      </div>

      <div class="notif-view-time">
        ${notif.time}
      </div>

      <div class="notif-view-message">
        ${notif.message}
      </div>

    </div>
  `;
}

/* =========================================================
   SYSTEM EVENTS HELPERS
========================================================= */

/* ACCOUNT CREATED */
function notifyAccountCreated() {
  pushNotification("Account Created", "Welcome to Hallwayz!", "system");
}

/* PROFILE UPDATED */
function notifyProfileUpdated() {
  pushNotification("Profile Updated", "Your profile was updated successfully.", "system");
}

/* BOOKING CONFIRMED */
function notifyBookingConfirmed() {
  pushNotification("Booking Confirmed", "Your ride has been confirmed.", "system");
}

/* =========================================================
   WEBSITE UPDATE (ONCE ONLY)
========================================================= */

function pushWebsiteUpdate() {

  const alreadyShown =
    localStorage.getItem("websiteUpdateV1");

  if (alreadyShown) return;

  pushNotification(
    "Hallwayz Update",
    "New features and improvements are now available.",
    "system"
  );

  localStorage.setItem("websiteUpdateV1", "shown");
}

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadNotifications();
  loadNotificationView();
  pushWebsiteUpdate();

});

/* =========================================================
   PROFILE SYSTEM
========================================================= */

 /* =========================================================
    PROFILE SYSTEM
    (Clean + Fixed + No duplicates)
========================================================= */

let editMode = false;

/* =========================================================
   LOAD PROFILE ON START
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
});

/* =========================================================
   TOGGLE EDIT MODE
========================================================= */
function toggleEdit() {
  editMode = !editMode;

  const inputs = document.querySelectorAll(".profile-fields input");

  inputs.forEach(input => {
    input.disabled = !editMode;
  });

  const btn = document.querySelector(".edit-btn");

  if (btn) {
    btn.innerText = editMode ? "Cancel" : "Edit";
  }

  if (!editMode) {
    loadProfile(); // reset if cancelled
  }
}

/* =========================================================
   SAVE PROFILE DATA
========================================================= */
function saveProfile() {

  const data = {
    name: document.getElementById("name")?.value || "",
    username: document.getElementById("username")?.value || "",
    email: document.getElementById("email")?.value || "",
    password: document.getElementById("password")?.value || "",
    phone: document.getElementById("phone")?.value || ""
  };

  localStorage.setItem("profile", JSON.stringify(data));

  // 🔔 ADD THIS LINE (IMPORTANT FIX)
  pushNotification(
    "Profile Updated",
    "Your profile information was updated successfully.",
    "system"
  );

  alert("Profile Saved!");

  editMode = false;

  document.querySelectorAll(".profile-fields input")
    .forEach(input => input.disabled = true);

  document.querySelector(".edit-btn").innerText = "Edit";

  loadNotifications(); // refresh list immediately
}

/* =========================================================
   LOAD PROFILE DATA
========================================================= */
function loadProfile() {

  const data = JSON.parse(localStorage.getItem("profile"));

  if (data) {
    document.getElementById("name").value = data.name || "";
    document.getElementById("username").value = data.username || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("password").value = data.password || "";
    document.getElementById("phone").value = data.phone || "";
  }

  loadProfileImageFromStorage();
}

/* =========================================================
   PROFILE IMAGE HANDLING
========================================================= */

/* CLICK PROFILE CIRCLE */
function handleProfileClick() {

  const savedImage = localStorage.getItem("profileImage");

  // if no image yet → open file picker
  if (!savedImage) {
    document.getElementById("profileUpload")?.click();
    return;
  }

  document.getElementById("profilePanel")?.classList.add("show");
  document.body.classList.add("panel-open");
}

/* LOAD IMAGE FROM FILE INPUT */
function loadProfileImage(event) {

  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    const preview = document.getElementById("profilePreview");
    const placeholder = document.getElementById("profilePlaceholder");

    if (preview) {
      preview.src = e.target.result;
      preview.style.display = "block";
    }

    if (placeholder) {
      placeholder.style.display = "none";
    }

    localStorage.setItem("profileImage", e.target.result);
  };

  reader.readAsDataURL(file);
}

/* LOAD SAVED IMAGE ON PAGE LOAD */
function loadProfileImageFromStorage() {

  const saved = localStorage.getItem("profileImage");

  const preview = document.getElementById("profilePreview");
  const placeholder = document.getElementById("profilePlaceholder");

  if (saved && preview) {
    preview.src = saved;
    preview.style.display = "block";

    if (placeholder) placeholder.style.display = "none";
  }
}

/* =========================================================
   PROFILE PANEL ACTIONS
========================================================= */

/* CHOOSE NEW PHOTO */
function chooseProfilePicture() {
  closeProfilePanel();
  document.getElementById("profileUpload")?.click();
}

/* VIEW PHOTO */
function viewProfilePicture() {

  const img = localStorage.getItem("profileImage");

  if (!img) return;

  const viewer = document.getElementById("imageViewer");
  const viewerImg = document.getElementById("viewerImage");

  if (viewerImg) viewerImg.src = img;
  if (viewer) viewer.classList.add("show");

  closeProfilePanel();
}

/* DELETE PHOTO */
function deleteProfilePicture() {

  localStorage.removeItem("profileImage");

  const preview = document.getElementById("profilePreview");
  const placeholder = document.getElementById("profilePlaceholder");

  if (preview) {
    preview.src = "";
    preview.style.display = "none";
  }

  if (placeholder) {
    placeholder.style.display = "block";
  }

  closeProfilePanel();
}

/* CLOSE PANEL */
function closeProfilePanel() {
  document.getElementById("profilePanel")?.classList.remove("show");
}

/* CLOSE IMAGE VIEWER */
function closeViewer() {
  document.getElementById("imageViewer")?.classList.remove("show");
}

/* =========================================================
   OUTSIDE CLICK CLOSE PANEL
========================================================= */

document.addEventListener("click", function(e) {

  const panel = document.getElementById("profilePanel");
  const circle = document.querySelector(".profile-circle");

  if (!panel || !circle) return;

  const clickedOutside =
    !panel.contains(e.target) &&
    !circle.contains(e.target);

  if (clickedOutside) {
    panel.classList.remove("show");
  }
});
/* =========================================================
   MESSAGES SYSTEM (SIMPLIFIED)
========================================================= */

let currentChatIndex = null;

function loadMessageList() {

  const container = document.getElementById("messageList");
  if (!container) return;

  const chats = JSON.parse(localStorage.getItem("smsChats")) || [];
  container.innerHTML = "";

  chats.forEach((chat, index) => {

    const last = chat.messages?.at(-1)?.text || "No messages yet";

    const div = document.createElement("div");
    div.className = "sms-item";

    div.innerHTML = `
      <div class="sms-left">

        <div class="sms-avatar">H</div>

        <div class="sms-info">
          <div class="sms-name">${chat.name}</div>
          <div class="sms-preview">${last}</div>
        </div>

      </div>

      <button class="delete-btn" onclick="deleteChat(event, ${index})">
        ⋮
      </button>
    `;

    // OPEN CHAT (but ignore delete button clicks)
    div.onclick = () => {
      localStorage.setItem("currentChatIndex", index);
      window.location.href = "chat.html";
    };

    container.appendChild(div);
  });
}

function createConversation() {

  const name = prompt("Enter name:");

  if (!name || !name.trim()) return;

  let chats = JSON.parse(localStorage.getItem("smsChats")) || [];

  chats.unshift({
    name: name.trim(),
    messages: []
  });

  localStorage.setItem("smsChats", JSON.stringify(chats));

  loadMessageList();
}

function loadChatPage() {
  const box = document.getElementById("chatBox");
  if (!box) return;

  currentChatIndex = localStorage.getItem("currentChatIndex");

  const chats = JSON.parse(localStorage.getItem("smsChats")) || [];
  const chat = chats[currentChatIndex];
  if (!chat) return;

  document.getElementById("chatName").innerText = chat.name;

  box.innerHTML = "";
  chat.messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg " + m.type;
    div.innerText = m.text;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function getAutoReply(text) {
  text = text.toLowerCase();

  // Greetings
  if (text.includes("hello")) return "Hi";
  if (text.includes("hi")) return "Hello";

  // Transport / ride app common replies
  if (text.includes("where are you")) return "I'm on my way, ma'am/sir";
  if (text.includes("how many more minutes")) return "About 3-5 minutes ⏳";
  if (text.includes("how long")) return "Should arrive shortly";
  if (text.includes("arrived")) return "I'm here at the location";
  if (text.includes("waiting")) return "Please wait a moment, on the way na po";
  if (text.includes("traffic")) return "There's a bit of traffic, but moving steadily";
  if (text.includes("okay")) return "got it";


  // Default fallback
  return "okay";
}

function sendChatMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  const chats = JSON.parse(localStorage.getItem("smsChats")) || [];

  chats[currentChatIndex].messages.push({ text, type: "sent" });

  localStorage.setItem("smsChats", JSON.stringify(chats));
  loadChatPage();

  input.value = "";

  // ⏳ simulate "typing delay" (1–2 seconds)
  const delay = Math.floor(Math.random() * 1000) + 1000;

  setTimeout(() => {
    chats[currentChatIndex].messages.push({
      text: getAutoReply(text),
      type: "received"
    });

    localStorage.setItem("smsChats", JSON.stringify(chats));
    loadChatPage();
  }, delay);
}

function deleteChat(event, index) {

  event.stopPropagation();

  let chats = JSON.parse(localStorage.getItem("smsChats")) || [];

  if (!confirm("Delete this conversation?")) return;

  chats.splice(index, 1);

  localStorage.setItem("smsChats", JSON.stringify(chats));

  loadMessageList();
}

/* =========================================================
   INIT
========================================================= */

function goBack() {
  window.location.href = "message.html";
}
