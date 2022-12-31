require([
    // ArcGIS JS API
    "esri/config",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
    
    // Widgets
    "esri/widgets/Home",
    "esri/widgets/Search",
    "esri/widgets/LayerList",
    "esri/widgets/FeatureForm",
    "esri/widgets/FeatureTemplates",

    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",

    // Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    // Dojo
    "dojo/domReady!"
], function(esriConfig, OAuthInfo, esriId, Map, MapView, FeatureLayer, Graphic, Home,
    Search, LayerList, FeatureForm, FeatureTemplates, Collapse, Dropdown, CalciteMaps,
    CalciteMapArcGISSupport){

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
    const evtLyr = new FeatureLayer({
        url: "https://services3.arcgis.com/geBQ3ULfATqBs2UF/arcgis/rest/services/jcat_weather_event/FeatureServer/0",
        outFields: ["*"],
        id: "Weather Event"
    });
    const iwaLyr = new FeatureLayer({
        url: "https://services3.arcgis.com/geBQ3ULfATqBs2UF/arcgis/rest/services/IWA/FeatureServer/0",
        outFields: ["*"],
        id: "IWA"
    });
    
    // Construct a new web scene using satellite imagery and elevation layer
    const map = new Map({
        basemap: "streets-vector",
        layers: [ethqkePntLyr, fireBndryLyr, firePntLyr, evtLyr, iwaLyr]
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
            container: "sb-layers",
            view: view
        });
    });

    let editFeature, highlight, evtGraphic;

    const eventForm = new FeatureForm({
        view: view,
        container: "event-attributes",
        layer: evtLyr,
        feature: evtGraphic,
        formTemplate: {
            title: "Enter Weather Event Information",
            elements: [
                {
                    type: "field",
                    fieldName: "event_name",
                    label: "Enter the name of the weather event or system"
                },
                {
                    type: "field",
                    fieldName: "occurrence",
                    label: "Date the event occurred",
                },
                {
                    type: "field",
                    fieldName: "weather_type",
                    label: "Select the weather type"
                },
                {
                    type: "field",
                    fieldName: "submitter",
                    label: "Enter your name"
                },
            ]
        }
    });

    const eventTemplate = new FeatureTemplates({
        container: "event-placement",
        layers: [evtLyr]
    });

    eventTemplate.on("select", (evtTemplate) => {
        console.log(evtTemplate.template.prototype.attributes);
        $("#viewDiv").css("cursor", "crosshair");
        console.log(eventForm.formTemplate.elements[2], eventForm.formTemplate.elements[2].value())
    })

    // Remove the feature highlight and remove attributes
    // from the feature form.
    function unselectFeature() {
      if (highlight) {
        highlight.remove();
      }
    }

    function selectEventFeature(objectId) {
        evtLyr
            .queryFeatures({
                objectIds: [objectId],
                outFields: ["*"],
                returnGeometry: true
            })
            .then((res) => {
                if (res.features.length > 0) {
                    editFeature = res.features[0];
                    eventForm.feature = editFeature;
                    view.whenLayerView(editFeature.layer).then((layerView) => {
                        highlight = layerview.highlight(editFeature);
                    });
                }
            });
    }

    const iwaForm = new FeatureForm({
        view: view,
        container: "iwa-attributes",
        layer: iwaLyr,
        formTemplate: {
            title: "Enter IWA Information",
            elements: [
                {
                    type: "field",
                    fieldName: "parent_event",
                    label: "Related Weather Event"
                }
            ]
        }
    });

    const iwaTemplate = new FeatureTemplates({
        container: "iwa-placement",
        layers: [iwaLyr]
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