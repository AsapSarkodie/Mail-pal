"use strict";

/* ==========================================================
   1. SETTINGS & ELEMENT REFERENCES
   ========================================================== */
const API_URL = "http://localhost:8080";
const SVG_NS = "http://www.w3.org/2000/svg";
const REPLIES_URL = "/mail/readReplies"; // GET /mail/readReplies/:messageId

const app = document.querySelector("#app");
const mailList = document.querySelector("#mailList");
const compose = document.querySelector("#compose");
const readingBody = document.querySelector("#readingBody");
const messageTemplate = document.querySelector("#messageTemplate");
const mobileQuery = window.matchMedia("(max-width: 900px)");

// List header + sidebar buttons
const listHead = document.querySelector(".list-head__title");
const listHeadMeta = document.querySelector(".list-head__meta");
const count = document.querySelector(".nav-item__count");
const inboxButton = document.querySelector('[data-folder="inbox"]');
const sentButton = document.querySelector('[data-folder="sent"]');

// Logged-in user (profile + compose header)
const composeBoxUserName = document.querySelector(".compose__from strong");
const profileEmail = document.querySelector(".profile__email");
const profileName = document.querySelector(".profile__name");
const avatar = document.querySelector(".avatar");

// Remember what the empty preview looks like, so we can bring it back later
const emptyPreview = readingBody.innerHTML;

// Filled in when the page loads (see the last section)
let currentUserEmail = "";

/* ==========================================================
   2. SIDEBAR
   On phones/tablets it slides in as a drawer ("is-sidebar-open").
   On desktop it collapses ("is-sidebar-collapsed").
   ========================================================== */
const toggleSidebar = () => {
  const className = mobileQuery.matches ? "is-sidebar-open" : "is-sidebar-collapsed";
  app.classList.toggle(className);
};

const closeDrawer = () => app.classList.remove("is-sidebar-open");

document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
  button.addEventListener("click", toggleSidebar);
});

// Clicking a mailbox, folder or label marks it active (and closes the drawer on mobile)
document.querySelector("#sidebar").addEventListener("click", (event) => {
  const item = event.target.closest(".nav-item");
  if (!item) return;

  document.querySelectorAll("#sidebar .nav-item").forEach((el) => {
    el.classList.remove("is-active");
    el.removeAttribute("aria-current");
  });
  item.classList.add("is-active");
  item.setAttribute("aria-current", "page");

  if (mobileQuery.matches) closeDrawer();
});

// Reset the drawer when the screen grows past the mobile breakpoint
mobileQuery.addEventListener("change", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

/* ==========================================================
   3. MESSAGE PREVIEW
   Every card's data is saved in a Map. When a card is clicked
   we look its data up in the Map and show it in the preview pane.
   ========================================================== */

// The Map: key = the card's id, value = the message data of that card
const messages = new Map();

// The message that is open in the preview pane right now (the Reply button needs it)
let currentMessage = null;

// Call this once for every card you create
const saveCard = (article, msg, index) => {
  article.dataset.id = index;       // 1. put an id on the card's HTML (data-id="0")
  messages.set(String(index), msg); // 2. save the card's data in the Map under that same id
};

// "2026-04-14T11:21:00Z"  ->  "April 14, 2026 at 11:21 AM"
const formatFullDate = (timestamp) =>
  new Date(timestamp).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

// "joe@mail.com"  ->  "Joe"
const getSenderName = (email) => `${email[0].toUpperCase()}${email.slice(1, email.indexOf("@"))}`;

// The names your data might use for the file link. If yours is different, add it to this list.
const FILE_FIELDS = ["file_path", "filePath", "file_url", "fileUrl", "file", "attachment", "attachments"];

// Returns the file link of a message, or null when the message has no file
const getFilePath = (msg) => {
  const field = FILE_FIELDS.find((name) => typeof msg[name] === "string" && msg[name].trim());
  return field ? msg[field].trim() : null;
};

// "https://site.com/uploads/my%20report.pdf?x=1"  ->  "my report.pdf"
const getFileName = (filePath) => {
  const lastPart = filePath.split("?")[0].replace(/\\/g, "/").split("/").pop();
  try {
    return decodeURIComponent(lastPart);
  } catch {
    return lastPart; // the name had a broken % sign, so keep it as it is
  }
};

// The database already saves a full link to the file, so we use it as it is
const getFileUrl = (filePath) => filePath;

const isImage = (fileName) => /\.(png|jpe?g|gif|webp)$/i.test(fileName);

// Builds the file part of the preview: the picture (images only) and a bar with the name + Download button
const createAttachment = (filePath) => {
  const fileName = getFileName(filePath);
  const fileUrl = getFileUrl(filePath);

  const wrapper = document.createElement("div");

  if (isImage(fileName)) {
    const image = document.createElement("img");
    image.className = "message__image";
    image.src = fileUrl;
    image.alt = fileName;
    wrapper.append(image);
  }

  const bar = document.createElement("div");
  bar.className = "message__attachment";

  const name = document.createElement("span");
  name.className = "message__file-name";
  name.textContent = fileName;

  const downloadLink = document.createElement("a");
  downloadLink.className = "message__download";
  downloadLink.textContent = "Download";
  downloadLink.href = fileUrl;
  downloadLink.download = fileName; // asks the browser to save the file instead of opening it
  downloadLink.target = "_blank";   // if the browser opens it anyway, do it in a new tab
  downloadLink.rel = "noopener";

  bar.append(createIcon("i-file"), name, downloadLink);
  wrapper.append(bar);
  return wrapper;
};

// Builds one reply: who wrote it, when, the text, and its file (if any)
const createReplyItem = (reply) => {
  const name = getSenderName(reply.sent_by);
  const isMe = reply.sent_by.toLowerCase() === currentUserEmail.toLowerCase();

  const item = document.createElement("article");
  item.className = "reply-item";

  const header = document.createElement("header");
  header.className = "reply-item__header";

  const initials = document.createElement("div");
  initials.className = "reply-item__avatar";
  initials.textContent = name.slice(0, 2).toUpperCase();

  const sender = document.createElement("span");
  sender.className = "reply-item__sender";
  sender.textContent = isMe ? "You" : name;

  const date = document.createElement("time");
  date.className = "reply-item__date";
  date.textContent = formatFullDate(reply.created_at);

  const body = document.createElement("div");
  body.className = "reply-item__body";
  body.textContent = reply.body;

  header.append(initials, sender, date);
  item.append(header, body);

  const filePath = getFilePath(reply); // replies use the same file code as messages
  if (filePath) item.append(createAttachment(filePath));

  return item;
};

// Puts the replies into the box under the open message
const renderReplies = (list) => {
  const repliesBox = readingBody.querySelector(".replies");
  if (!repliesBox || list.length === 0) return;

  const title = document.createElement("h4");
  title.className = "replies__title";
  title.textContent = `${list.length} ${list.length === 1 ? "reply" : "replies"}`;

  repliesBox.replaceChildren(title, ...list.map(createReplyItem));
};

// Asks the server for the replies of one message
const loadReplies = async (message) => {
  if (message.id === undefined) return; // we need the real database id

  try {
    const response = await fetch(`${API_URL}${REPLIES_URL}/${encodeURIComponent(message.id)}`);
    const data = await response.json();

    if (currentMessage !== message) return;       // the user opened another message while we waited
    if (!Array.isArray(data.message)) return;     // the server sent an error instead of a list
    renderReplies(data.message);
  } catch (error) {
    console.log(error);
  }
};

// Fill the template with one message and show it in the preview pane

let previewProfile;


const renderMessage = async (msg) => {
  const view = document.importNode(messageTemplate.content, true); // a fresh copy of the template
  const name = getSenderName(msg.sent_by);
  currentMessage = msg; 

  const dp = await fetch(`http://localhost:8080/auth/profile-picture/${msg.sent_by}`);
  const pp = await dp.json();
  let pic = pp.message;
  let mainImage = pic.profile_picture;
 
  view.querySelector(".message__avatar").src = `http://localhost:8080/profiles/${mainImage}`
  view.querySelector(".message__sender").textContent = name;
  view.querySelector(".message__email").textContent = msg.sent_by;
  view.querySelector(".message__date").textContent = formatFullDate(msg.created_at);
  view.querySelector(".message__subject").textContent = msg.subject || "(no subject)";
  view.querySelector(".message__body").textContent = msg.body;

  // The file: only added when the message has one
  const filePath = getFilePath(msg);
  if (filePath) view.querySelector(".message").append(createAttachment(filePath));

  // An empty box where the replies will appear once they are loaded
  const repliesBox = document.createElement("section");
  repliesBox.className = "replies";
  view.querySelector(".message").append(repliesBox);

  readingBody.replaceChildren(view);
};

const selectCard = (card) => {
  mailList.querySelectorAll(".mail-card.is-active").forEach((el) => el.classList.remove("is-active"));
  card.classList.add("is-active");
  card.classList.remove("is-unread");
  app.classList.add("is-reading-open"); // opens the full-screen preview on mobile

  closeReply(); // a half-written reply belongs to the previous message

  const message = messages.get(card.dataset.id); // look the message up in the Map
  if (message) {
    renderMessage(message);  // show it
    loadReplies(message);    // then load its replies from the server
  }
};

mailList.addEventListener("click", (event) => {
  const starButton = event.target.closest(".star-btn");
  if (starButton) {
    starButton.classList.toggle("is-on");
    return; // don't open the message when only the star was clicked
  }

  const card = event.target.closest(".mail-card");
  if (card) selectCard(card);
});

mailList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const card = event.target.closest(".mail-card");
  if (card) selectCard(card);
});

// Back button inside the reading pane (mobile only)
document.querySelector("[data-reading-close]").addEventListener("click", () => {
  app.classList.remove("is-reading-open");
});

/* ==========================================================
   4. BUILDING THE CARDS
   ========================================================== */

// Makes <svg class="icon ..."><use href="#iconId" /></svg>
const createIcon = (iconId, ...classNames) => {
  const svg = document.createElementNS(SVG_NS, "svg");
  const use = document.createElementNS(SVG_NS, "use");

  svg.classList.add("icon", ...classNames);
  use.setAttribute("href", `#${iconId}`);
  svg.append(use);
  return svg;
};

// "2026-04-14T11:21:00Z"  ->  "Tuesday 11:21 AM"
const formatCardDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
  return `${day} ${time}`;
};

// Builds one <li> with a mail card inside it
const createCard = (msg, index) => {
  // create the elements
  const item = document.createElement("li");
  const article = document.createElement("article");
  const top = document.createElement("div");
  const sender = document.createElement("span");
  const date = document.createElement("time");
  const star = document.createElement("button");
  const subject = document.createElement("h3");
  const preview = document.createElement("p");

  // add their classes
  article.className = "mail-card";
  top.className = "mail-card__top";
  sender.className = "mail-card__sender";
  date.className = "mail-card__time";
  star.className = "star-btn";
  subject.className = "mail-card__title";
  preview.className = "mail-card__preview";

  // add their text
  sender.textContent = getSenderName(msg.sent_by);
  date.textContent = formatCardDate(msg.created_at);
  subject.textContent = msg.subject;
  preview.textContent = msg.body.length > 49 ? `${msg.body.slice(0, 48)}...` : msg.body;

  star.type = "button";
  star.setAttribute("aria-label", "Star");
  star.append(createIcon("i-star"));
  article.tabIndex = 0; // lets the keyboard focus the card (Enter opens it)

  // put them together: sender, paperclip (only if there is a file), date, star
  top.append(sender);
  if (getFilePath(msg)) top.append(createIcon("i-paperclip", "mail-card__attach"));
  top.append(date, star);

  article.append(top, subject, preview);
  item.append(article);

  saveCard(article, msg, index); // save this card's data in the Map
  return item;
};

/* ==========================================================
   5. LOADING A FOLDER (inbox / sent)
   ========================================================== */
const loadFolder = async ({ url, title, updateCount = false }) => {
  try {
    const response = await fetch(`${API_URL}${url}`);
    const data = await response.json();
    const list = data.message;
    console.log(list);
    

    // start fresh: empty list, empty Map, empty preview
    mailList.innerHTML = "";
    messages.clear();
    readingBody.innerHTML = emptyPreview;
    currentMessage = null;
    closeReply();

    listHead.textContent = title;
    listHeadMeta.textContent = `${list.length} Messages unread`;
    if (updateCount) count.textContent = list.length;

    list.forEach((msg, index) => mailList.append(createCard(msg, index)));
  } catch (error) {
    console.log(error);
  }
};

const readInbox = () => loadFolder({ url: "/mail/readMessages", title: "Inbox", updateCount: true });
const readSent = () => loadFolder({ url: "/mail/readSent", title: "Sent" });

inboxButton.addEventListener("click", readInbox);
sentButton.addEventListener("click", readSent);

/* ==========================================================
   6. COMPOSE WINDOW
   ========================================================== */
const openCompose = () => {
  compose.hidden = false;
  compose.classList.remove("is-minimized");
  if (mobileQuery.matches) closeDrawer();
  compose.querySelector("#to").focus();
};

const closeCompose = () => {
  compose.hidden = true;
  compose.classList.remove("is-minimized", "is-expanded");
};

document.querySelector("[data-compose-open]").addEventListener("click", openCompose);

compose.addEventListener("click", (event) => {
  const action = event.target.closest("button");
  if (!action) return;

  if (action.matches("[data-compose-close]")) closeCompose();
  if (action.matches("[data-compose-minimize]")) compose.classList.toggle("is-minimized");
  if (action.matches("[data-compose-expand]")) compose.classList.toggle("is-expanded");
});

/* ==========================================================
   7. ATTACHMENT PREVIEW (compose window)
   When the user picks a file we show its name and size,
   plus a small picture if the file is an image.
   ========================================================== */
const fileInput = document.querySelector("#attachments");
const attachmentBox = compose.querySelector(".compose__attachment");
const attachmentImage = compose.querySelector(".compose__attachment-image");
const attachmentName = compose.querySelector(".compose__attachment-name");
const attachmentSize = compose.querySelector(".compose__attachment-size");
const removeAttachmentButton = compose.querySelector("[data-remove-attachment]");

let previewUrl = null; // a temporary link to the picked image (only lives in this browser tab)

// 2048  ->  "2 KB"      3500000  ->  "3.3 MB"
const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Hide the preview and free the temporary image link
const clearAttachmentPreview = () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;

  attachmentImage.removeAttribute("src");
  attachmentImage.hidden = true;
  attachmentBox.hidden = true;
};

const showAttachmentPreview = () => {
  clearAttachmentPreview(); // remove the old preview first

  const file = fileInput.files[0];
  if (!file) return; // the user opened the picker but cancelled

  attachmentName.textContent = file.name;
  attachmentSize.textContent = formatFileSize(file.size);

  if (file.type.startsWith("image/")) {
    previewUrl = URL.createObjectURL(file); // lets us show the picked image before it is uploaded
    attachmentImage.src = previewUrl;
    attachmentImage.alt = file.name;
    attachmentImage.hidden = false;
  }

  attachmentBox.hidden = false;
};

fileInput.addEventListener("change", showAttachmentPreview);

// The X button: forget the file
removeAttachmentButton.addEventListener("click", () => {
  fileInput.value = "";
  clearAttachmentPreview();
});

// compose.reset() (after sending) and the trash button also clear the preview
compose.addEventListener("reset", clearAttachmentPreview);

/* ==========================================================
   8. REPLYING TO A MESSAGE
   The Reply button opens a form at the bottom of the preview pane.
   It is sent as multipart/form-data, so a file can go with the text.
   ========================================================== */
const REPLY_URL = "/mail/sendReply"; // change this to your reply route

const replyForm = document.querySelector("#reply");
const replyTo = replyForm.querySelector(".reply__to strong");
const replyFileInput = replyForm.querySelector("#replyFile");
const replyFileBox = replyForm.querySelector(".reply__file");
const replyFileName = replyForm.querySelector(".reply__file-name");
const replyFileSize = replyForm.querySelector(".reply__file-size");
const replySendButton = replyForm.querySelector("button[type='submit']");

// Who gets the reply?
// A message someone sent to us -> its sender. 
// A message we sent ourselves  -> the person we sent it to.
const getReplyRecipient = (msg) =>
  msg.sent_by === currentUserEmail && msg.sent_to ? msg.sent_to : msg.sent_by;

const openReply = () => {
  if (!currentMessage) return; // no message is open yet

  if (currentMessage.id === undefined) {
    alert("This message has no id, so a reply can't be saved. Return the id column from your inbox query.");
    return;
  }

  // fill the two hidden fields the backend needs
  replyForm.elements.message_id.value = currentMessage.id;
  replyForm.elements.sent_to.value = getReplyRecipient(currentMessage);
  replyTo.textContent = replyForm.elements.sent_to.value;

  replyForm.hidden = false;
  replyForm.elements.body.focus();
};

const closeReply = () => {
  replyForm.reset(); // clears the text and the chosen file
  replyForm.hidden = true;
};

// Show the chosen file's name and size
replyFileInput.addEventListener("change", () => {
  const file = replyFileInput.files[0];
  replyFileBox.hidden = !file;
  if (!file) return; // the user opened the picker but cancelled

  replyFileName.textContent = file.name;
  replyFileSize.textContent = formatFileSize(file.size);
});

// The form was reset (sent, closed or switched message), so hide the file chip
replyForm.addEventListener("reset", () => {
  replyFileBox.hidden = true;
});

// One listener for the Reply button (it lives outside the form), then one for the buttons inside it
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-reply-open]")) openReply();
});

replyForm.addEventListener("click", (event) => {
  if (event.target.closest("[data-reply-close]")) closeReply();

  if (event.target.closest("[data-reply-remove-file]")) {
    replyFileInput.value = "";
    replyFileBox.hidden = true;
  }
});

replyForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  // The field names in the form (message_id, sent_to, body, attachments) are exactly what the backend reads
  const replyData = new FormData(replyForm);
  if (!replyFileInput.files[0]) replyData.delete("attachments"); // no file picked, so send none

  const repliedTo = currentMessage;  // remember which message this reply belongs to
  replySendButton.disabled = true;   // stops double-clicks while sending

  try {
    const response = await fetch(`${API_URL}${REPLY_URL}`, { method: "POST", body: replyData });
    const result = await response.json();
    console.log(result); 

    if (result.message === "REPLY_SENT_SUCCESSFULLY") {
      alert("reply sent..");
      closeReply();
      loadReplies(repliedTo); // show the new reply right away
    } else {
      alert("The reply could not be sent.");
    }
  } catch (error) {
    console.log(error);
    alert("The reply could not be sent.");
  } finally {
    replySendButton.disabled = false;
  }
});

/* ==========================================================
   9. SENDING AN EMAIL
   ========================================================== */
compose.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  const composeData = new FormData();
  composeData.append("sendTo", document.querySelector("#to").value);
  composeData.append("subject", document.querySelector("#subject").value);
  composeData.append("body", document.querySelector("#body").value);

  // only add the file if the user picked one
  const file = document.querySelector("#attachments").files[0];
  if (file) composeData.append("attachments", file);

  try {
    const response = await fetch(`${API_URL}/mail/sendMessage`, {
      method: "POST",
      body: composeData,
    });
    const result = await response.json();
    console.log(result);

    if (result.message === "MESSAGE_SENT_SUCESSFULLY") {
      alert("message sent..");
      compose.reset();
    }
  } catch (error) {
    console.log(error);
  }
});

/* ==========================================================
   10. START: LOAD THE USER, THEN THE INBOX
   ========================================================== */

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`${API_URL}/auth/user-info`);
    const userInfo = await response.json();
    const dp = await fetch(`http://localhost:8080/auth/profile-picture/${userInfo.userEmail}`);
    const pp = await dp.json();
    let pic = pp.message;
    let mainImage = pic.profile_picture;
    
    currentUserEmail = userInfo.userEmail;
    composeBoxUserName.textContent = userInfo.userEmail;
    profileEmail.textContent = userInfo.userEmail;
    profileName.textContent = userInfo.username;
    avatar.src = `http://localhost:8080/profiles/${mainImage}`;

    readInbox();
  } catch (error) {
    console.log(error);
  }
});

//Delete a message.