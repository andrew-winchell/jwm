require([
    // ArcGIS JS API
    "esri/config",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/WebScene",
    "esri/views/SceneView",
    
    // Widgets
    "esri/widgets/Home",
    "esri/widgets/Search",

    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",

    // Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    // Dojo
    "dojo/domReady!"
], function(esriConfig, OAuthInfo, esriId, WebScene, SceneView, Home, Search, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    // OAuth certification process
    // Required to access secure content from AGOL
    const info = new OAuthInfo({
        appId: "JNx0uL2LhYwV5Fro",
        portalUrl: "https://faagis.maps.arcgis.com",
        authNamespace: "portal_oauth_inline",
        flowtype: "auto",
        popup: false
    });

    esriId.registerOAuthInfos([info]);
    esriId.getCredential(info.portalUrl + "/sharing");
    esriId.checkSignInStatus(info.portalUrl + "/sharing")
        .then(() => {
            console.log("Sign In Successful.")
        });
    
    // Construct a new web scene using satellite imagery and elevation layer
    const map = new WebScene({
        basemap: "satellite",
        ground: "world-elevation"
    });

    const scene = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: {
                x: -97,
                y: 10,
                z: 3500000
            },
            tilt: 35
        }
    });

    // Allow popup to be docked
    scene.popup.dockEnabled = true;

    // Options for docking popup
    scene.popup.dockOptions = {
        buttonEnabled: false,   //do not allow user to decide on when docking occurs
        breakpoint: {   //set when screen is smaller than w*h, popup will automatically dock
            width: 5000,    //default to always dock
            height: 5000
        }
    };


})