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
        // Call the populateEventsDropdown function
        populateEventsDropdown(evtLyr);

        // Esri layers list widget
        const layerList = new LayerList({
            container: "sb-layers",
            view: view
        });
    });

    function populateEventsDropdown(layer) {
        $("#weather-dropdown calcite-option:not(:first)").remove();
        let query = layer.createQuery();
        query.where = "1=1";
        query.outFields = ["event_name"];
        layer.queryFeatures(query)
            .then((response) => {
                //let sortFeatures = response.features.reverse();
                for(let feature of response.features) {
                    $("#weather-default").after(
                        '<calcite-option>' + feature.attributes.event_name + '</calcite-option>'
                    );
                };

                $("#weather-default").after(
                    '<calcite-option>New Event</calcite-option>'
                );
            });
    }

    // Listen for the selection on the weather event dropdown
    $("#weather-dropdown").on("calciteSelectChange", (e) => {
        // Send the selected weather event to the eventSelected function
        eventSelected(e.target.value);
    })

    function eventSelected(selection) {
        console.log(selection);
        // Default weather option
        if (selection == "Select Weather Event") {
            $("#event-placement").css("display", "none");
            $("#event-attributes").css("display", "none");
            $("#createEvtBtn").css("display", "none");
        }
        // New Event will prompt user to place a new weather event on the map
        else if (selection == "New Event") {
            $("#event-placement").css("display", "block");
            $("#event-attributes").css("display", "none");
        }
        // An existing weather event has been selected
        else {
            $("#event-placement").css("display", "none");
            $("#event-attributes").css("display", "block");
        };
    }

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
                    label: "Enter the name of the weather system"
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
        let attributes = evtTemplate.template.prototype.attributes;
        console.log(attributes);
        unselectFeature();
        $("#viewDiv").css("cursor", "crosshair");
        
        const handler = view.on("click", (e) => {
            handler.remove();
            e.stopPropagation();
            eventForm.feature = null;

            if (e.mapPoint) {
                point = e.mapPoint.clone();
                point.z = undefined;
                point.hasZ = false;

                console.log(eventForm);
                addFeature = new Graphic({
                    geometry: point,
                    attributes: {
                        weather_type: attributes.weather_type,
                    }
                });

                const adds = {
                    addFeatures: [addFeature]
                };
                applyEditsToIncidents(adds);
                $("#viewDiv").css("cursor", "auto");
            }
        })
    })

    // Call FeatureLayer.applyEdits() with specified params.
    function applyEditsToIncidents(params) {
      evtLyr
        .applyEdits(params)
        .then((editsResult) => {
          // Get the objectId of the newly added feature.
          // Call selectFeature function to highlight the new feature.
          if (
            editsResult.addFeatureResults.length > 0 ||
            editsResult.updateFeatureResults.length > 0
          ) {
            unselectFeature();
            let objectId;
            if (editsResult.addFeatureResults.length > 0) {
              objectId = editsResult.addFeatureResults[0].objectId;
            } else {
              eventForm.feature = null;
              objectId = editsResult.updateFeatureResults[0].objectId;
            }
          }
        })
        .catch((error) => {
          console.log("error = ", error);
        });
    }

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