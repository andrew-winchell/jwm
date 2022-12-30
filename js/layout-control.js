$("#sidebar-btn").click(() => {
    $(".sidebar").toggleClass("sidebar_small");
    $(".main-content").toggleClass("main-content_large");
    $(".nav-item").toggleClass("nav-item_hide");
    $(".tabs").toggleClass("tabs_hide")
});

$("#data-tab").click(() => {
    // Panel visibility
    $("#data-panel").css("display", "block");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "none");
    // Tab appearance
    $("#data-tab").addClass("active");
    $("#event-tab").removeClass("active");
    $("#iwa-tab").removeClass("active");
    $("#report-tab").removeClass("active");
});

$("#event-tab").click(() => {
    $("#data-panel").css("display", "none");
    $("#event-panel").css("display", "block");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "none");
    // Tab appearance
    $("#data-tab").removeClass("active");
    $("#event-tab").addClass("active");
    $("#iwa-tab").removeClass("active");
    $("#report-tab").removeClass("active");
});

$("#iwa-tab").click(() => {
    $("#data-panel").css("display", "none");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "block");
    $("#report-panel").css("display", "none");
    // Tab appearance
    $("#data-tab").removeClass("active");
    $("#event-tab").removeClass("active");
    $("#iwa-tab").addClass("active");
    $("#report-tab").removeClass("active");
});

$("#report-tab").click(() => {
    $("#home-panel").css("display", "none");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "block");
    // Tab appearance
    $("#data-tab").removeClass("active");
    $("#event-tab").removeClass("active");
    $("#iwa-tab").removeClass("active");
    $("#report-tab").addClass("active");
});