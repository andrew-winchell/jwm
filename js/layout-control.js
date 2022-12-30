$("#sidebar-btn").click(() => {
    $(".sidebar").toggleClass("sidebar_small");
    $(".main-content").toggleClass("main-content_large");
    $(".nav-item").toggleClass("nav-item_hide");
    $(".tabs").toggleClass("tabs_hide")
});

$(".tabs button").click((e) => {
    let arr = ["#data-panel", "#event-panel", "#iwa-panel", "#report-panel"];
    let category = e.target.id.split("_")[0];
    let panel = "#" + category + "-panel";
    let index = arr.indexOf(panel);
    arr.splice(index, 1);

    for(let a of arr) {
        console.log(a);
        $(a).css("display", "none");
    };
    
});

$("#data-tab").click(() => {
    // Panel visibility
    $("#data-panel").css("display", "block");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "none");
    // Tab appearance
    $("#data-tab").addClass("tab-active");
    $("#event-tab").removeClass("tab-active");
    $("#iwa-tab").removeClass("tab-active");
    $("#report-tab").removeClass("tab-active");
});

$("#event-tab").click(() => {
    $("#data-panel").css("display", "none");
    $("#event-panel").css("display", "block");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "none");
    // Tab appearance
    $("#data-tab").removeClass("tab-active");
    $("#event-tab").addClass("tab-active");
    $("#iwa-tab").removeClass("tab-active");
    $("#report-tab").removeClass("tab-active");
});

$("#iwa-tab").click(() => {
    $("#data-panel").css("display", "none");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "block");
    $("#report-panel").css("display", "none");
    // Tab appearance
    $("#data-tab").removeClass("tab-active");
    $("#event-tab").removeClass("tab-active");
    $("#iwa-tab").addClass("tab-active");
    $("#report-tab").removeClass("tab-active");
});

$("#report-tab").click(() => {
    $("#home-panel").css("display", "none");
    $("#event-panel").css("display", "none");
    $("#iwa-panel").css("display", "none");
    $("#report-panel").css("display", "block");
    // Tab appearance
    $("#data-tab").removeClass("tab-active");
    $("#event-tab").removeClass("tab-active");
    $("#iwa-tab").removeClass("tab-active");
    $("#report-tab").addClass("tab-active");
});