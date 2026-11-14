"use strict";

/* ----------------------------------------------------------
   Element references
   ---------------------------------------------------------- */
const app = document.querySelector("#app");
const mailList = document.querySelector("#mailList");
const compose = document.querySelector("#compose");
const mobileQuery = window.matchMedia("(max-width: 900px)");

/* ----------------------------------------------------------
   Sidebar
   On phones/tablets it slides in as a drawer ("is-sidebar-open").
   On desktop it collapses ("is-sidebar-collapsed").
   ---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   Message list
   Uses event delegation: one listener on the list handles every
   card, including cards added later after you fetch your data.
   ---------------------------------------------------------- */
const selectCard = (card) => {
  mailList.querySelectorAll(".mail-card.is-active").forEach((el) => el.classList.remove("is-active"));
  card.classList.add("is-active");
  card.classList.remove("is-unread");

  // TODO: fetch the full message with card.dataset.id and render it into #readingBody
  app.classList.add("is-reading-open"); // opens the full-screen reading pane on mobile
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

/* ----------------------------------------------------------
   Compose window
   ---------------------------------------------------------- */
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

//my code
//start with displaying the name at the compose box
const composeBoxUserName = document.querySelector(".compose__from strong");
const profileEmail = document.querySelector(".profile__email");
const profileName = document.querySelector(".profile__name");
const avatar = document.querySelector(".avatar");
window.addEventListener("DOMContentLoaded", async ()=>{

  try {
    const getEmailOfUser = await fetch('http://localhost:8080/auth/user-info');
    const userInfo = await getEmailOfUser.json(); 
    //assign their names
    composeBoxUserName.textContent = userInfo.userEmail;
    profileEmail.textContent = userInfo.userEmail;
    profileName.textContent = userInfo.username;
    
    let sc = userInfo.username.split("");
    avatar.textContent = `${sc[0]}${sc[sc.length - 1]}`

    //fetch inbox
    readInbox()

  } catch (error) {
    console.log(error);
  };    
});

//send email 
const form = document.querySelector('#compose');

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  //get elements
  try {
    
  let sendTo = document.querySelector("#to");
  let subject = document.querySelector("#subject");
  let body = document.querySelector("#body");
  let inputFile = document.querySelector("#attachments");
  
  let composeData = new FormData();

  //add their values to the form

  composeData.append("sendTo", sendTo.value);
  composeData.append("subject", subject.value);
  composeData.append("body", body.value);
  composeData.append("attachments", inputFile.files[0]);

  const sendMessage = await fetch(`http://localhost:8080/mail/sendMessage`, {
    method: "POST",
    body: composeData
  });

  let response = await sendMessage.json();
  console.log(response);
  if (response.message == 'MESSAGE_SENT_SUCESSFULLY') {
    alert(`message sent..`)
    form.reset();
  }
  
  } catch (error) {
    console.log(error);
    
  };
});


const listHeadMeta = document.querySelector(".list-head__meta");
const sentButton = document.querySelector('[data-folder="sent"]');
const inboxButton = document.querySelector('[data-folder="inbox"]');
const listHead = document.querySelector(".list-head__title");
const count = document.querySelector('.nav-item__count');

//fetch inbox
  const readInbox = async () => {
  const mailList = document.querySelector("#mailList");
  mailList.classList.add("mail-list");
  //number of mails

  const count = document.querySelector('.nav-item__count')

  try {
    const getInbox = await fetch('http://localhost:8080/mail/readMessages');
    const data = await getInbox.json();
    const inbox = data.message;
    console.log(inbox);
    listHeadMeta.textContent = `${inbox.length} Messages unread`; 
    count.textContent = inbox.length;
    //create all the elements;
    inbox.forEach((msg)=>{
    //create elements
    let main = document.createElement("li")
    let article = document.createElement("article");
    let mailCardTop = document.createElement("div");
    let mailCardSender = document.createElement("span");
    let attachment = document.createElement("svg");
    let date = document.createElement("time");
    let star = document.createElement("button");
    let starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let starUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    let subject = document.createElement("h3");
    let body = document.createElement("p");
    //add their classes
    article.classList.add("mail-card");
    mailCardTop.classList.add("mail-card__top");
    mailCardSender.classList.add("mail-card__sender");
    attachment.classList.add("mail-card__attach");
    date.classList.add("mail-card__time");
    star.classList.add("star-btn");
    subject.classList.add("mail-card__title");
    body.classList.add("mail-card__preview");
    starSvg.classList.add("icon");
    starUse.setAttribute("href", "#i-star");
    //check if the data contains a file.
    //declaring the icon outside so that i can access it outside the if block
    let icon = null;
    if (msg.file_path) {
      icon = document.createElementNS( "http://www.w3.org/2000/svg",  "svg");
      icon.classList.add("icon", "mail-card__attach");
      const use = document.createElementNS( "http://www.w3.org/2000/svg","use" );
      use.setAttribute("href", "#i-paperclip");
      icon.appendChild(use);
      mailCardTop.append(icon);
    } else {
      icon = ''
    }
    //append them
    starSvg.append(starUse);
    star.append(starSvg);
    main.append(article);
    article.append(mailCardTop, subject, body);
    mailCardTop.append(mailCardSender, icon, date, star);
    mailList.append(main);
    //add text contents
    let formatSender = `${msg.sent_by[0].toUpperCase()}${msg.sent_by.slice(1, msg.sent_by.indexOf('@'))}`;
    let timestamp = msg.created_at;
    const wholeDate = new Date(timestamp);
    //time formate
    const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long"
    }).format(wholeDate);

   const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
   }).format(wholeDate);
    mailCardSender.textContent = formatSender;
    //add text content
    attachment.href = '#i-star'
    date.textContent = `${day} ${time}`;
    subject.textContent = msg.subject;
    body.textContent = msg.body.length > 49 ? `${msg.body.slice(0, 48)}...`  : msg.body;
    });
  } catch (error) {
    console.log(error);
  }
};

//add the star logo in js ✅
//fetch sent data ✅
//add attachment pin if the message has a file✅
//preview



//fetch sent messages
const readSent = async () => {
 
  try {
    mailList.innerHTML = ''
    listHead.textContent = 'Sent';
    const getsentMessages = await fetch("http://localhost:8080/mail/readSent");
    const data = await getsentMessages.json();
    const sent = data.message;
    console.log(sent);
    listHeadMeta.textContent = `${sent.length} Messages unread`; 
    //create all the elements;
    sent.forEach((msg)=>{
    //create elements
    let main = document.createElement("li")
    let article = document.createElement("article");
    let mailCardTop = document.createElement("div");
    let mailCardSender = document.createElement("span");
    let attachment = document.createElement("svg");
    let date = document.createElement("time");
    let star = document.createElement("button");
    let starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let starUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    let subject = document.createElement("h3");
    let body = document.createElement("p");
     //check if the data contains a file.
    //declaring the icon outside so that i can access it outside the if block
    let icon = null;
    if (msg.file_path) {
      icon = document.createElementNS( "http://www.w3.org/2000/svg",  "svg");
      icon.classList.add("icon", "mail-card__attach");
      const use = document.createElementNS( "http://www.w3.org/2000/svg","use" );
      use.setAttribute("href", "#i-paperclip");
      icon.appendChild(use);
      mailCardTop.append(icon);
    } else {
      icon = ''
    }
    //add their classes
    article.classList.add("mail-card");
    mailCardTop.classList.add("mail-card__top");
    mailCardSender.classList.add("mail-card__sender");
    attachment.classList.add("mail-card__attach");
    date.classList.add("mail-card__time");
    star.classList.add("star-btn");
    subject.classList.add("mail-card__title");
    body.classList.add("mail-card__preview");
    starSvg.classList.add("icon");
    starUse.setAttribute("href", "#i-star");
    //append them
    starSvg.append(starUse);
    star.append(starSvg);
    main.append(article);
    article.append(mailCardTop, subject, body);
    mailCardTop.append(mailCardSender, icon, date, star);
    mailList.append(main);
    //add text contents
    let formatSender = `${msg.sent_by[0].toUpperCase()}${msg.sent_by.slice(1, msg.sent_by.indexOf('@'))}`;
    let timestamp = msg.created_at;
    const wholeDate = new Date(timestamp);
    //time formate
    const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long"
    }).format(wholeDate);

   const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
   }).format(wholeDate);
    mailCardSender.textContent = formatSender;
    //add text content
    attachment.href = '#i-star'
    date.textContent = `${day} ${time}`;
    subject.textContent = msg.subject;
    body.textContent = msg.body.length > 49 ? `${msg.body.slice(0, 48)}...`  : msg.body;
    });
  } catch (error) {
    console.log(error);
  }
};

//fetch inbox
const readInboxByClick = async () => {
  try {
    mailList.innerHTML = '';
    listHead.textContent = 'Inbox';
    const getsentMessages = await fetch("http://localhost:8080/mail/readMessages");
    const data = await getsentMessages.json();
    console.log(data.message);
    const inbox = data.message;
    listHeadMeta.textContent = `${inbox.length} Messages unread`; 
    count.textContent = inbox.length;
    //create all the elements;
    inbox.forEach((msg)=>{
    //create elements
    let main = document.createElement("li")
    let article = document.createElement("article");
    let mailCardTop = document.createElement("div");
    let mailCardSender = document.createElement("span");
    let attachment = document.createElement("svg");
    let date = document.createElement("time");
    let star = document.createElement("button");
    let starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let starUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    let subject = document.createElement("h3");
    let body = document.createElement("p");
     //check if the data contains a file.
    //declaring the icon outside so that i can access it outside the if block
    let icon = null;
    if (msg.file_path) {
      icon = document.createElementNS( "http://www.w3.org/2000/svg",  "svg");
      icon.classList.add("icon", "mail-card__attach");
      const use = document.createElementNS( "http://www.w3.org/2000/svg","use" );
      use.setAttribute("href", "#i-paperclip");
      icon.appendChild(use);
      mailCardTop.append(icon);
    } else {
      icon = ''
    }
    //add their classes
    article.classList.add("mail-card");
    mailCardTop.classList.add("mail-card__top");
    mailCardSender.classList.add("mail-card__sender");
    attachment.classList.add("mail-card__attach");
    date.classList.add("mail-card__time");
    star.classList.add("star-btn");
    subject.classList.add("mail-card__title");
    body.classList.add("mail-card__preview");
    starSvg.classList.add("icon");
    starUse.setAttribute("href", "#i-star");
    //append them
    starSvg.append(starUse);
    star.append(starSvg);
    main.append(article);
    article.append(mailCardTop, subject, body);
    mailCardTop.append(mailCardSender, icon, date, star);
    mailList.append(main);
    //add text contents
    let formatSender = `${msg.sent_by[0].toUpperCase()}${msg.sent_by.slice(1, msg.sent_by.indexOf('@'))}`;
    let timestamp = msg.created_at;
    const wholeDate = new Date(timestamp);
    //time formate
    const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long"
    }).format(wholeDate);

   const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
   }).format(wholeDate);
    mailCardSender.textContent = formatSender;
    //add text content
    attachment.href = '#i-star'
    date.textContent = `${day} ${time}`;
    subject.textContent = msg.subject;
    body.textContent = msg.body.length > 49 ? `${msg.body.slice(0, 48)}...`  : msg.body;
    });

  } catch (error) {
    console.log(error);
  }
};

inboxButton.addEventListener("click", readInboxByClick);
sentButton.addEventListener("click", readSent);
