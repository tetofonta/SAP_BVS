function refresh(){
	sap.ui.core.BusyIndicator.show(0);
	var obj = {SQUADRA: curTeam};
	getFromApiAsync(getSavedMatches, function(data){
	oModel.setProperty("/saved", data);
	getFromApiAsync(getPlayers, function(dt){
	oModel.setProperty("/players", dt);
	oModel.getProperty("/players").forEach(function(e){
		e.foto = e.foto.replaceAll(' ', '+');
		curPlayers.push({
			nome: e.nome,
				numero: e.numero
		});
	});
	curTeam = obj.SQUADRA;
	sap.ui.core.BusyIndicator.hide();
    }, obj);
    }, obj);
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

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
var deletePlayer = "deletePlayer";
var deleteTeam = "deleteTeam";
var deleteMatch = "deleteMatch";


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
    //console.log(res)
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
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("Home").attachMatched(this._onRouteMatched, this);
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
            	//console.log(this.getView().byId("sqList").getSelectedKey());
            	
            	sap.ui.core.BusyIndicator.show(0);
            	var obj = {SQUADRA: oEvent.getSource()._lastValue};
            	getFromApiAsync(getSavedMatches, function(data){
            		oModel.setProperty("/saved", data);
            		
            		getFromApiAsync(getPlayers, function(dt){
            			oModel.setProperty("/players", dt);
		                oModel.getProperty("/players").forEach(function(e){
		                	e.foto = e.foto.replaceAll(' ', '+');
		                	curPlayers.push({
		                		nome: e.nome,
		                		numero: e.numero
		                	});
		                });
		                $('.showButtons').css('opacity', '1.0', 'important');
		                curTeam = obj.SQUADRA;
                        	sap.ui.core.BusyIndicator.hide();
            		}, obj);
            	}, obj);
            	
                
            } else {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
        		query:{
	        		numero: "null",
	        		squadra: "null"
	        	}
	        	});
            }
        },

        deleteMatch: function (e) {
            getFromApi(deleteMatch, {
		        ID: e.getParameter("listItem").mProperties.info.split(': ')[1]
			});
			refresh();
        },
		deleteTeam: function () {
            getFromApi(deleteTeam, {
		        SQUADRA: this.getView().byId("sqList").getSelectedKey()
			});
			var squadre = getFromApi(getTeams);
			squadre.push({squadra: "+++ Aggiungi squadra +++"});
		    oModel = new JSONModel({
				saved: [],
				players: [],
				playersExport: [],
				squadre: squadre
			}, true);
			this.getView().setModel(oModel);
			refresh();
        },
        deletePlayer: function (oEvent) {
            getFromApi(deletePlayer, {
		        NUMERO: oEvent.getParameter("listItem").mProperties.description,
		        SQUADRA: curTeam
			});
			refresh();
        },
        addPlayer: function(){
        	sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
        		query:{
        			numero: "null",
        			squadra: curTeam
        		}
        	});
        },
		playerSelect: function(e){
        	sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
        		query:{
        			numero: e.getSource().mProperties.description,
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

        _onRouteMatched: function (oEvent) {
            var oArgs, oQuery;
            oArgs = oEvent.getParameter("arguments");
            oQuery = oArgs["?query"];
            if (oQuery){
            	if(oQuery.refreshTeam === "true"){
            		//console.log("refresh");
	            	refresh();
            	}
            	if(oQuery.newTeam === "true"){
            		var squadre = getFromApi(getTeams);
					squadre.push({squadra: "+++ Aggiungi squadra +++"});
		            oModel = new JSONModel({
		                saved: [],
		                players: [],
		                playersExport: [],
		                squadre: squadre
		            }, true);
		            this.getView().setModel(oModel);
		            this.getView().byId("sqList").setSelectedKey(oQuery.newTeamName);
		            refresh();
            	}
            }
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