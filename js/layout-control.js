$("#sidebar-btn").click(() => {
    $(".sidebar").toggleClass("sidebar_small");
    $(".main-content").toggleClass("main-content_large");
    $(".nav-item").toggleClass("nav-item_hide");
});

/*
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const tabs = document.querySelector('.nav-item');
document.querySelector('#sidebar-btn').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    mainContent.classList.toggle('main-content_large');
    tabs.classList.toggle('nav-item_hide')
}
*/