$("#sidebar-btn").click(() => {
    $(".sidebar").toggleClass("sidebar_small");
    $(".main-content").toggleClass("main-content_large");
    $(".nav-item").toggleClass("nav-item_hide");
    $(".tabs").toggleClass("tabs_hide")
});

$(".tabs button").click((e) => {
    let arr = ["#data-panel", "#event-panel", "#iwa-panel", "#report-panel"];
    console.log(e.target.id, e.target.id.split("-"))
    let category = e.target.id.split("-")[0];
    let panel = "#" + category + "-panel";
    let index = arr.indexOf(panel);
    console.log(category, panel, index);
    arr.splice(index, 1);

    $(panel).css("display", "block");

    for(let a of arr) {
        console.log(a);
        $(a).css("display", "none");
    };
    
});