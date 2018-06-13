function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

var getTeams = "getTeams";
var getSavedMatches = "getSavedMatches";
var getPlayer = "getPlayer";

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
    return JSON.parse(httpGet((apiHost + res).replace(" ", "%20")));
}

sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
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
            if (oQuery){
            	squadraPlayer = oQuery.squadra;
	            numeroPlayer = oQuery.numero;
	            sap.ui.core.BusyIndicator.show(0);
	            var mthis = this;
	            setTimeout(function(){
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
	            }, 0)
            }
        }

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
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf BVS.view.Player
         */
        //	onExit: function() {
        //
        //	}

    });

});