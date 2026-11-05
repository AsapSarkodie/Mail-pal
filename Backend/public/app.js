 const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');

        // Toggle Sidebar
        hamburger.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });

        // Close Sidebar when clicking outside (on overlay)
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close Sidebar on Escape key (optional but good practice)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });

//mine
let pages = document.querySelectorAll(".pages li");
let pageName = document.querySelector("#page-name");
let date = document.querySelector("#date");
let composeBtn = document.querySelector("#compose-btn");
let composeBox = document.querySelector("#compose-box");
let closeCompose = document.querySelector("#close-compose");
//change page Name and fetch data later
pages.forEach((page)=>{
    page.addEventListener('click', ()=>{
        pageName.textContent = page.textContent;
    })
});

//date
let currentDate = new Date();
const month = new Intl.DateTimeFormat("en-US", {
  month: "long"
}).format(new Date());

const day = new Intl.DateTimeFormat("en-US", {
  day: "numeric"
}).format(new Date());

console.log(day);
let year = currentDate.getFullYear();


date.textContent = `${month} ${day}, ${year}`

//display compose box
composeBtn.addEventListener("click", ()=>{
   composeBox.style.display = "flex";
});

closeCompose.addEventListener('click', ()=>{
    composeBox.style.display = "none";
})
//escape to remove compose box
 document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && composeBox.style.display == "flex") {
                composeBox.style.display = "none";
            }
 });

 //c to open compose box
  document.addEventListener('keydown', (e) => {
            if (e.key === 'c' && composeBox.style.display == "none") {
                composeBox.style.display = "flex";
            }
 });

//code to send a message
let form = document.querySelector("#compose-box");
let receiver = document.querySelector(".reciever");
let body = document.querySelector("#message-body");
let subject = document.querySelector("#subject");


//send a message
form.addEventListener("submit", async (e)=>{
   e.preventDefault();
   try {
    let allMessage = {
        sentTo: receiver.value,
        subject: subject.value,
        body: body.value
    };

    const sendMessage = await fetch(`http://localhost:8080/mail/sendMessage`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(allMessage)
    });
    let response = await sendMessage.json();
    
    //check if it sent
    if (response.message === 'MESSAGE_SENT_SUCESSFULLY') {
        alert("message sent ")
    }
    form.reset()
    
   } catch (error) {
    console.log(error);
    
   }
});

//read inbox messages

// ============================================================
// READ INBOX + FULL MESSAGE VIEW
// ============================================================

// --- Reading pane element references ------------------------
const messageView   = document.getElementById("message-view");
const viewBackBtn   = document.getElementById("back-btn");
const viewStarBtn   = document.getElementById("view-star-btn");
const viewDeleteBtn = document.getElementById("view-delete-btn");
const viewSubject   = document.getElementById("view-subject");
const viewSender    = document.getElementById("view-sender");
const viewRecipient = document.getElementById("view-recipient");
const viewTime      = document.getElementById("view-time");
const viewAvatar    = document.getElementById("view-avatar");
const viewBody      = document.getElementById("view-body");

// --- Helpers ------------------------------------------------

/**
 * "john.doe@mail.com" -> "john.doe"
 * Returns the value unchanged when there is no "@" in it
 * (the old `.slice(0, indexOf("@"))` chopped the last char when "@" was missing).
 */
function displayName(email = "") {
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

/**
 * Turns an API timestamp into something readable, e.g. "Jul 12, 2024 · 2:32 PM".
 * Falls back to the raw "HH:MM:SS" part when the value can't be parsed.
 */
function formatTimestamp(value = "") {
  if (!value) return "";

  // Some backends send "2024-07-12 14:32:00" (space) which is not valid ISO 8601.
  // Replacing the space with "T" makes it parseable in every browser.
  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return String(value).slice(11, 19);

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);

  return `${datePart} · ${timePart}`;
}

// --- State --------------------------------------------------
let activeMessage = null;   // message object currently shown in the pane
let activeStarBtn = null;   // that message's star button inside the list

/** Mirrors the current message's star state into the reading pane button. */
function syncViewStar() {
  const starred = Boolean(activeMessage && activeMessage.starred);
  viewStarBtn.textContent = starred ? "★" : "☆";
  viewStarBtn.classList.toggle("starred", starred);
  viewStarBtn.setAttribute("aria-label", starred ? "Unstar message" : "Star message");
}

// --- Open / close the reading pane --------------------------

/**
 * Opens a message in the full message view.
 * @param {Object} message - the message object returned by the API
 * @param {Object} refs    - { card, starBtn } so the list can be kept in sync
 */
function openMessage(message, refs = {}) {
  activeMessage = message;
  activeStarBtn = refs.starBtn || null;

  // Fill the pane
  viewSubject.textContent   = message.subject || "(No subject)";
  viewSender.textContent    = displayName(message.sent_by || "");
  viewRecipient.textContent = message.sent_to ? `to ${message.sent_to}` : "";
  viewTime.textContent      = formatTimestamp(message.sent_at);
  viewBody.textContent      = message.body || "";
  viewAvatar.src            = "http://localhost:8080/images/user.png";
  viewAvatar.alt            = `${displayName(message.sent_by || "")} avatar`;

  syncViewStar();

  // Opening a message marks it as read (visual only for now)
  if (!message.is_read) {
    message.is_read = true;
    if (refs.card) refs.card.classList.remove("unread");
  }

  // Slide the pane in
  messageView.classList.add("open");
  messageView.setAttribute("aria-hidden", "false");
  viewBackBtn.focus(); // keyboard users land on "back"
}

/** Hides the reading pane and returns to the list. */
function closeMessage() {
  messageView.classList.remove("open");
  messageView.setAttribute("aria-hidden", "true");
  activeMessage = null;
  activeStarBtn = null;
}

// --- Reading pane events ------------------------------------

viewBackBtn.addEventListener("click", closeMessage);

// Star from inside the reading pane -> update the list card too
viewStarBtn.addEventListener("click", () => {
  if (!activeMessage) return;

  activeMessage.starred = !activeMessage.starred;

  if (activeStarBtn) {
    activeStarBtn.textContent = activeMessage.starred ? "★" : "☆";
    activeStarBtn.classList.toggle("starred", activeMessage.starred);
  }

  syncViewStar();
});

viewDeleteBtn.addEventListener("click", () => {
  // TODO: call your delete endpoint here, e.g.
  // await fetch(`http://localhost:8080/mail/deleteMessage/${activeMessage.id}`, { method: "DELETE" });
  // ...then remove the card from the DOM and close the pane.
  closeMessage();
});

// Escape closes the pane — unless the compose box is open (it has its own Escape handler)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (composeBox.style.display === "flex") return;
  closeMessage();
});

// ============================================================
// LOAD THE INBOX
// ============================================================
window.addEventListener("DOMContentLoaded", async () => {
  const cardContainer = document.querySelector(".card-container");

  try {
    const response = await fetch("http://localhost:8080/mail/readMessages");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const inbox = await response.json();
    const all = inbox.message;
    console.log(all);

    cardContainer.innerHTML = "";

    all.forEach((m) => {
     localStorage.setItem("username", m.sent_to)
      // Create elements
      const card    = document.createElement("li");
      const checkbox = document.createElement("input");
      const star    = document.createElement("button");
      const avatar  = document.createElement("img");
      const content = document.createElement("div");
      const top     = document.createElement("div");
      const sender  = document.createElement("span");
      const time    = document.createElement("span");
      const subject = document.createElement("h4");
      const preview = document.createElement("p");

      // Add classes
      card.className = "message-card";
      checkbox.className = "message-checkbox";
      star.className = "message-star";
      avatar.className = "message-avatar";
      content.className = "message-content";
      top.className = "message-top";
      sender.className = "message-sender";
      time.className = "message-time";
      subject.className = "message-subject";
      preview.className = "message-preview";

      // Checkbox
      checkbox.type = "checkbox";
      checkbox.setAttribute("aria-label", "Select message");

      // Star
      star.type = "button";
      star.textContent = m.starred ? "★" : "☆";
      star.classList.toggle("starred", m.starred);
      star.setAttribute("aria-label", "Star message");

      star.addEventListener("click", (event) => {
        event.stopPropagation();

        m.starred = !m.starred;
        star.textContent = m.starred ? "★" : "☆";
        star.classList.toggle("starred", m.starred);

        // If this message is open in the reading pane, keep its star in sync
        if (activeMessage === m) syncViewStar();
      });

      // Default avatar
      avatar.src = `http://localhost:8080/images/user.png`;
      
      
      avatar.alt = "Default avatar";

      // Message data
      sender.textContent  = displayName(m.sent_by || "");   // safe when there is no "@"
      subject.textContent = m.subject || "(No subject)";
      preview.textContent = m.body || "";

      // Read status
      if (!m.is_read) card.classList.add("unread");

      // Short timestamp in the list (the full date is shown in the reading pane)
      time.textContent = m.sent_at ? m.sent_at.slice(11, 19) : "";

      // Build message card
      top.append(sender, time);
      content.append(top, subject, preview);
      card.append(checkbox, star, avatar, content);

      cardContainer.appendChild(card);

      // === Click a message -> open the FULL message view ===
      card.addEventListener("click", (event) => {
        // Ignore clicks on the checkbox and the star
        if (event.target.closest(".message-checkbox, .message-star")) return;

        openMessage(m, { card, starBtn: star });
      });

      // Keyboard accessibility: Enter / Space also opens the message
      card.tabIndex = 0;
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMessage(m, { card, starBtn: star });
        }
      });
    });
  } catch (error) {
    console.error("Unable to load inbox:", error);
  }
});

//load userinfo
let user = localStorage.getItem("username")
console.log(user);
