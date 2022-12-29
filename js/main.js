require([
    // ArcGIS JS API
    "esri/config",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    
    // Widgets
    "esri/widgets/Home",
    "esri/widgets/Search",
    "esri/widgets/LayerList",

    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",

    // Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    // Dojo
    "dojo/domReady!"
], function(esriConfig, OAuthInfo, esriId, Map, MapView, FeatureLayer, Home, Search, LayerList, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

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

    // Add default weather event layers
    const ethqkePntLyr = new FeatureLayer({
        url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USGS_Seismic_Data_v1/FeatureServer/0",
    });
    const firePntLyr = new FeatureLayer({
        url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/0",
    });
    const fireBndryLyr = new FeatureLayer({
        url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/1",
    });
    
    // Construct a new web scene using satellite imagery and elevation layer
    const map = new Map({
        basemap: "streets-vector",
        layers: [ethqkePntLyr, fireBndryLyr, firePntLyr]
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 4,
        center: [-97, 39]
    });

    // Esri home widget
    const homeBtn = new Home({
        view: view
    })

    // Add home widget to ui
    view.ui.add({
        component: homeBtn,
        position: "top-left",
        index: 0
    });

    // Wait for view to finish loading
    view.when(() => {
        // Esri layers list widget
        const layerList = new LayerList({
            container: "sidebar",
            view: view
        });
    });

    // Search widget - add to navbar
    const searchWidget = new Search({
        container: "searchWidgetDiv",
        view: view,
        includeDefaultSources: true
    });

    // Expanding action on search widget
    // Built into library from calcite-maps
    CalciteMapArcGISSupport.setSearchExpandEvents(searchWidget);

    // Trigger actions for search widget after a search is completed
    searchWidget.on("search-complete", (e) => {
        console.log("Search Complete");
    });

    // Allow popup to be docked
    view.popup.dockEnabled = true;

    // Options for docking popup
    view.popup.dockOptions = {
        buttonEnabled: false,   //do not allow user to decide on when docking occurs
        breakpoint: {   //set when screen is smaller than w*h, popup will automatically dock
            width: 5000,    //default to always dock
            height: 5000
        }
    };



})