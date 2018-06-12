function httpGet(theUrl) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

let getTeams = "getTeams";
let getSavedMatches = "getSavedMatches";
let getPlayers = "getPlayers";


let apiHost = "http://cors.io/?http://bettervolleyscouting.altervista.org";

function getFromApi(res, prams) {
    if (!res.startsWith("/")) res = "/" + res;
    if (!res.endsWith(".php")) res = res + ".php";

    if (prams !== undefined) {
        res += "?";
        Object.keys(prams).forEach(function (e) {
            res += e + "=" + prams[e] + "&";
        });
        res += "foo=foo";
    }
    return JSON.parse(httpGet((apiHost + res).replace(" ", "%20")));
}

let oModel = {};

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("BVS.controller.Home", {

        onInit: function () {
            oModel = new JSONModel({
                saved: [],
                players: [],
                squadre: [...getFromApi(getTeams), {squadra: "+++ Aggiungi squadra +++"}]
            }, true);
            this.getView().setModel(oModel);
        },

        loadTeam: function (oEvent) {
            if (oEvent.getSource()._lastValue !== "+++ Aggiungi squadra +++") {
                oModel.setProperty("/saved", getFromApi(getSavedMatches, {SQUADRA: oEvent.getSource()._lastValue}));
                oModel.setProperty("/players", getFromApi(getPlayers, {SQUADRA: oEvent.getSource()._lastValue}));
                document.getElementsByClassName("footer")[0].style.opacity = "1.0 !important";
            } else {
                //TODO: aggiungi squadra
            }
        },

        deleteMatch: function () {
            //TODO
        },

        deletePlayer: function () {
            //TODO
        },

        newMatch: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Game");
        }
    });

});