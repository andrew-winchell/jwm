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

    let editFeature, highlight, evtGraphic;

    // Weather events feature editing form
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
                    fieldName: "submitter",
                    label: "Enter your name"
                },
            ]
        }
    });

    // Weather event feature creation template
    const eventTemplate = new FeatureTemplates({
        container: "event-placement",
        layers: [evtLyr]
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

    $("#createEvtBtn").on("click", () => {
        let attributes = eventForm.getValues()
        if (Object.keys(attributes).length < 3) {
            alert("Please fill empty fields in form");
            return;
        }
        $("#event-placement").css("display", "block");
    });

    // Listen for the selection on the weather event dropdown
    $("#weather-dropdown").on("calciteSelectChange", (e) => {
        // Send the selected weather event to the eventSelected function
        eventSelected(e.target.value);
    });

    eventTemplate.on("select", (evtTemplate) => {
        let attributes = evtTemplate.template.prototype.attributes;

        // Get the corresponding array index for the unique values symbols
        let i;
        if (attributes.weather_type == "Earthquake") {
            i = 0;
        } else if (attributes.weather_type == "Flood") {
            i = 1;
        } else if (attributes.weather_type == "Hurricane") {
            i = 2;
        } else if (attributes.weather_type == "Tornado") {
            i = 3;
        } else if (attributes.weather_type == "Volcano") {
            i = 4;
        } else if (attributes.weather_type == "Wildfire") {
            i = 5;
        } else if (attributes.weather_type == "Winter Storm") {
            i = 6;
        } else if (attributes.weather_type == "Other") {
            i = 7;
        }
        let symbolUrl = evtTemplate.item.layer.renderer.uniqueValueInfos[i].symbol.url;
        
        unselectFeature();
        $("#viewDiv").css("cursor", "crosshair");
        
        const handler = view.on("click", (e) => {
            handler.remove();
            e.stopPropagation();
            let formValues = eventForm.getValues()
            console.log(formValues)
            eventForm.feature = null;

            if (e.mapPoint) {
                point = e.mapPoint.clone();
                point.z = undefined;
                point.hasZ = false;

                addFeature = new Graphic({
                    geometry: point,
                    attributes: {
                        event_name: formValues.event_name,
                        occurrence: formValues.occurrence,
                        weather_type: attributes.weather_type,
                        submitter: formValues.submitter
                    },
                    symbol: {
                        type: "picture-marker",
                        url: symbolUrl, 
                        width: "20px",
                        height: "20px"
                    }
                });

                view.graphics.add(addFeature);


                const adds = {
                    addFeatures: [addFeature]
                };

                applyEditsToEvents(adds);
                $("#viewDiv").css("cursor", "auto");
            }
        });
    });

    eventForm.on("submit", () => {
        if (editFeature) {
            // Grad attributes from form
            const updated = eventForm.getValues();

            Object.keys(updated).forEach((name) => {
                editFeature.attributes[name] = updated[name];
            });

            // Setup the applyEdits parameter with updates
            const edits = {
                updateFeatures: [editFeature]
            };

            applyEditsToEvents(edits);
            $("#viewDiv").css("cursor", "auto");
        }
    });

    // Populate the Weather Events dropdown list
    function populateEventsDropdown(layer) {
        console.log("dropdown called");
        // Clear the options from the events dropdown except for the default first option
        $("#weather-dropdown calcite-option:not(:first)").remove();

        // Create a layer query on the events layer that returns everything
        let query = layer.createQuery();
        query.where = "1=1"; //change to all open events
        query.outFields = ["event_name"];
        layer.queryFeatures(query)
            .then((response) => {
                // Create dropdown items for each event in the events layer
                for(let feature of response.features) {
                    $("#weather-default").after(
                        '<calcite-option>' + feature.attributes.event_name + '</calcite-option>'
                    );
                };

                // Add New Event option after the default option and before the existing events
                $("#weather-default").after(
                    '<calcite-option>New Event</calcite-option>'
                );
            });
    }

    function eventSelected(selection) {
        // Default weather option
        if (selection == "Select Weather Event") {
            $("#event-attributes").css("display", "none");
            $("#event-placement").css("display", "none");
            $("#createEvtBtn").css("display", "none");
        }
        // New Event will prompt user to place a new weather event on the map
        else if (selection == "New Event") {
            $("#event-attributes").css("display", "block");
            $("#event-placement").css("display", "none");
            $("#createEvtBtn").css("display", "block");
        }
        // An existing weather event has been selected
        else {
            $("#event-placement").css("display", "none");
            $("#event-attributes").css("display", "block");
        };
    }

    // Call FeatureLayer.applyEdits() with specified params.
    function applyEditsToEvents(params) {
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
            selectEventFeature(objectId);
            $("#event-attributes").css("display", "block");
            $("#event-placement").css("display", "none");
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
                    $("#weather-dropdown").val(editFeature.attributes.event_name).change();
                }
            });
    }

    view.on("click", (event) => {
        unselectFeature();
        if ($("#viewDiv").css("cursor") == "auto") {
            view.hitTest(event)
                .then((response) => {
                    if (response.results.length == 0) {
                        console.log("No Hit");
                    } else if (
                        response.results[0].graphic &&
                        response.results[0].graphic.layer.id == "Weather Event"
                    ) {
                        selectEventFeature(
                            response.results[0].graphic.attributes["OBJECTID"]
                        )
                    }
                })
        }
    })
    
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