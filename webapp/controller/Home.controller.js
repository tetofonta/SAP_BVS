function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
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

function getFromApiAsync(res, cb, prams) {
    if (!res.startsWith("/")) res = "/" + res;
    if (!res.endsWith(".php")) res = res + ".php";

    if (prams !== undefined) {
        res += "?";
        Object.keys(prams).forEach(function (e) {
            res += e + "=" + prams[e] + "&";
        });
        res += "foo=foo";
    }
    httpGetAsync((apiHost + res).replace(" ", "%20"), function(data){
    	cb(JSON.parse(data));
    }, prams);
    
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
            	sap.ui.core.BusyIndicator.show(0);
            	var obj = {SQUADRA: oEvent.getSource()._lastValue};
            	getFromApiAsync(getSavedMatches, function(data){
            		oModel.setProperty("/saved", data);
            		
            		getFromApiAsync(getPlayers, function(dt){
            			oModel.setProperty("/players", dt);
		                oModel.getProperty("/players").forEach(function(e){
		                	curPlayers.push({
		                		nome: e.nome,
		                		numero: e.numero
		                	})
		                })
		                $('.showButtons').css('opacity', '1.0', 'important');
		                curTeam = obj.SQUADRA;
                        	sap.ui.core.BusyIndicator.hide();
            		}, obj)
            	}, obj);
            	
                
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
		playerSelect: function(e){
        	sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
        		query:{
        			numero: oModel.getProperty("/players")[e.getSource().sId.split('-')[2]].numero,
        			squadra: curTeam
        		}
        	});
		},
        newMatch: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Game", {
				query: {
					squadra : curTeam,
					giocatori: JSON.stringify(curPlayers)
				}
			});
        },
        
        getReport: function(e){
        	sap.ui.core.UIComponent.getRouterFor(this).navTo("showReport", {
        		query:{
        			id: oModel.getProperty("/saved")[e.getSource().sId.split('-')[2]].id,
        		}
        	});
        }
    });

});