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
    httpGetAsync((apiHost + res).replace(" ", "%20"), function (data) {
        cb(JSON.parse(data), data);
    }, prams);

}

var McurrentTeam;
var PALLEGGIO = "palleggio",
    MURO = "muro",
    SCHIACCIATA = "schiacciata",
    BAGHER = "bagher",
    SALVATAGGIO = "salvataggio",
    BATTUTA = "hahaha";
var roaster = [];
var currentPunto = {
    azione: []
};
var azioneArray = {};
var currentSet = {
    punti: []
};
var currentPartita = [];
var mioPunteggio = 0;
var suoPunteggio = 0;
var currentAzione = null;
var beep = new Audio("beep.ogg");
var mistannospostando = false;
var chiParte = true;
//True: partiamo noi, False: partono loro
var chiHaSegnato = true;
//True: segnato noi, False: segnato loro
var fineSetSound = new Audio("audio/fineSet.ogg");
var overSound = new Audio("audio/over.ogg");
var addPuntoSound = new Audio("audio/addPunto.ogg");
var scarsoSound = new Audio("audio/scarso.ogg");
var medioSound = new Audio("audio/medio.ogg");
var ottimoSound = new Audio("audio/ottimo.ogg");
var fineSound = new Audio("audio/fine.ogg");
var panchina_selector;
var panchina_selector_array = [];
var panchina = [];
var topSet = 5;
var betterThan = 3;
var mieiSet = 0;
var suoiset = 0;
var cambiando;
var cambiando_idx;
var mthis;
var battuta;
var dialogo;
var lay = [];
var riepilogoPage;
var aboutPage;
var isTheMatchStarted = false;
var busy;

function abilitaChiNonBatte() {
    for (var k = 1; k <= 6; k++) {
        $("#" + mthis.getView().createId("g" + k)).draggable('enable');
        $("#" + mthis.getView().createId("g" + k)).css('opacity', '1');
    }
}

function hideOver(hide) {
    var numero = 0;
    overSound.play();
    for (var i = 1; i <= 4; i++) {
        if ($(".punteggio" + i).css("display") === "inline-block") {
            numero++;
        }
    }
    if (numero > 0) {
        for (var i = 1; i <= 4; i++) {
            if (".punteggio" + i !== hide) {
                $(".punteggio" + i).fadeOut(100);
            }
        }
    }
}

function resetfnc() {
    mieiSet = 0;
    suoiset = 0;
    var rest = "";
    for (var i = betterThan; i > 0; i--) rest += "\u2588 ";
    mthis.getView().byId("suoisetmancanti").setText(rest);
    mthis.getView().byId("mieisetmancanti").setText(rest);
    mthis.getView().byId("suoisetvinti").setText("");
    mthis.getView().byId("mieisetvinti").setText("");
    mioPunteggio = 0;
    suoPunteggio = 0;
    mthis.getView().byId("tuoipunti").setText("0");
    mthis.getView().byId("mieipunti").setText("0");
    currentPartita = [];
    currentPunto = {
        azione: []
    };
    azioneArray = {};
    currentSet = {
        punti: []
    };
    $("#confetti").css("display", "none");

    isTheMatchStarted = false;
    mthis.getView().byId("play").setVisible(true);

    mthis.getView().byId("puntomio").setVisible(false);
    mthis.getView().byId("puntomio_t").setVisible(false);
    mthis.getView().byId("puntoloro").setVisible(false);
    mthis.getView().byId("puntoloro_t").setVisible(false);

}

function clone(obj) {
    if (null == obj || "object" != typeof obj)
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    return copy;
}

function getNumeroGiocatore(btn) {
    return btn.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML;
}

var dialogg;
var buttonn;
var labell;
var textareaa;
var user = "";

function dwld() {
    $("#foo").append("<a id='ciao' href='data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPartita, null, ' ')) +
        "' download='partita-" + mthis.getView().byId("npp").getText() + ".json' ></a>");
    $("#ciao").get()[0].click();
}

function generaTabellaRiepilogo() {
    return $.json2table(currentPartita, "riepilogo").html();
}

function gooriep() {
    //alert("Funzione non ancora implementata :(");
    if (!mthis.riepDialog) {
        mthis.riepDialog = new dialogg({
            title: "Riepilogo Partita",
            content: riepilogoPage,
            stretch: true,
            contentWidth: "80%",
            beginButton: new buttonn({
                text: "Close",
                press: function () {
                    mthis.riepDialog.close();
                }.bind(mthis)
            })
        });
        dialogo = mthis.riepDialog;
        //to get access to the global model
        mthis.getView().addDependent(this.riepDialog);
    }
    riepilogoPage.setContent(generaTabellaRiepilogo());
    mthis.riepDialog.open();

    //console.log(mthis.getView())
    mthis.getView()._xContent.innerHTML = "<mvc:View xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" controllerName=\"ProvaVolley.controller.Riepilogo\" xmlns:html=\"http://www.w3.org/1999/xhtml\"> <App><pages><Page title=\"Title\"><content></content></Page></pages></App></mvc:View>";
}

function finePartita() {
    //console.log(currentPartita);
    setTimeout(function () {
        fineSound.play();
    }, 1502);
    $("#confetti").css("display", "block");

    if (!mthis.ciaoDialog) {
        var oVbox2 = new sap.m.VBox({width: "100%"});
        oVbox2.setJustifyContent('Center');
        oVbox2.setAlignItems('Center');
        //oVbox2.addItem(new busy( "fabrizia", {}));
        oVbox2.addItem(new buttonn({
            text: "Torna indietro",
            press: function () {
                sap.ui.core.UIComponent.getRouterFor(mthis).navTo("Home", {
                    query: {
                        username: user,
                        refreshTeam: "true"
                    }
                });
            }
        }));
        mthis.ciaoDialog = new dialogg({
            title: "Partita terminata!",
            content: [
                oVbox2,
                new busy("fabrizia", {})
            ],
            beginButton: new buttonn({
                text: "Chiudi",
                press: function () {
                    resetfnc();
                    mthis.ciaoDialog.close();
                }.bind(mthis)
            })
        });
        dialogo = mthis.ciaosDialog;
        //to get access to the global model
        mthis.getView().addDependent(this.ciaoDialog);
    }
    mthis.ciaoDialog.open();

    setTimeout(function () {
        var obj = [];
        var fa = true;
        currentPartita.forEach(function (e) {
            e.punti.forEach(function (i) {
                i.azione.forEach(function (o) {
                    obj.push({
                        giocatore: o.giocatore,
                        azione: o.azione,
                        qualita: o.qualita,
                        puntiMiei: i.puntoMio,
                        puntiLoro: i.puntoSuo,
                        fineAzione: fa ? 1 : 0
                    });
                    fa = false;
                });
                fa = true;
            });
        });
        //console.log(obj);
        getFromApiAsync("saveMatch", function (data, res) {
            //console.log(res);
            $("#fabrizia-busyIndicator").css("display", "none");
        }, {JSON: JSON.stringify(obj), SQUADRA: McurrentTeam, AVV: mthis.getView().byId("avversari").getValue()});
    }, 0);

}

function pushAzione(azione, giocatore, qualita) {
    switch (qualita) {
        case 1:
            scarsoSound.play();
            break;
        case 2:
            medioSound.play();
            break;
        case 3:
            ottimoSound.play();
            break;
    }
    mistannospostando = false;
    azioneArray.giocatore = giocatore;
    azioneArray.azione = azione;
    azioneArray.qualita = qualita;
    currentPunto.azione.push(clone(azioneArray));
}

var annulla = false;

function dwldRoaster() {
    for (var i = 1; i <= 6; i++) {
        roaster[i - 1] = this.getView().byId("sg" + i).getValue();
    }

    for (var i = 1; i <= 6; i++) {
        roaster[i + 5] = this.getView().byId("p" + i).getValue();
    }

    $("#foo").append("<a id='dwlR' href='data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roaster, null, ' ')) +
        "' download='rosaGiocatori.json' ></a>");
    $("#dwlR").get()[0].click();
}

function loadRoaster(file) {
    roaster = $.parseJSON(file);
    for (var i = 0; i < 6; i++) {
        $("#" + mthis.getView().createId("g" + (i + 1))).get()[0].childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = roaster[i];
        mthis.getView().byId("sg" + (i + 1)).setValue(roaster[i]);

        panchina[i].panchinaro = roaster[i + 6];
        mthis.getView().byId("p" + (i + 1)).setValue(roaster[i + 6]);
        panchina_selector_array[i].setText(roaster[i + 6]);
        bottoni[i].numero = mthis.getView().byId("sg" + (i + 1)).getValue();
        bottoni[i].ref = mthis.getView().byId("g" + (i + 1));
    }
}

function battutaschifo() {
    annulla = true;
    abilitaChiNonBatte();

    var last = "g6";
    for (var q = 6; q >= 1; q--)
        if (!bottoni[q - 1].hidden) {
            last = "g" + q;
            break;
        }

    pushAzione("Battuta", getNumeroGiocatore($("#" + mthis.getView().createId(last)).get()[0]), 1);
    //dialogo.close();
}

function battutamah() {
    annulla = true;
    abilitaChiNonBatte();

    var last = "g6";
    for (var q = 6; q >= 1; q--)
        if (!bottoni[q - 1].hidden) {
            last = "g" + q;
            break;
        }

    pushAzione("Battuta", getNumeroGiocatore($("#" + mthis.getView().createId(last)).get()[0]), 2);
    //dialogo.close();
}

function battutawow() {
    annulla = true;
    abilitaChiNonBatte();

    var last = "g6";
    for (var q = 6; q >= 1; q--)
        if (!bottoni[q - 1].hidden) {
            last = "g" + q;
            break;
        }

    pushAzione("Battuta", getNumeroGiocatore($("#" + mthis.getView().createId(last)).get()[0]), 3);
    //dialogo.close();
}

function pushPunto(puntoMio, puntoSuo) {
    currentPunto.puntoMio = puntoMio;
    currentPunto.puntoSuo = puntoSuo;
    currentSet.punti.push(clone(currentPunto));
    currentPunto = {
        azione: []
    };
}

function pushSet() {
    currentPartita.push(clone(currentSet));
    currentSet = {
        punti: []
    };
}

var bottoni = [];

function gira() {
    var showed = []
    for (var q = 1; q <= 6; q++)
        if (!bottoni[q - 1].hidden) showed.push({id: "g" + q, idx: q - 1});

    var temp = getNumeroGiocatore($("#" + mthis.getView().createId(showed[0].id)).get()[0]);
    // var old = bottoni[showed[0].idx].nome;
    showed.forEach(function (e, i, a) {
        if (i < showed.length - 1) {
            var passivo = $("#" + mthis.getView().createId(e.id)).get()[0];
            var attivo = $("#" + mthis.getView().createId(a[i + 1].id)).get()[0];
            passivo.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = getNumeroGiocatore(attivo);
            bottoni[e.idx].numero = bottoni[a[i + 1].idx].numero
        }
    });
    $("#" + mthis.getView().createId(showed[showed.length - 1].id)).get()[0].childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = temp;
    bottoni[showed[showed.length - 1].idx].numero = temp;
    // bottoni[showed[showed.length - 1].idx].nome = old;


    // for (var i = 1; i < 6; i++) {
    //     var passivo = $("#" + mthis.getView().createId("g" + i)).get()[0];
    //     var attivo = $("#" + mthis.getView().createId("g" + (i + 1))).get()[0];
    //     passivo.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = getNumeroGiocatore(attivo);
    // }
    // $("#" + mthis.getView().createId("g6")).get()[0].childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = temp;
    // var gaffu = bottoni[0].numero;
    // for (var i = 0; i < 5; i++) {
    //     bottoni[i].numero = bottoni[i + 1].numero;
    // }
    // bottoni[5].numero = gaffu;
}

function cambia(a) {
    var fooo = $("#" + cambiando.getId()).get()[0].childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML;
    var btn = $("#" + cambiando.getId()).get()[0];
    var btn_t = btn.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML;
    btn.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = a.oSource.getText();
    bottoni[cambiando_idx].numero = a.oSource.getText();
    var cambio = {
        entity: "CAMBIO",
        entrante: a.oSource.getText(),
        uscente: fooo
    };
    a.oSource.setText(btn_t);
    dialogo.close();
    currentSet.punti.push(clone(cambio));
}


function find(a) {
    var i;
    for (i = 0; i < 6; i++) {
        //console.log(a);
        //console.log(bottoni[i].numero)
        if (bottoni[i].numero === a)
            break;
    }
    return i;
}

function disabilitaChiNonBatte() {
    var changed = false;
    for (var k = 6; k >= 1; k--) {
        $("#" + mthis.getView().createId("g" + k)).draggable('disable');
        //console.log(bottoni)
        if (!(!bottoni[k - 1].hidden && !changed)) {
            $("#" + mthis.getView().createId("g" + k)).css('opacity', '.55');
            changed = true;
        }
    }
}


var oModel2;
var isbatting;

sap.ui.define([

    "jquery.sap.global",
    'sap/m/TextArea',
    'sap/m/Label',
    'sap/m/Input',
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/StandardListItem",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/HTML",
    "sap/ui/model/json/JSONModel",
    "sap/m/BusyIndicator",
    'sap/m/MessageToast'
], function (jQuery, TextArea, Label, Input, Button, Dialog, List, HBox, VBox, StandardListItem, Controller, HTML, JSONModel, Busy, MessageToast) {
    "use strict";

    return Controller.extend("BVS.controller.Game", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf BVS.view.Game
         */
        onInit: function () {

            oModel2 = new JSONModel({
                changable: []
            }, true);
            this.getView().setModel(oModel2);

            buttonn = Button;
            dialogg = Dialog;
            labell = Label;
            textareaa = TextArea;
            busy = Busy;

            panchina_selector = new VBox();
            var cambi = new HBox();
            battuta = new HBox();

            for (var i = 0; i < 6; i++) {
                panchina[i] = {};
                panchina[i].inGioco = null;
                panchina[i].panchinaro = i;
                panchina_selector_array[i] = new Button("panchinaro" + i, {
                    text: "" + i,
                    press: cambia
                });
                cambi.addItem(panchina_selector_array[i]);
            }
            battuta.addItem(new Button("btLow", {
                text: "Battuta Brutta",
                press: battutaschifo,
                type: "Reject"
            }));
            battuta.addItem(new Button("btMid", {
                text: "Battuta Mediocre",
                press: battutamah
            }));
            battuta.addItem(new Button("btHigh", {
                text: "Battuta Bella",
                press: battutawow,
                type: "Accept"
            }));
            panchina_selector.addItem(cambi);
            panchina_selector.addItem(battuta);

            sap.ui.core.UIComponent.getRouterFor(this).getRoute("Game").attachMatched(this._onRouteMatched, this);
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf BVS.view.Game
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf BVS.view.Game
         */
        onAfterRendering: function () {
            mthis = this;
            var btn;
            var thisBtn;
            var foo = this;

            this.byId("view").attachBrowserEvent("mouseup", function () {
                for (var t = 1; t <= 6; t++) {
                    if ($("#" + foo.getView().createId("g" + t)).css("opacity") !== "0.55" || annulla) {
                        //alert($("#" + foo.getView().createId("g" + t)).css("opacity"));
                        $("#" + foo.getView().createId("g" + t)).css("opacity", "1"); //Rimetti l'opacità ai giocatori
                    }
                }
                setTimeout(function () {
                    $(".punteggio1").fadeOut(100);
                    $(".punteggio2").fadeOut(100);
                    $(".punteggio3").fadeOut(100);
                    $(".punteggio4").fadeOut(100);
                }, 100);
                mistannospostando = false;
            });
            for (var k = 1; k <= 6; k++) {
                btn = this.getView().createId("g" + k);
                bottoni[k - 1] = {};
                bottoni[k - 1].numero = this.getView().byId("g" + k).getText();
                bottoni[k - 1].ref = this.getView().byId("g" + k);
                this.getView().byId("g" + k).attachBrowserEvent("taphold", function (a) {
                    var i = find(a.target.innerHTML);
                    cambiando = bottoni[i].ref;

                    var last = "g6";
                    for (var q = 6; q >= 1; q--)
                        if (!bottoni[q - 1].hidden) {
                            last = "g" + q;
                            break;
                        }

                    if (cambiando === foo.getView().byId(last) && chiHaSegnato && isTheMatchStarted) isbatting = true;
                    else isbatting = false;

                    cambiando_idx = i;
                    if (!mistannospostando) {
                        if (!mthis._oPopover) {
                            mthis._oPopover = sap.ui.xmlfragment("BVS.fragments.CambioPopover", mthis);
                            mthis.getView().addDependent(mthis._oPopover);
                            mthis._oPopover.bindElement("/changable");
                        }
                        mthis._oPopover.openBy(this);

                        $("#cosse").css("display", "none");
                        if (isbatting)
                            $("#cosse").css("display", "flex");
                    }
                });
            }
            resetfnc();
        },

        _onRouteMatched: function (oEvent) {
            var oArgs, oQuery;
            oArgs = oEvent.getParameter("arguments");
            oQuery = oArgs["?query"];
            if (oQuery) {
                user = oQuery.username;
                oModel2.setProperty("/changable", JSON.parse(oQuery.giocatori));
                this.getView().byId("npp").setText(oQuery.squadra + " vs     ")
                McurrentTeam = oQuery.squadra;
            }
        },

        changePlayer: function (oEvent) {
            var changable = oModel2.getProperty("/changable");
            var id = oEvent.getSource().sId;
            var selected = id.substr(id.lastIndexOf("-") + 1, id.length);
            var btn = $("#" + cambiando.getId()).get()[0];

            var onum = btn.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML;
            var onam = cambiando.nome ? cambiando.nome : "come cazzo lo posso sapere?";
            cambiando.numero = changable[selected].numero;
            btn.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = changable[selected].numero;
            bottoni[cambiando_idx].numero = cambiando.numero;

            cambiando.nome = changable[selected].nome;
            cambiando.numero = changable[selected].numero;

            if (isTheMatchStarted) {
                changable[selected] = {
                    nome: onam,
                    numero: onum
                }
                oModel2.setProperty("/changable", changable);
            } else {
                changable.splice(selected, 1);
                oModel2.setProperty("/changable", changable)
            }

            mthis._oPopover.close()
        },

        addPuntoMio: function () {
            addPuntoSound.play();
            mioPunteggio++;
            if (!chiHaSegnato) {
                gira();
            }
            chiHaSegnato = true;
            //True: abbiamo segnato noi
            this.getView().byId("mieipunti").setText(mioPunteggio);
            pushPunto(mioPunteggio, suoPunteggio);
            disabilitaChiNonBatte();
            if (mioPunteggio >= topSet && mioPunteggio - suoPunteggio >= 2) {
                pushSet();
                fineSetSound.play();
                mioPunteggio = 0;
                suoPunteggio = 0;
                this.getView().byId("mieipunti").setText(mioPunteggio);
                this.getView().byId("tuoipunti").setText(suoPunteggio);
                mieiSet++;
                var sets = "";
                var rest = "";
                for (var i = 0; i < mieiSet; i++)
                    sets += "\u2588 ";
                for (var i = betterThan; i > mieiSet; i--)
                    rest += "\u2588 ";
                this.getView().byId("mieisetvinti").setText(sets);
                this.getView().byId("mieisetmancanti").setText(rest);
                if (mieiSet > betterThan / 2) {
                    finePartita();
                }
            }
        },
        subPuntoMio: function () {
            if (mioPunteggio > 0) {
                var currentPuntoTemp = currentSet.punti[currentSet.punti.length - 1];
                currentPunto.azione = currentPuntoTemp.azione;
                currentSet.punti.splice(currentSet.punti.length - 1, 1);
                mioPunteggio--;
                this.getView().byId("mieipunti").setText(mioPunteggio);
            }
        },
        addPuntoSuo: function () {
            abilitaChiNonBatte();
            addPuntoSound.play();
            suoPunteggio++;
            chiHaSegnato = false;
            //False: hanno segnato loro
            this.getView().byId("tuoipunti").setText(suoPunteggio);
            pushPunto(mioPunteggio, suoPunteggio);
            if (suoPunteggio >= topSet && suoPunteggio - mioPunteggio >= 2) {
                pushSet();
                fineSetSound.play();
                mioPunteggio = 0;
                suoPunteggio = 0;
                this.getView().byId("mieipunti").setText(mioPunteggio);
                this.getView().byId("tuoipunti").setText(suoPunteggio);
                suoiset++;
                var sets = "";
                var rest = "";
                for (var i = 0; i < suoiset; i++)
                    sets += "\u2588 ";
                for (var i = betterThan; i > suoiset; i--)
                    rest += "\u2588 ";
                this.getView().byId("suoisetvinti").setText(sets);
                this.getView().byId("suoisetmancanti").setText(rest);
                if (suoiset > betterThan / 2) {
                    finePartita();
                }
            }
        },
        subPuntoSuo: function () {
            if (suoPunteggio > 0) {
                var currentPuntoTemp = currentSet.punti[currentSet.punti.length - 1];
                currentPunto.azione = currentPuntoTemp.azione;
                currentSet.punti.splice(currentSet.punti.length - 1, 1);
                suoPunteggio--;
                this.getView().byId("tuoipunti").setText(suoPunteggio);
            }
        },

        IniziaPartita: function () {
            mthis = this;
            if (mthis.getView().byId('avversari').getValue().length > 0) {
                var oVbox1 = new sap.m.VBox({width: "100%"});
                oVbox1.setJustifyContent('Center');
                oVbox1.setAlignItems('Center');
                oVbox1.addItem(new Label({text: 'Punti per set: '}));
                oVbox1.addItem(new Input(mthis.getView().createId('setInput'), {type: 'Number'}));
                oVbox1.addItem(new Label({text: 'Alla meglio dei: '}));
                oVbox1.addItem(new Input(mthis.getView().createId('meglioDeiInput'), {type: 'Number'}));
                var dialog = new Dialog({
                    title: 'Impostazioni partita',
                    type: 'Message',
                    content: oVbox1,
                    beginButton: new Button({
                        text: 'Inizia',
                        press: function () {
                            if (mthis.getView().byId('setInput').getValue() >= 1 && mthis.getView().byId('meglioDeiInput').getValue() >= 1) {
                                isTheMatchStarted = true;
                                //console.log(mthis.getView().byId('setInput').getValue());
                                mthis.getView().byId('avversari').setEnabled(false);
                                topSet = mthis.getView().byId('setInput').getValue();
                                betterThan = mthis.getView().byId('meglioDeiInput').getValue();
                                var rest = "";
                                for (var i = 0; i < betterThan; i++) {
                                    rest += "\u2588 ";
                                }
                                mthis.getView().byId("suoisetmancanti").setText(rest);
                                mthis.getView().byId("mieisetmancanti").setText(rest);
                                mthis.getView().byId("play").setVisible(false);

                                mthis.getView().byId("puntomio").setVisible(true);
                                mthis.getView().byId("puntomio_t").setVisible(true);
                                mthis.getView().byId("puntoloro").setVisible(true);
                                mthis.getView().byId("puntoloro_t").setVisible(true);


                                var btn;
                                var mthisBtn;
                                var foo = mthis;

                                for (var k = 1; k <= 6; k++) {
                                    btn = mthis.getView().createId("g" + k);
                                    // console.log(mthis.getView().byId("g" + k).getText());
                                    if (getNumeroGiocatore(document.getElementById(btn)).startsWith("P")) {
                                        mthis.getView().byId("g" + k).setVisible(false);
                                        bottoni[k - 1].hidden = true;
                                    } else bottoni[k - 1].hidden = false;
                                    $("#" + btn).draggable({
                                        cancel: true,
                                        revert: true,
                                        //Ritorno
                                        revertDuration: "212.2",
                                        //Velocità di ritorno
                                        distance: 10,
                                        scroll: false,
                                        zindex: 100000,
                                        //helper: "clone",
                                        cursor: "move",
                                        drag: function (event, ui) {
                                            mistannospostando = true;
                                            mthisBtn = event.target;
                                            for (var j = 1; j <= 6; j++) {
                                                if (foo.getView().createId("g" + j) !== event.target.id) {
                                                    //Se il giocatore non è lo stesso che ho selezionato
                                                    $("#" + foo.getView().createId("g" + j)).css("opacity", ".3"); //Cambia l'opacità del giocatore
                                                }
                                            }
                                        }
                                    });

                                    $("#" + mthis.getView().createId("muroBtn") + "-inner").droppable({
                                        over: function (event, ui) {
                                            currentAzione = MURO;
                                            $("#" + mthisBtn.id).css("opacity", "0");
                                            $("#" + foo.getView().createId("top1")).fadeIn();
                                            $("#" + foo.getView().createId("top2")).fadeIn();
                                            $("#" + foo.getView().createId("top3")).fadeIn();
                                            hideOver(".punteggio3");
                                        }
                                    });
                                    $("#" + mthis.getView().createId("schiacciataBtn") + "-inner").droppable({
                                        over: function (event, ui) {
                                            currentAzione = SCHIACCIATA;
                                            $("#" + mthisBtn.id).css("opacity", "0");
                                            $("#" + foo.getView().createId("top1")).fadeIn();
                                            $("#" + foo.getView().createId("top2")).fadeIn();
                                            $("#" + foo.getView().createId("top3")).fadeIn();
                                            hideOver(".punteggio3");
                                        }
                                    });
                                    $("#" + mthis.getView().createId("palleggioBtn") + "-inner").droppable({
                                        over: function (event, ui) {
                                            currentAzione = PALLEGGIO;
                                            $("#" + mthisBtn.id).css("opacity", "0");
                                            $("#" + foo.getView().createId("left1")).fadeIn();
                                            $("#" + foo.getView().createId("left2")).fadeIn();
                                            $("#" + foo.getView().createId("left3")).fadeIn();
                                            hideOver(".punteggio1");
                                        }
                                    });
                                    $("#" + mthis.getView().createId("palleggio1Btn") + "-inner").droppable({
                                        over: function (event, ui) {
                                            currentAzione = PALLEGGIO;
                                            $("#" + mthisBtn.id).css("opacity", "0");
                                            $("#" + foo.getView().createId("right1")).fadeIn();
                                            $("#" + foo.getView().createId("right2")).fadeIn();
                                            $("#" + foo.getView().createId("right3")).fadeIn();
                                            hideOver(".punteggio2");
                                        }
                                    });
                                    $("#" + mthis.getView().createId("bagherBtn") + "-inner").droppable({
                                        over: function (event, ui) {
                                            currentAzione = BAGHER;
                                            $("#" + mthisBtn.id).css("opacity", "0");
                                            $("#" + foo.getView().createId("bottom1")).fadeIn();
                                            $("#" + foo.getView().createId("bottom2")).fadeIn();
                                            $("#" + foo.getView().createId("bottom3")).fadeIn();
                                            hideOver(".punteggio4");
                                        }
                                    });
                                    $("#" + mthis.getView().createId("tuffoBtn") + "-inner").droppable({
                                        over: function (event, ui) {
                                            currentAzione = SALVATAGGIO;
                                            $("#" + mthisBtn.id).css("opacity", "0");
                                            $("#" + foo.getView().createId("bottom1")).fadeIn();
                                            $("#" + foo.getView().createId("bottom2")).fadeIn();
                                            $("#" + foo.getView().createId("bottom3")).fadeIn();
                                            hideOver(".punteggio4");
                                        }
                                    });
                                    $("#" + mthis.getView().createId("left1") + "-inner").droppable({
                                        //Male
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 1);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("left2") + "-inner").droppable({
                                        //Buono
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 2);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("left3") + "-inner").droppable({
                                        //Ottimo
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 3);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("right1") + "-inner").droppable({
                                        //Male
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 1);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("right2") + "-inner").droppable({
                                        //Buono
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 2);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("right3") + "-inner").droppable({
                                        //Ottimo
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 3);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("top1") + "-inner").droppable({
                                        //Male
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 1);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("top2") + "-inner").droppable({
                                        //Buono
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 2);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("top3") + "-inner").droppable({
                                        //Ottimo
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 3);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("bottom1") + "-inner").droppable({
                                        //Male
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 1);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("bottom2") + "-inner").droppable({
                                        //Buono
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 2);
                                        }
                                    });
                                    $("#" + mthis.getView().createId("bottom3") + "-inner").droppable({
                                        //Ottimo
                                        drop: function (event, ui) {
                                            pushAzione(currentAzione, getNumeroGiocatore(mthisBtn), 3);
                                        }
                                    });
                                }
                                dialog.close();
                            } else {
                                MessageToast.show("Invalid set input.");
                            }


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
            } else {
                var dialogoN = new Dialog({
                    title: 'Errore',
                    type: 'Message',
                    state: 'Error',
                    content: new Label({
                        text: 'Inserire un nome per la squadra avversaria.'
                    }),
                    beginButton: new Button({
                        text: 'OK',
                        press: function () {
                            dialogoN.close();
                        }
                    }),
                    afterClose: function () {
                        dialogoN.destroy();
                    }
                });

                dialogoN.open();
            }
        },
        battutabrutta: function () {
            battutaschifo();
            this._oPopover.close();
        },
        battutabella: function () {
            battutamah();
            this._oPopover.close();
        },
        battutafantastica: function () {
            battutawow();
            this._oPopover.close();
        }

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf BVS.view.Game
         */
        //	onExit: function() {
        //
        //	}

    });

});