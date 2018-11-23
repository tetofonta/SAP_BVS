function refresh(team) {
    sap.ui.core.BusyIndicator.show(0);
    var obj = {SQUADRA: team};
    getFromApiAsync(getSavedMatches, function (data) {
        oModel.setProperty("/saved", data);
        getFromApiAsync(getPlayers, function (dt) {
            oModel.setProperty("/players", dt);
            curPlayers = [];
            oModel.getProperty("/players").forEach(function (e) {
                e.foto = e.foto.replaceAll(' ', '+');
                curPlayers.push({
                    nome: e.nome,
                    numero: e.numero
                });
            });
            curTeam = obj.SQUADRA;
            $('.showButtons').css('opacity', '1.0', 'important');
            sap.ui.core.BusyIndicator.hide();
        }, obj);
    }, obj);
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
var mthis;
var getTeams = "getTeams";
var getSavedMatches = "getSavedMatches";
var getPlayers = "getPlayers";
var deletePlayer = "deletePlayer";
var deleteTeam = "deleteTeam";
var deleteMatch = "deleteMatch";
var editTeam = "editTeam";


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
    httpGetAsync((apiHost + res).replace(" ", "%20"), function (data) {
        cb(JSON.parse(data));
    }, prams);

}

var oModel = {};
var curTeam = "";
var curPlayers = [];
var user = "";
var allenatorePic;
var logoPic;
var allenatoreField;
var campionatoField;
    
sap.ui.define([
    "jquery.sap.global",
    'sap/m/MessageToast',
    'sap/m/VBox',
    'sap/m/HBox',
    'sap/m/Label',
    'sap/m/TextArea',
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/Text',
    'sap/m/Image',
    "sap/ui/core/HTML",
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel'
], function (JQuery, MessageToast,VBox,HBox, Label, TextArea, Button, Dialog, Text,Image, HTML, Controller, JSONModel) {
    "use strict";

    return Controller.extend("BVS.controller.Home", {
        onInit: function () {
        	document.body.addEventListener("touchstart", function() {}, false);
        	document.body.addEventListener("touchend", function() {}, false);
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("Home").attachMatched(this._onRouteMatched, this);
        },
		
        loadTeam: function (oEvent) {
			this.getView().byId("editSquadraButton").setEnabled(true);
            sap.ui.core.BusyIndicator.show(0);
            var obj = {SQUADRA: oEvent.getSource()._lastValue};
            
            this.getView().byId("allenatoreList").setTitle("Zambonardi Roberto");
            this.getView().byId("allenatoreList").setIcon("https://i.imgur.com/klXcexk.jpg");
            this.getView().byId("allenatoreList").setVisible(true);
            
            getFromApiAsync(getSavedMatches, function (data) {
                oModel.setProperty("/saved", data);
                //Carica logo team
				oModel.getProperty("/saved").forEach(function (e) {
					e.logoTeam = "https://i.imgur.com/4EuXmd5.jpg";
				});
                getFromApiAsync(getPlayers, function (dt) {
                    oModel.setProperty("/players", dt);
                    curPlayers = [];
                    oModel.getProperty("/players").forEach(function (e) {
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
        },

        addTeam: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
                query: {
                    numero: "null",
                    squadra: "null",
                    username: user
                }
            });
        },
        editTeam: function () {
        	
            var dialog = new Dialog({
				title: 'Conferma',
				type: 'Message',
				content: [
					new VBox({
						items: [
							new Label({ text: 'Nome della squadra', labelFor: 'submitNewName'})
					]
					}),
					new TextArea('submitNewName', {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();
						},
						width: '100%',
						enabled: false,
						rows: 1,
						value: curTeam
					}),
					new HBox({
						items: [
							new VBox({
								items: [
									new Label({text: "Foto allenatore"}),
									new Image('allenatore', {src: "https://i.imgur.com/oUsxIhd.png", width:"150px", height:"150px"}),
									new HTML({content: '<input id="inFileAllenatore" type="file" accept="image/gif, image/jpeg, image/png" onchange="readURL(this, \'__image2\', \'#__component0---home--allenatore\', 0);" />'})
								], alignItems:"Center", justifyContent:"Center"
							}),
							new VBox({
								items: [
									new Label({text: "Logo squadra"}),
									new Image('logoSelection', {src: "https://i.imgur.com/oUsxIhd.png", width:"150px", height:"150px"}),
									new HTML({content: '<input id="inFileLogo" type="file" accept="image/gif, image/jpeg, image/png" onchange="readURL(this, \'__image2\', \'#__component0---home--logoSelection\', 1);" />'})
								]
							})
						]
					}),
					new VBox({
						items: [
							new Label({ text: 'Nome e cognome allenatore', labelFor: 'submitAllenatore'})
					]
					}),
					new TextArea('submitAllenatore', {width: '100%', rows: 1})
				],
				beginButton: new Button({
					text: 'Conferma',
					press: function () {
						var ret = getFromApi(editTeam, {
							NOME: curTeam,
							FOTOALLENATORE: sap.ui.getCore().byId('allenatore').getSrc(),
							LOGO: sap.ui.getCore().byId('logoSelection').getSrc(),
							NOMEALLENATORE: sap.ui.getCore().byId('submitAllenatore').getValue()
						});
						
						if(ret){
							MessageToast.show("Nome modificato correttamente");
						}else{
							MessageToast.show("Impossibile modificare");
							return;
						}
						
						dialog.close();
						setTimeout(function(){window.location.reload()}, 1000);
					}
				}),
				endButton: new Button({
					text: 'Annulla',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			
			dialog.open();
        },

        deleteMatch: function (e) {
            var idMatch = e.getParameter("listItem").mProperties.info.split(': ')[1];
            var dialog = new Dialog({
                title: 'Conferma',
                type: 'Message',
                content: new Text({text: 'Sei sicuro di voler eliminare la partita ' + e.getParameter("listItem").mProperties.title + '?'}),
                beginButton: new Button({
                    text: 'Conferma',
                    press: function () {
                        getFromApi(deleteMatch, {
                            ID: idMatch
                        });
                        refresh(curTeam);
                        dialog.close();
                    }
                }),
                endButton: new Button({
                    text: 'Annulla',
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },
        deleteTeam: function () {
            var mthis = this;
            var dialog = new Dialog({
                title: 'Conferma',
                type: 'Message',
                content: new Text({text: 'Sei sicuro di voler eliminare la squadra ' + mthis.getView().byId("sqList").getSelectedKey() + '?'}),
                beginButton: new Button({
                    text: 'Conferma',
                    press: function () {
                        getFromApi(deleteTeam, {
                            SQUADRA: mthis.getView().byId("sqList").getSelectedKey()
                        });
                        var squadre = getFromApi(getTeams);
                        
                        
                        oModel = new JSONModel({
                            saved: [],
                            players: [],
                            playersExport: [],
                            squadre: squadre
                        }, true);
                        mthis.getView().setModel(oModel);
                        refresh(squadre[0].squadra);
                        dialog.close();
                    }
                }),
                endButton: new Button({
                    text: 'Annulla',
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },
        deletePlayer: function (oEvent) {
            var nP = oEvent.getParameter("listItem").mProperties.description;
            var dialog = new Dialog({
                title: 'Conferma',
                type: 'Message',
                content: new Text({text: 'Sei sicuro di voler eliminare il giocatore ' + oEvent.getParameter("listItem").mProperties.title + ', Numero: ' + nP + '?'}),
                beginButton: new Button({
                    text: 'Conferma',
                    press: function () {
                        getFromApi(deletePlayer, {
                            NUMERO: nP,
                            SQUADRA: curTeam
                        });
                        refresh(curTeam);
                        dialog.close();
                    }
                }),
                endButton: new Button({
                    text: 'Annulla',
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },
        addPlayer: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
                query: {
                    numero: "null",
                    squadra: curTeam,
                    username: user
                }
            });
        },
        playerSelect: function (e) {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Player", {
                query: {
                    numero: e.getSource().mProperties.description,
                    squadra: curTeam,
                    username: user
                }
            });
        },
        newMatch: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Game", {
                query: {
                    squadra: curTeam,
                    giocatori: JSON.stringify(curPlayers),
                    username: user
                }
            });
        },
        
        newMatchSpoken: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("GameSpeech", {
                query: {
                    squadra: curTeam,
                    giocatori: JSON.stringify(curPlayers),
                    username: user
                }
            });
        },

        _onRouteMatched: function (oEvent) {
            var oArgs, oQuery;
            oArgs = oEvent.getParameter("arguments");
            oQuery = oArgs["?query"];
            if (oQuery) {
                var squadre = getFromApi(getTeams, {username: oQuery.username});
                user = oQuery.username;
                oModel = new JSONModel({
                    saved: [],
                    players: [],
                    playersExport: [],
                    squadre: squadre
                }, true);
                this.getView().setModel(oModel);
                if (oQuery.refreshTeam === "true") {
                    console.log(curTeam);
                    refresh(curTeam);
                }
                if (oQuery.newTeam === "true") {
                    squadre = getFromApi(getTeams);
                    oModel = new JSONModel({
                        saved: [],
                        players: [],
                        playersExport: [],
                        squadre: squadre
                    }, true);
                    this.getView().setModel(oModel);
                    this.getView().byId("sqList").setSelectedKey(oQuery.newTeamName);
                    setTimeout(function () {
                        refresh(oQuery.newTeamName);
                    }, 800);
                }
            }
        },

        getReport: function (e) {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("showReport", {
                query: {
                    id: oModel.getProperty("/saved")[e.getSource().sId.split('-')[2]].id,
                }
            });

        }
    });

});