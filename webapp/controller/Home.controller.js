var user;
var allenatorePic;
var logoPic;
var allenatoreName;
var mthis;

var getTeams = "getTeams";
var getSavedMatches = "getSavedMatches";
var getPlayers = "getPlayers";
var deletePlayer = "deletePlayer";
var deleteTeam = "deleteTeam";
var deleteMatch = "deleteMatch";
var editTeam = "editTeam";
var oModel = {};
var curTeam = "";
var curPlayers = [];

var apiHost = "https://cors.io/?http://bettervolleyscouting.altervista.org";

var thisDialog;
var thisVBox;
var thisLabel;
var thisTextArea;
var thisHBox;
var thisHTML;
var thisImage;
var thisButton;
var thisMessageToast;

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
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

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

function refresh(team) {
    var obj = {SQUADRA: team};
    getFromApiAsync(getSavedMatches, function (data) {
                oModel.setProperty("/saved", data);
                getFromApiAsync(getPlayers, function (dt) {
                    oModel.setProperty("/players", dt.giocatori);
                    //Carica logo team
                    logoPic=dt.sqDetails.logo;
                    allenatoreName=dt.sqDetails.tname;
                    allenatorePic=dt.sqDetails.pic;
					oModel.getProperty("/saved").forEach(function (e) {
						e.logoTeam = logoPic;
					});
					mthis.getView().byId("allenatoreList").setTitle(allenatoreName);
		            mthis.getView().byId("allenatoreList").setIcon(allenatorePic);
		            mthis.getView().byId("allenatoreList").setVisible(true);
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
    
}

function editTeamDialog(){
	
            var dialog = new thisDialog({
				title: 'Conferma',
				type: 'Message',
				content: [
					new thisVBox({
						items: [
							new thisLabel({ text: 'Nome della squadra', labelFor: 'submitNewName'})
					]
					}),
					new thisTextArea('submitNewName', {
						width: '100%',
						enabled: false,
						rows: 1,
						value: curTeam
					}),
					new thisHBox({
						items: [
							new thisVBox({
								items: [
									new thisLabel({text: "Foto allenatore"}),
									new thisImage('allenatore', {src: allenatorePic, width:"150px", height:"150px"}),
									new thisHTML({content: '<input id="inFileAllenatore" type="file" accept="image/gif, image/jpeg, image/png" onchange="readURL(this, \'__image2\', \'#__component0---home--allenatore\', 0);" />'})
								], alignItems:"Center", justifyContent:"Center"
							}),
							new thisVBox({
								items: [
									new thisLabel({text: "Logo squadra"}),
									new thisImage('logoSelection', {src: logoPic, width:"150px", height:"150px"}),
									new thisHTML({content: '<input id="inFileLogo" type="file" accept="image/gif, image/jpeg, image/png" onchange="readURL(this, \'__image2\', \'#__component0---home--logoSelection\', 1);" />'})
								]
							})
						]
					}),
					new thisVBox({
						items: [
							new thisLabel({ text: 'Nome e cognome allenatore', labelFor: 'submitAllenatore'})
					]
					}),
					new thisTextArea('submitAllenatore', {value: allenatoreName, width: '100%', rows: 1})
				],
				beginButton: new thisButton({
					text: 'Conferma',
					press: function () {
						var ret = getFromApi(editTeam, {
							NOME: curTeam,
							FOTOALLENATORE: $('allenatore').context.images[0].src,
							LOGO: $('logoSelection').context.images[1].src,
							NOMEALLENATORE: sap.ui.getCore().byId('submitAllenatore').getValue()
						});
						
						if(ret){
							thisMessageToast.show("Nome modificato correttamente");
						}else{
							thisMessageToast.show("Impossibile modificare");
							return;
						}
						
						dialog.close();
						refresh(curTeam);
						//setTimeout(function(){window.location.reload()}, 1000);
					}
				}),
				endButton: new thisButton({
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
}



String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


    
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
        	mthis=this;
        	document.body.addEventListener("touchstart", function() {}, false);
        	document.body.addEventListener("touchend", function() {}, false);
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("Home").attachMatched(this._onRouteMatched, this);
        
        	
        	thisDialog = Dialog;
			thisVBox = VBox;
			thisLabel = Label;
			thisTextArea = TextArea;
			thisHBox = HBox;
			thisHTML = HTML;
			thisImage = Image;
			thisButton = Button;
			thisMessageToast = MessageToast;
        },
		
        loadTeam: function (oEvent) {
			this.getView().byId("editSquadraButton").setEnabled(true);
            sap.ui.core.BusyIndicator.show(0);
            var obj = {SQUADRA: oEvent.getSource()._lastValue};
            var mthis = this;
            getFromApiAsync(getSavedMatches, function (data) {
                oModel.setProperty("/saved", data);
                getFromApiAsync(getPlayers, function (dt) {
                    oModel.setProperty("/players", dt.giocatori);
                    //Carica logo team
                    logoPic=dt.sqDetails.logo;
                    allenatoreName=dt.sqDetails.tname;
                    allenatorePic=dt.sqDetails.pic;
					oModel.getProperty("/saved").forEach(function (e) {
						e.logoTeam = logoPic;
					});
					mthis.getView().byId("allenatoreList").setTitle(allenatoreName);
		            mthis.getView().byId("allenatoreList").setIcon(allenatorePic);
		            mthis.getView().byId("allenatoreList").setVisible(true);
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
        	editTeamDialog();
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
            	user = oQuery.username;
                var squadre = getFromApi(getTeams, {username: user});
                
                oModel = new JSONModel({
                    saved: [],
                    players: [],
                    playersExport: [],
                    squadre: squadre
                }, true);
                this.getView().setModel(oModel);
                if (oQuery.refreshTeam === "true") {
                    //console.log(curTeam);
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
                    

                    
                    setTimeout(function () {
                    	allenatorePic="https://i.imgur.com/wajxa49.png";
                    	logoPic="https://i.imgur.com/T71qJu6.png";
                    	editTeamDialog();
                    }, 1850);
                    //////////////////////////////////sap.ui.getCore().byId("page").getController().myMethod();
                }
            }
        },

        getReport: function (e) {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("showReport", {
                query: {
                    id: oModel.getProperty("/saved")[e.getSource().sId.split('-')[2]].id,
                	username: user
                }
            });

        }
    });

});