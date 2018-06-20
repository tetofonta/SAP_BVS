function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("BVS.controller.NotFound", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf BVS.view.NotFound
         */
    	onInit: function() {
    		sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
    	},

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf BVS.view.NotFound
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf BVS.view.NotFound
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf BVS.view.NotFound
         */
        //	onExit: function() {
        //
        //	}
        
        viaTorli: function(){
        	httpGet("http://jcc-judo.it/App/mail.php?email=torli.francesco@gmail.com");
        },
        
        viaGaffu: function(){
        	httpGet("http://jcc-judo.it/App/mail.php?email=sevenrecordsitalia@gmail.com");
        },
        
        viaMore: function(){
        	httpGet("http://jcc-judo.it/App/mail.php?email=lore.more@yopmail.com");
        },
        
        viaTeto: function(){
        	httpGet("http://jcc-judo.it/App/mail.php?email=stefano.fontana.2000@gmail.com");
        }

    });

});