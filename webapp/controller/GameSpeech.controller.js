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
var lastMioPunteggio = 0, lastSuoPunteggio = 0, lastMieiSet = 0, lastSuoiset = 0, undoable = 0;
var fineSetSound = new Audio("audio/fineSet.ogg");
var overSound = new Audio("audio/over.ogg");
var addPuntoSound = new Audio("audio/addPunto.ogg");
var scarsoSound = new Audio("audio/scarso.ogg");
var medioSound = new Audio("audio/medio.ogg");
var ottimoSound = new Audio("audio/ottimo.ogg");
var fineSound = new Audio("audio/fine.ogg");
var msBox;
var dialogg;
var buttonn;
var labell;
var textareaa;
var busy;
var numeriPossibili = [];
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
var currentPartita = []
var lastAzioneArray = {
	giocatore: null,
	azione: null,
	qualita: null
}
var lastCurrentPunto = {
	azione: []
};
var lastCurrentSet = {
	punti: []
}
var lastCurrentPartita = []
var lastHTMLData;
var lastLatestData;
var htmlData = [];		
var latestData = "";

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

function undo(){
	if(undoable < 1) return false;
	mieiSet = clone(lastMieiSet);
	mioPunteggio = clone(lastMioPunteggio);
    suoiset = clone(lastSuoiset);
    suoPunteggio = clone(lastSuoPunteggio);
    azioneArray = clone(lastAzioneArray);
    currentPartita = clone(lastCurrentPartita);
    currentPunto = clone(lastCurrentPunto);
    currentSet = clone(lastCurrentSet);
    htmlData = clone(lastHTMLData);
    latestData = clone(lastLatestData);
    undoable--;
    return true;
}

function save(){
	lastMieiSet = mieiSet;
	lastMioPunteggio = mioPunteggio;
    lastSuoiset = suoiset;
    lastSuoPunteggio = suoPunteggio;
    lastAzioneArray = azioneArray;
    lastCurrentPartita = currentPartita;
    lastCurrentPunto = currentPunto;
    lastCurrentSet = currentSet;
    lastHTMLData = htmlData;
    lastLatestData = latestData;
    undoable++;
    return true;
}



function finePartita() {
    //console.log(currentPartita);
    setTimeout(function () {
        fineSound.play();
    }, 1502);
    $("#confetti").css("display", "block");


    	mthis.ciaoDialog = msBox.success("\""+squadra+" - "+mthis.getView().byId('avversari').getValue()+"\", salvata con successo!", {
			onClose: function () {
				sap.ui.core.UIComponent.getRouterFor(mthis).navTo("Home", {
					query: {
						username: user,
						refreshTeam: "true"
					}
				});
			}
    	});
		mthis.getView().addDependent(this.ciaoDialog);

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

function addPuntoMioFnc(cl){
	addPuntoSound.play();
            mioPunteggio++;
            
            cl.getView().byId("mieipunti").setText(mioPunteggio);
            pushPunto(mioPunteggio, suoPunteggio);
            if (mioPunteggio >= topSet && mioPunteggio - suoPunteggio >= 2) {
                pushSet();
                fineSetSound.play();
                mioPunteggio = 0;
                suoPunteggio = 0;
                cl.getView().byId("mieipunti").setText(mioPunteggio);
                cl.getView().byId("tuoipunti").setText(suoPunteggio);
                mieiSet++;
                var sets = "";
                var rest = "";
                for (var i = 0; i < mieiSet; i++)
                    sets += "\u2588 ";
                for (var i = betterThan; i > mieiSet; i--)
                    rest += "\u2588 ";
                cl.getView().byId("mieisetvinti").setText(sets);
                cl.getView().byId("mieisetmancanti").setText(rest);
                if (mieiSet > betterThan / 2) {
                    finePartita();
                }
            }
            save();
}

function addPuntoSuoFnc(cl){
	addPuntoSound.play();
            suoPunteggio++;
            cl.getView().byId("tuoipunti").setText(suoPunteggio);
            pushPunto(mioPunteggio, suoPunteggio);
            if (suoPunteggio >= topSet && suoPunteggio - mioPunteggio >= 2) {
                pushSet();
                fineSetSound.play();
                mioPunteggio = 0;
                suoPunteggio = 0;
                cl.getView().byId("mieipunti").setText(mioPunteggio);
                cl.getView().byId("tuoipunti").setText(suoPunteggio);
                suoiset++;
                var sets = "";
                var rest = "";
                for (var i = 0; i < suoiset; i++)
                    sets += "\u2588 ";
                for (var i = betterThan; i > suoiset; i--)
                    rest += "\u2588 ";
                cl.getView().byId("suoisetvinti").setText(sets);
                cl.getView().byId("suoisetmancanti").setText(rest);
                if (suoiset > betterThan / 2) {
                    finePartita();
                }
            }
            save();
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
    });

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
            for (var i = 0; i < voices.length; i++) {
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
            ok = ok && !isNaN(parseInt(e));
        } else {
            ok = ok && command[i].includes(e);
        }
    });
    return ok;
}

		
			
function updatehtml(){
	var html = "";		
	htmlData.forEach(function(e){		
	html += "<tr><td>" + e + "</td></tr>";		
	});	
	html += "<tr><td>" + latestData + "</td></tr>";		
	mthis.getView().byId('htmlView').setContent("<table>" + html + "</table>");		
}
function parse(arr) {
    if(arr.length === 3){
    	if(!numeriPossibili.includes(parseInt(arr[0]))){
    		speak("Non hai nessun giocatore con quel numero");
    		return arr;
    	}
    	save();
    	pushAzione(arr[1], "" + parseInt(arr[0]), arr[2] === "brutto" ? 1 : (arr[2] === "bello" ? 2 : 3) );
    	latestData = "";
    	currentPunto.azione.forEach(function (i){
			var img = "";
			if(i.azione === "palleggio") img = "data:image/png;base64,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";
			else if(i.azione === "battuta") img = "data:image/png;base64,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";
			else if(i.azione === "bagher") img = "data:image/png;base64,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";
			else if(i.azione === "salvataggio") img = "data:image/png;base64,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";
			else if(i.azione === "muro") img = "data:image/png;base64,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";
			else if(i.azione === "schiacciata") img = "data:image/png;base64,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";
			
			var color = "";
			if(i.qualita === 1) color = "#F00"
			else if(i.qualita === 2) color = "#FF0"
			else if(i.qualita === 3) color = "#0C0"
			latestData += "<td><div style='padding-top: 10px; padding-bottom: 10px; width: 70px; height: 50px;border: 0;border-radius: 50%;background-color: #F00; font-size: 40px; color: white;text-align: center;text-decoration: none;z-index: 10;'>" + i.giocatore + "</div></td><td><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iNjRweCIgaGVpZ2h0PSI2NHB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im00MC40LDEyMS4zYy0wLjgsMC44LTEuOCwxLjItMi45LDEuMnMtMi4xLTAuNC0yLjktMS4yYy0xLjYtMS42LTEuNi00LjIgMC01LjhsNTEtNTEtNTEtNTFjLTEuNi0xLjYtMS42LTQuMiAwLTUuOCAxLjYtMS42IDQuMi0xLjYgNS44LDBsNTMuOSw1My45YzEuNiwxLjYgMS42LDQuMiAwLDUuOGwtNTMuOSw1My45eiIgZmlsbD0iIzAwMDAwMCIvPgogIDwvZz4KPC9zdmc+Cg=='/></td><td><div style='padding-top: 10px; padding-bottom: 10px; width: 70px; height: 50px;border: 0;border-radius: 50%;background-color: " + color + "; font-size: 40px; color: white;text-align: center;text-decoration: none;z-index: 10;'><img width='48' src='" + img + "'/></div></td><td><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iNjRweCIgaGVpZ2h0PSI2NHB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im00MC40LDEyMS4zYy0wLjgsMC44LTEuOCwxLjItMi45LDEuMnMtMi4xLTAuNC0yLjktMS4yYy0xLjYtMS42LTEuNi00LjIgMC01LjhsNTEtNTEtNTEtNTFjLTEuNi0xLjYtMS42LTQuMiAwLTUuOCAxLjYtMS42IDQuMi0xLjYgNS44LDBsNTMuOSw1My45YzEuNiwxLjYgMS42LDQuMiAwLDUuOGwtNTMuOSw1My45eiIgZmlsbD0iIzAwMDAwMCIvPgogIDwvZz4KPC9zdmc+Cg=='/></td>";
		})
		updatehtml();
    	
    }else if (arr.length === 2){
    	if(arr[1] === 'suo') addPuntoSuoFnc(mthis);
    	else addPuntoMioFnc(mthis);
    	
    	htmlData.push(latestData + "<td><table style='font-size: 24pt'><tr><td>" + mioPunteggio + "</td></tr><tr><td>" + suoPunteggio + "</td></tr></table></td></tr>");
    	latestData = "";
    	updatehtml();
    	
    }
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
	['zero', '0'],
	['una', '1']
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




sap.ui.define([
	"jquery.sap.global",
	'sap/m/MessageBox',
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
], function(jQuery, MessageBox, TextArea, Text,Image, Label, Input, Button, Dialog, List, HBox, VBox, StandardListItem, Controller, HTML, JSONModel, Busy, MessageToast) {
	"use strict";

	return Controller.extend("BVS.controller.GameSpeech", {
		onInit: function(evt){
			mthis = this;
			msBox = MessageBox;
			buttonn = Button;
            dialogg = Dialog;
            labell = Label;
            textareaa = TextArea;
            busy = Busy;
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("GameSpeech").attachMatched(this._onRouteMatched, this);
			
			
		},
		onAfterRendering: function(e){
			setTimeout(function(){
				sap.m.MessageToast.show("Per iniziare, scrivere il nome della squadra avversaria e premere il tasto di avvio", {
				    duration: 1700,
				    width: "25em",
				    my: "center",
				    at: "center"
				});
			}, 200);
			
			this.byId("pushToTalkButton").attachBrowserEvent("touchstart", function () {
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
			        if (last[0] === "punto") {
			            parse([last[0], mostSuitable(command[0], last[1])]);
			            return;
			        } else if (last[0] === "annulla"){
			        	if(!undo()) speak("impossibile annullare")
			        } else {
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
				        console.log(last)
				        if (!validate(last)) speak("ripeti")
				        else {
				        	parse(last.split(" "));
				        }
				        recognition.stop();
			        }
			    };
			    lastThread = recognition;
			    recognition.start();
			    document.body.style.backgroundColor = 'red';
			});
			this.byId("pushToTalkButton").attachBrowserEvent("touchend", function () {
				setTimeout(function(){
				    lastThread.stop();
				    document.body.style.backgroundColor = 'black';
				}, 250);
			});
			this.byId("pushToTalkButton").attachBrowserEvent("mouseup", function () {
				setTimeout(function(){
				    lastThread.stop();
				    document.body.style.backgroundColor = 'black';
				}, 250);
			});
			this.byId("pushToTalkButton").attachBrowserEvent("mousedown", function () {
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
			        if (last[0] === "punto") {
			            parse([last[0], mostSuitable(command[0], last[1])]);
			            return;
			        } else if (last[0] === "annulla"){
			        	if(!undo()) speak("impossibile annullare")
			        } else {
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
				        console.log(last)
				        if (!validate(last)) speak("ripeti")
				        else {
				        	parse(last.split(" "));
				        }
				        recognition.stop();
			        }
			    };
			    lastThread = recognition;
			    recognition.start();
			    document.body.style.backgroundColor = 'red';
			});
			this.byId("pushToTalkButton").attachBrowserEvent("touchend", function () {
				setTimeout(function(){
				    lastThread.stop();
				    document.body.style.backgroundColor = 'black';
				}, 250);
			});
			this.byId("pushToTalkButton").attachBrowserEvent("mouseup", function () {
				setTimeout(function(){
				    lastThread.stop();
				    document.body.style.backgroundColor = 'black';
				}, 250);
			});
		},
		_onRouteMatched: function (oEvent) {
            var oArgs, oQuery;
            oArgs = oEvent.getParameter("arguments");
            oQuery = oArgs["?query"];
            if (oQuery) {
                user = oQuery.username;
                giocatori = oQuery.giocatori;
                JSON.parse(giocatori).forEach(function(e){
                	numeriPossibili.push(parseInt(e.numero));
                });
                this.getView().byId("npp").setText(oQuery.squadra + " vs     ");
                squadra = oQuery.squadra;
            }
            
            
        },
        
        
        IniziaPartita: function () {
            mthis = this;
            if (mthis.getView().byId('avversari').getValue().length > 0) {
            	var WarningDialog = new Dialog({
				title: 'Attenzione',
				type: 'Message',
				state: 'Warning',
				content: new Text({text: 'Prima di iniziare a dare comandi vocali, assicurati di indossare degli auricolari con microfono isolato e di consultare la \"documentazione\" per la lista completa dei comandi.'}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						WarningDialog.close();
						mthis.byId("containerLayout").setEnabled(true);
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
            addPuntoMioFnc(this);
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
            addPuntoSuoFnc(this);
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
		onNavBack: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
        }
	});

});