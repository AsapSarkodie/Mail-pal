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
//change page Name and fetch data later
pages.forEach((page)=>{
    page.addEventListener('click', ()=>{
        pageName.textContent = page.textContent;
    })
});

//date
let currentDate = new Date();
let month = currentDate.getUTCMonth();
let day = currentDate.getDay();
let year = currentDate.getFullYear();

date.textContent = `${month}, ${day}, ${year}`

//display compose box
composeBtn.addEventListener("click", ()=>{
   composeBox.style.display = "flex";
});

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

