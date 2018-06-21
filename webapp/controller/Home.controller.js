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
    httpGetAsync((apiHost + res).replace(" ", "%20"), function (data) {
        cb(JSON.parse(data));
    }, prams);

}

var oModel = {};
var curTeam = "";
var curPlayers = [];
var user = "";

sap.ui.define([
    "jquery.sap.global",
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/Text',
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel'
], function (JQuery, Button, Dialog, Text, Controller, JSONModel) {
    "use strict";

    return Controller.extend("BVS.controller.Home", {
        onInit: function () {
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("Home").attachMatched(this._onRouteMatched, this);
        },

        loadTeam: function (oEvent) {

            sap.ui.core.BusyIndicator.show(0);
            var obj = {SQUADRA: oEvent.getSource()._lastValue};
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
                        squadre.push({squadra: "+++ Aggiungi squadra +++"});
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
