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

function getZero(obj){
	var o = JSON.parse(JSON.stringify(obj));
	o.count = 0;
	return o;
}

var getTeams = "getTeams";
var getSavedMatches = "getSavedMatches";
var getPlayer = "getPlayer";
var setPlayer = "setPlayer";
var addPlayer = "addPlayer";
var addTeam = "addTeam";
var getPlayerReport = "getPlayerReport";

var squadraPlayer = "";
var numeroPlayer = "";

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
    //console.log(res);
    return JSON.parse(httpGet((apiHost + res).replace(" ", "%20")));
}

var user = "";

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/ui/model/json/JSONModel',
    'sap/m/Text',
    'sap/m/MessageToast'
], function (Controller, Button, Dialog, JSONModel, Text, MessageToast) {
    "use strict";

    return Controller.extend("BVS.controller.Player", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf BVS.view.Player
         */
        onInit: function () {
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("Player").attachMatched(this._onRouteMatched, this);

            //this.getView().byId('profilePic').setSrc(getFromApi(getPlayer, {NUMERO: numeroPlayer, SQUADRA: squadraPlayer}));
            //console.log(getFromApi(getPlayer, {NUMERO: numeroPlayer, SQUADRA: squadraPlayer}));
        },
        _onRouteMatched: function (oEvent) {
            var oArgs, oQuery;
            oArgs = oEvent.getParameter("arguments");
            oQuery = oArgs["?query"];
            if (oQuery) {
            	user = oQuery.username;
                squadraPlayer = oQuery.squadra;
                numeroPlayer = oQuery.numero;
                var lol = getFromApi(getPlayerReport, {NUMERO: numeroPlayer, SQUADRA: squadraPlayer});
                //console.log(lol);
                var oModel_w;
            	var chrono = [];
            	var k = 0;
            	// lol.single.forEach(function(e){
            	// 	e.forEach(function (i){
            	// 		chrono.push({
            	// 			azione: i.azione,
            	// 			incremental: k++,
            	// 			opt: parseInt(i.qualita, 10)
            	// 		});
            	// 	})
            	// 	// str += e[e.length - 1].puntinostri + " " + e[e.length - 1].puntiloro;
            	// })
					oModel_w = new JSONModel({
						global: lol.byplayer[Object.keys(lol.byplayer)[0]],
						chrono: chrono
					}, true);
					
					oModel_w.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
					this.getView().setModel(oModel_w);
				//this.getView().byId('profilePic').setSrc('https://i.imgur.com/oUsxIhd.png');
                if (numeroPlayer === "null") {
                		this.getView().byId('profilePic').setSrc("https://i.imgur.com/oUsxIhd.png");
	                    this.getView().byId('nomecognomeField').setValue("");
	                    this.getView().byId('numeroField').setValue("");
	                    this.getView().byId('datanascitaField').setValue("");
                	if(squadraPlayer === "null"){ //AGGIUNGI SQUADRA
                		this.getView().byId('squadraField').setEnabled(true);
                		this.getView().byId("multiBtn").setText("Aggiungi squadra");
                		this.getView().byId('squadraField').setValue("");
	                    this.getView().byId("multiBtn").setIcon("sap-icon://add-activity");
                	}else{ //NEW PLAYER
                		this.getView().byId('squadraField').setEnabled(false);
                		this.getView().byId('squadraField').setValue(squadraPlayer);
                		this.getView().byId("multiBtn").setText("Aggiungi giocatore");
	                    this.getView().byId("multiBtn").setIcon("sap-icon://add");
                	}
                } else { //EDIT PLAYER
                    sap.ui.core.BusyIndicator.show(0);
                    this.getView().byId('squadraField').setEnabled(false);
                    this.getView().byId("multiBtn").setText("Modifica giocatore");
                    this.getView().byId("multiBtn").setIcon("sap-icon://edit");
                    var mthis = this;
                    setTimeout(function () {
                    	mthis.getView().byId('squadraField').setValue(squadraPlayer);
                        mthis.getView().byId('profilePic').setSrc(getFromApi(getPlayer, {
                            NUMERO: numeroPlayer,
                            SQUADRA: squadraPlayer
                        })[0].foto);
                        mthis.getView().byId('nomecognomeField').setValue(getFromApi(getPlayer, {
                            NUMERO: numeroPlayer,
                            SQUADRA: squadraPlayer
                        })[0].nome);
                        mthis.getView().byId('numeroField').setValue(getFromApi(getPlayer, {
                            NUMERO: numeroPlayer,
                            SQUADRA: squadraPlayer
                        })[0].numero);
                        mthis.getView().byId('datanascitaField').setValue(getFromApi(getPlayer, {
                            NUMERO: numeroPlayer,
                            SQUADRA: squadraPlayer
                        })[0].data_di_nascita);
                        sap.ui.core.BusyIndicator.hide();
                    }, 0);
                }
			
            }
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf BVS.view.Player
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf BVS.view.Player
         */

        onAfterRendering: function () {
            var loadFile = this.getView().createId("inFile");
            $('#' + loadFile).append('<input id="myfile" type="file" accept="image/gif, image/jpeg, image/png" onchange="readURL(this);" />');
        	
        },
        onNavBack: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
        },

        multiBtn: function () {
			if(this.getView().byId('numeroField').getValue().length>2){
				MessageToast.show("Il numero del giocatore supera le due cifre.");
			}else{
				if($('#__component0---player--profilePic')[0].src.includes('loading.gif')){
					MessageToast.show("Sto ancora caricando la foto. Attendere.");
				}else{
	            if (numeroPlayer === "null") {
	            	if(squadraPlayer === "null"){ //AGGIUNGI SQUADRA
	            		var addableTeam = getFromApi(addTeam, {
		                    NOME: this.getView().byId('nomecognomeField').getValue(),
		                    NUMERO: this.getView().byId('numeroField').getValue(),
		                    SQUADRA: this.getView().byId('squadraField').getValue(),
		                    FOTO: $('#__component0---player--profilePic')[0].src,
		                    DATANASCITA: this.getView().byId('datanascitaField').getValue()
		                });
		                if (!addableTeam) {
		                    var dialog = new Dialog({
		                        title: 'Errore',
		                        type: 'Message',
		                        state: 'Error',
		                        content: new Text({
		                            text: 'Esiste già una squadra con lo stesso nome.'
		                        }),
		                        beginButton: new Button({
		                            text: 'OK',
		                            press: function () {
		                                dialog.close();
		                            }
		                        }),
		                        afterClose: function () {
		                            dialog.destroy();
		                        }
		                    });
		                    dialog.open();
		                }else {
		                    sap.ui.core.UIComponent.getRouterFor(this).navTo("Home", {
		                        query: {
		                            newTeam: true,
		                            newTeamName: this.getView().byId('squadraField').getValue(),
		                            username: user
		                        }
		                    });
		                }
	            	}else{//NEW PLAYER
		                var addablePlayer = getFromApi(addPlayer, {
		                    NOME: this.getView().byId('nomecognomeField').getValue(),
		                    NUMERO: this.getView().byId('numeroField').getValue(),
		                    SQUADRA: squadraPlayer,
		                    FOTO: $('#__component0---player--profilePic')[0].src,
		                    DATANASCITA: this.getView().byId('datanascitaField').getValue()
		                });
		                if (!addablePlayer) {
		                    var dialog = new Dialog({
		                        title: 'Errore',
		                        type: 'Message',
		                        state: 'Error',
		                        content: new Text({
		                            text: 'Il numero del giocatore è già presente in questa rosa.'
		                        }),
		                        beginButton: new Button({
		                            text: 'OK',
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
		                    sap.ui.core.UIComponent.getRouterFor(this).navTo("Home", {
		                        query: {
		                            refreshTeam: true,
		                            username: user
		                        }
		                    });
		                }
	            	}
	            } else {//EDIT
	            		getFromApi(setPlayer, {
		                    NOME: this.getView().byId('nomecognomeField').getValue(),
		                    NUMERO: this.getView().byId('numeroField').getValue(),
		                    NUMEROVECCHIO: numeroPlayer,
		                    SQUADRA: squadraPlayer,
		                    FOTO: $('#__component0---player--profilePic')[0].src,
		                    DATANASCITA: this.getView().byId('datanascitaField').getValue()
		                });
		                sap.ui.core.UIComponent.getRouterFor(this).navTo("Home", {
		                    query: {
		                        refreshTeam: true,
		                        username: user
		                    }
		                });
	            }
				}
			}
        }



        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf BVS.view.Player
         */
        //	onExit: function() {
        //
        //	}

    });

});