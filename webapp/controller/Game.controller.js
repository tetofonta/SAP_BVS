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
var overSound = new Audio("over.ogg");
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
var topSet = 25;
var betterThan = 5;
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
	mthis.ciaoDialog.close();
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
				press: function() {
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
	
	console.log(mthis.getView())
	mthis.getView()._xContent.innerHTML = "<mvc:View xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" controllerName=\"ProvaVolley.controller.Riepilogo\" xmlns:html=\"http://www.w3.org/1999/xhtml\"> <App><pages><Page title=\"Title\"><content></content></Page></pages></App></mvc:View>";
}

function finePartita() {
	setTimeout(function() {
		fineSound.play();
	}, 1502);
	$("#confetti").css("display", "block");

	if (!mthis.ciaoDialog) {
		mthis.ciaoDialog = new dialogg({
			title: "Partita terminata!",
			content: lay,
			beginButton: new buttonn({
				text: "Close",
				press: function() {
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
	pushAzione("Battuta", getNumeroGiocatore($("#" + mthis.getView().createId("g6")).get()[0]), 1);
	dialogo.close();
}

function battutamah() {
	annulla = true;
	abilitaChiNonBatte();
	pushAzione("Battuta", getNumeroGiocatore($("#" + mthis.getView().createId("g6")).get()[0]), 2);
	dialogo.close();
}

function battutawow() {
	annulla = true;
	abilitaChiNonBatte();
	pushAzione("Battuta", getNumeroGiocatore($("#" + mthis.getView().createId("g6")).get()[0]), 3);
	dialogo.close();
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

function gira() {
	var temp = getNumeroGiocatore($("#" + mthis.getView().createId("g1")).get()[0]);
	for (var i = 1; i < 6; i++) {
		var passivo = $("#" + mthis.getView().createId("g" + i)).get()[0];
		var attivo = $("#" + mthis.getView().createId("g" + (i + 1))).get()[0];
		passivo.childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = getNumeroGiocatore(attivo);
	}
	$("#" + mthis.getView().createId("g6")).get()[0].childNodes.item(0).childNodes.item(0).childNodes.item(0).innerHTML = temp;
	var gaffu = bottoni[0].numero;
	for (var i = 0; i < 5; i++) {
		bottoni[i].numero = bottoni[i + 1].numero;
	}
	bottoni[5].numero = gaffu;
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
var bottoni = [];

function find(a) {
	var i;
	for (i = 0; i < 6; i++) {
		if (bottoni[i].numero === a)
			break;
	}
	return i;
}

function disabilitaChiNonBatte() {
	for (var k = 1; k <= 6; k++) {
		$("#" + mthis.getView().createId("g" + k)).draggable('disable');
		if (k !== 6) $("#" + mthis.getView().createId("g" + k)).css('opacity', '.55');
	}
}

sap.ui.define([
	"jquery.sap.global",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/StandardListItem",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/HTML",
	"sap/ui/model/json/JSONModel"
], function(jQuery, Button, Dialog, List, HBox, VBox, StandardListItem, Controller, HTML, JSONModel) {
	"use strict";

	return Controller.extend("BVS.controller.Game", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf BVS.view.Game
		 */
			onInit: function() {
				buttonn = Button;
				dialogg = Dialog;
	
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
			onAfterRendering: function() {
				mthis = this;
				var btn;
				var thisBtn;
				var foo = this;
	
				this.byId("view").attachBrowserEvent("mouseup", function() {
					for (var t = 1; t <= 6; t++) {
						if ($("#" + foo.getView().createId("g" + t)).css("opacity") !== "0.55" || annulla) {
							//alert($("#" + foo.getView().createId("g" + t)).css("opacity"));
							$("#" + foo.getView().createId("g" + t)).css("opacity", "1"); //Rimetti l'opacità ai giocatori
						}
					}
					setTimeout(function() {
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
					this.getView().byId("g" + k).attachBrowserEvent("taphold", function(a) {
						var i = find(a.target.innerHTML);
						cambiando = bottoni[i].ref;
	
						if (cambiando === foo.getView().byId("g6")) battuta.setVisible(true);
						else battuta.setVisible(false);
	
						cambiando_idx = i;
						if (!mistannospostando) {
							if (!foo.pressDialog) {
								foo.pressDialog = new Dialog({
									title: "Possibili cambi",
									content: panchina_selector,
									beginButton: new Button({
										text: "Close",
										press: function() {
											foo.pressDialog.close();
										}.bind(foo)
									})
								});
								dialogo = foo.pressDialog;
								//to get access to the global model
								foo.getView().addDependent(this.pressDialog);
							}
							foo.pressDialog.open();
						}
					});
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
						drag: function(event, ui) {
							mistannospostando = true;
							thisBtn = event.target;
							for (var j = 1; j <= 6; j++) {
								if (foo.getView().createId("g" + j) !== event.target.id) {
									//Se il giocatore non è lo stesso che ho selezionato
									$("#" + foo.getView().createId("g" + j)).css("opacity", ".3"); //Cambia l'opacità del giocatore
								}
							}
						}
					});
				}
				$("#" + this.getView().createId("muroBtn") + "-inner").droppable({
					over: function(event, ui) {
						currentAzione = MURO;
						$("#" + thisBtn.id).css("opacity", "0");
						$("#" + foo.getView().createId("top1")).fadeIn();
						$("#" + foo.getView().createId("top2")).fadeIn();
						$("#" + foo.getView().createId("top3")).fadeIn();
						hideOver(".punteggio3");
					}
				});
				$("#" + this.getView().createId("schiacciataBtn") + "-inner").droppable({
					over: function(event, ui) {
						currentAzione = SCHIACCIATA;
						$("#" + thisBtn.id).css("opacity", "0");
						$("#" + foo.getView().createId("top1")).fadeIn();
						$("#" + foo.getView().createId("top2")).fadeIn();
						$("#" + foo.getView().createId("top3")).fadeIn();
						hideOver(".punteggio3");
					}
				});
				$("#" + this.getView().createId("palleggioBtn") + "-inner").droppable({
					over: function(event, ui) {
						currentAzione = PALLEGGIO;
						$("#" + thisBtn.id).css("opacity", "0");
						$("#" + foo.getView().createId("left1")).fadeIn();
						$("#" + foo.getView().createId("left2")).fadeIn();
						$("#" + foo.getView().createId("left3")).fadeIn();
						hideOver(".punteggio1");
					}
				});
				$("#" + this.getView().createId("palleggio1Btn") + "-inner").droppable({
					over: function(event, ui) {
						currentAzione = PALLEGGIO;
						$("#" + thisBtn.id).css("opacity", "0");
						$("#" + foo.getView().createId("right1")).fadeIn();
						$("#" + foo.getView().createId("right2")).fadeIn();
						$("#" + foo.getView().createId("right3")).fadeIn();
						hideOver(".punteggio2");
					}
				});
				$("#" + this.getView().createId("bagherBtn") + "-inner").droppable({
					over: function(event, ui) {
						currentAzione = BAGHER;
						$("#" + thisBtn.id).css("opacity", "0");
						$("#" + foo.getView().createId("bottom1")).fadeIn();
						$("#" + foo.getView().createId("bottom2")).fadeIn();
						$("#" + foo.getView().createId("bottom3")).fadeIn();
						hideOver(".punteggio4");
					}
				});
				$("#" + this.getView().createId("tuffoBtn") + "-inner").droppable({
					over: function(event, ui) {
						currentAzione = SALVATAGGIO;
						$("#" + thisBtn.id).css("opacity", "0");
						$("#" + foo.getView().createId("bottom1")).fadeIn();
						$("#" + foo.getView().createId("bottom2")).fadeIn();
						$("#" + foo.getView().createId("bottom3")).fadeIn();
						hideOver(".punteggio4");
					}
				});
				$("#" + this.getView().createId("left1") + "-inner").droppable({
					//Male
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 1);
					}
				});
				$("#" + this.getView().createId("left2") + "-inner").droppable({
					//Buono
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 2);
					}
				});
				$("#" + this.getView().createId("left3") + "-inner").droppable({
					//Ottimo
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 3);
					}
				});
				$("#" + this.getView().createId("right1") + "-inner").droppable({
					//Male
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 1);
					}
				});
				$("#" + this.getView().createId("right2") + "-inner").droppable({
					//Buono
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 2);
					}
				});
				$("#" + this.getView().createId("right3") + "-inner").droppable({
					//Ottimo
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 3);
					}
				});
				$("#" + this.getView().createId("top1") + "-inner").droppable({
					//Male
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 1);
					}
				});
				$("#" + this.getView().createId("top2") + "-inner").droppable({
					//Buono
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 2);
					}
				});
				$("#" + this.getView().createId("top3") + "-inner").droppable({
					//Ottimo
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 3);
					}
				});
				$("#" + this.getView().createId("bottom1") + "-inner").droppable({
					//Male
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 1);
					}
				});
				$("#" + this.getView().createId("bottom2") + "-inner").droppable({
					//Buono
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 2);
					}
				});
				$("#" + this.getView().createId("bottom3") + "-inner").droppable({
					//Ottimo
					drop: function(event, ui) {
						pushAzione(currentAzione, getNumeroGiocatore(thisBtn), 3);
					}
				});
			},
			
			_onRouteMatched : function (oEvent) {
				var oArgs, oView, oQuery;
				oArgs = oEvent.getParameter("arguments");
				oQuery = oArgs["?query"];
				if (oQuery)
					console.log(oQuery);
	
			},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf BVS.view.Game
		 */
		//	onExit: function() {
		//
		//	}

	});

});