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

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var mthis;
var grammar = '#JSGF V1.0; grammar colors; public <command> = <numero> <azione> <qualita>; public <numero> = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 ); public <azione> = ( bagher | palleggio | schiacciata | battuta | muro ); public <qualita> = ( ottimo | buono | brutto )';

var command = [['suo', 'mio'], ['salvataggio', 'bagher', 'palleggio', 'muro', 'schiacciata', 'battuta'], ['bello', 'brutto', 'ottimo', 'ornetti']]
var dictionary = [];
dictionary = dictionary.concat(command[1], command[2]);

var topSet, betterThan, user, giocatori, squadra, mioPunteggio = 0, suoPunteggio = 0, mieiSet = 0, suoiset = 0;
var fineSetSound = new Audio("audio/fineSet.ogg");
var overSound = new Audio("audio/over.ogg");
var addPuntoSound = new Audio("audio/addPunto.ogg");
var scarsoSound = new Audio("audio/scarso.ogg");
var medioSound = new Audio("audio/medio.ogg");
var ottimoSound = new Audio("audio/ottimo.ogg");
var fineSound = new Audio("audio/fine.ogg");
var dialogg;
var buttonn;
var labell;
var textareaa;
var busy;

var azioneArray = {
	giocatore: null,
	azione: null,
	qualita: null
};

var currentPunto = {
	azione: []
};
var currentSet = {
	punti: []
};
var currentPartita = [];

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
                new busy("fabriziaa", {})
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
            $("#fabriziaa-busyIndicator").css("display", "none");
        }, {JSON: JSON.stringify(obj), SQUADRA: squadra, AVV: mthis.getView().byId("avversari").getValue()});
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
    azioneArray.giocatore = giocatore;
    azioneArray.azione = azione;
    azioneArray.qualita = qualita;
    currentPunto.azione.push(clone(azioneArray));
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

function mostSuitable(dict, parola) {
	dict.forEach(function(str){
		if(str.includes(parola)){
			return str;
		}
	});
    var a = JSON.parse(JSON.stringify(dict));
    a = a.map(function(e){
        var total = e.length, corrected = 0;
        parola.split('').forEach(function(lettera){
            if (e.includes(lettera)) corrected++;
        });
        return corrected / total;
    });

    var index = 0, maxi = -1;
    a.forEach(function(e, i){
        if (e > maxi) {
            maxi = e;
            index = i;
        }
    })

    return dict[index];
}

var synth = window.speechSynthesis;
var voices = [];

function speak(text) {
    setTimeout(function(){
        voices = synth.getVoices();
        if (synth.speaking) {
            setTimeout(function(){speak(text)}, 500);
            return;
        }
        if (text !== '') {
            var utterThis = new SpeechSynthesisUtterance(text);
            var selectedOption = "Google italiano";
            for (i = 0; i < voices.length; i++) {
                if (voices[i].name === selectedOption) {
                    utterThis.voice = voices[i];
                }
            }
            utterThis.pitch = 0;
            utterThis.rate = 1.2;
            synth.speak(utterThis);
        }
    }, 0);
}

function validate(str) {
    str = str.trim().split(" ");
    if (str.length != 3) return false;
    var ok = true;
    str.forEach(function(e, i){
        if (i === 0) {
            ok = ok && !isNaN(parseInt(e))
        } else {
            ok = ok && command[i].includes(e)
        }
    })
    return ok;
}

function parse(arr) {
    //TODO: Non sappiamo ancora gli id :D
    return arr;
}

var numeri = [
	['uno', '1'],
	['due', '2'],
	['tre', '3'],
	['quattro', '4'],
	['cinque', '5'],
	['sei', '6'],
	['sette', '7'],
	['otto', '8'],
	['nove', '9'],
	['zero', '0']
];
function sanitize(str){
	numeri.forEach(function(e){
		str = str.replace(e[0], e[1]);
	});
	return str;
}

var lastThread = null;
var history2 = [];
var counter = 0;
document.body.onmousedown = function(){
    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1.0);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = true;
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
        var last = sanitize(event.results[event.results.length - 1][0].transcript);
        last = last.toLowerCase().split(" ");
        // if (last[0] !== "numero") {
        //     speak("ripeti")
        //     return;
        // }
        last = last.map(function(e, i){
            if (i > 0) {
                var ms = mostSuitable(dictionary, e);
                if (ms === "ornetti") {
                    document.body.style.backgroundImage = 'url("./download.png")'
                    setTimeout(function(){document.body.style.backgroundImage = ''}, 100);
                    return "";
                }
                return ms;
            }
            return e
        }).join(" ").replace("  ", " ");
        console.log(last);
        if (!validate(last)) speak("ripeti")
        else {
        	var aaa =  parse(last.split(" "));
			pushAzione(aaa[1], aaa[0], aaa[2] === "brutto" ? 1 : (aaa[2] === "bello" ? 2 : 3) );        
        }
        recognition.stop();
    };
    lastThread = recognition;
    recognition.start();
    document.body.style.backgroundColor = 'red';
};
document.body.onmouseup = function() {
	setTimeout(function(){
    lastThread.stop();
    document.body.style.backgroundColor = 'black';
}, 250);}

sap.ui.define([
	"jquery.sap.global",
    'sap/m/TextArea',
    'sap/m/Text',
    'sap/m/Image',
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
], function(jQuery, TextArea, Text,Image, Label, Input, Button, Dialog, List, HBox, VBox, StandardListItem, Controller, HTML, JSONModel, Busy, MessageToast) {
	"use strict";

	return Controller.extend("BVS.controller.GameSpeech", {
		onInit: function(evt){
			buttonn = Button;
            dialogg = Dialog;
            labell = Label;
            textareaa = TextArea;
            busy = Busy;
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("GameSpeech").attachMatched(this._onRouteMatched, this);

           
		},
		
		_onRouteMatched: function (oEvent) {
            var oArgs, oQuery;
            oArgs = oEvent.getParameter("arguments");
            oQuery = oArgs["?query"];
            if (oQuery) {
                user = oQuery.username;
                giocatori = oQuery.giocatori;
                this.getView().byId("npp").setText(oQuery.squadra + " vs     ");
                squadra = oQuery.squadra;
            }
            
            
        },
        
        
        IniziaPartita: function () {
            mthis = this;
            //oHbox1.addItem(new Text({text: 'Prima di iniziare a dare comandi vocali, assicurati di indossare degli auricolari con microfono isolato e di consultare la documentazione per la lista completa dei comandi.'
            							
            //}));
            if (mthis.getView().byId('avversari').getValue().length > 0) {
            	var WarningDialog = new Dialog({
				title: 'Attenzione',
				type: 'Message',
				state: 'Warning',
				content: new Text({text: 'Prima di iniziare a dare comandi vocali, assicurati di indossare degli auricolari con microfono isolato e di consultare la documentazione per la lista completa dei comandi.'}),
				beginButton: new Button({
					text: 'Ok',
					press: function () {
						WarningDialog.close();
					}
				}),
				afterClose: function() {
					WarningDialog.destroy();
				}
			});
			
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
                                
                                dialog.close();
                                WarningDialog.open();
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
        
        addPuntoMio: function () {
            addPuntoSound.play();
            mioPunteggio++;
            
            this.getView().byId("mieipunti").setText(mioPunteggio);
            pushPunto(mioPunteggio, suoPunteggio);
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
            addPuntoSound.play();
            suoPunteggio++;
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

	});

});