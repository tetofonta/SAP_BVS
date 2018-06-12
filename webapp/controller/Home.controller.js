function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

var getTeams = "getTeams";
var getSavedMatches = "getSavedMatches";
var getPlayers = "getPlayers";


var apiHost = "https://cors.io/?http://bettervolleyscouting.altervista.org";

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

var oModel = {};
var curTeam = "";
var curPlayers = [];


sap.ui.define([
	"jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel'
], function (JQuery, Controller, JSONModel) {
    "use strict";

    return Controller.extend("BVS.controller.Home", {
        onInit: function () {
			var squadre = getFromApi(getTeams);
			squadre.push({squadra: "+++ Aggiungi squadra +++"});
            oModel = new JSONModel({
                saved: [],
                players: [],
                playersExport: [],
                squadre: squadre
            }, true);
            this.getView().setModel(oModel);
        },

        loadTeam: function (oEvent) {
            if (oEvent.getSource()._lastValue !== "+++ Aggiungi squadra +++") {
                oModel.setProperty("/saved", getFromApi(getSavedMatches, {SQUADRA: oEvent.getSource()._lastValue}));
                oModel.setProperty("/players", getFromApi(getPlayers, {SQUADRA: oEvent.getSource()._lastValue}));
                oModel.getProperty("/players").forEach(function(e){
                	curPlayers.push({
                		nome: e.nome,
                		numero: e.numero
                	})
                })
                $('.showButtons').css('opacity', '1.0', 'important');
                curTeam = oEvent.getSource()._lastValue;
            } else {
                //TODO: aggiungi squadra
            }
        },

        devareMatch: function () {
            //TODO
        },

        devarePlayer: function () {
            //TODO
        },

        newMatch: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Game", {
				query: {
					squadra : curTeam,
					giocatori: JSON.stringify(curPlayers)
				}
			});
        }
    });

});