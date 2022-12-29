$("#sidebar-btn").click(() => {
    $(".sidebar").toggleClass("sidebar_small");
    $(".main-content").toggleClass("main-content_large");
    $(".nav-item").toggleClass("nav-item_hide");
});