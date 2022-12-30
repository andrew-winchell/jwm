$("#sidebar-btn").click(() => {
    $(".sidebar").toggleClass("sidebar_small");
    $(".main-content").toggleClass("main-content_large");
    $(".nav-item").toggleClass("nav-item_hide");
    $(".tabs").toggleClass("tabs_hide")
});

$("#data-tab").click(() => {
    $("#home-panel").css("display", "block");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "none");
});

$("#event-tab").click(() => {
    $("#home-panel").css("display", "none");
    $("#event-panel").css("display", "block");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "none");
});

$("#iwa-tab").click(() => {
    $("#home-panel").css("display", "none");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "block");
    $("#report-panel").css("display", "none");
});

$("#report-tab").click(() => {
    $("#home-panel").css("display", "none");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "block");
});