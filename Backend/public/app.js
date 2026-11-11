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
  } catch (error) {
    console.log(error);
  };    
});

//send email 
const form = document.querySelector('#compose');

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  //get elements
  let sendTo = document.querySelector("#to");
  let subject = document.querySelector("#subject");
  let body = document.querySelector("#body");
  let inputFile = document.querySelector("#attachments");
  
  let composeData = new FormData();

  //add their values to the form

  composeData.append("sendTo", sendTo.value);
  composeData.append("subject", subject.value);
  composeData.append("body", body.value);
  for (const file of inputFile.files) {
    composeData.append("file", file)
  };

  console.log(composeData);
  
  
  
});