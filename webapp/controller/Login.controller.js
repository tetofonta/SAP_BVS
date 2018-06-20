/* global sha:true */
/* global _:true */

var session = false;

// dec2hex :: Integer -> String
function dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
function generateId (len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return btoa(Array.from(arr, dec2hex).join(''))
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
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

function getFromApi(res, prams, decode) {
	if(decode === undefined) decode = true;
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
    if(decode)
    	return JSON.parse(httpGet((apiHost + res).replace(" ", "%20")));
    else
    	return httpGet((apiHost + res).replace(" ", "%20"));
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
    httpGetAsync((apiHost + res).replace(" ", "%20"), function(data){
    	cb(JSON.parse(data));
    }, prams);
    
}

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./sha"
], function (Controller, sha) {
    "use strict";

    return Controller.extend("BVS.controller.Login", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf BVS.view.Login
         */
        // onInit: function() {

        // },

        doLogin: function () {
        	
            var user = this.getView().byId("username").getValue();
            var passwd = sha512(this.getView().byId("password").getValue());
            var rnd = getFromApi("getRandom", {user: user}, false);
            
            console.log([rnd, passwd, user, sha512(rnd + passwd)]);
            
            var res = getFromApi("auth", {username: user, key: sha512(rnd + passwd)});
            if(res.result) sap.ui.core.UIComponent.getRouterFor(this).navTo("Home", {
        		query:{
        			username: user,
        		}
        	});
            else this.getView().byId("enterBtn").setText("Hai sbagliato");
        },

        openAbout: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("About");
        }

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf BVS.view.Login
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf BVS.view.Login
         */
    // 	onAfterRendering: function() {
    // 		this.webAuth = new auth0.WebAuth({
			 //   domain: 'bettervollwyscouting.eu.auth0.com',
			 //   clientID: '0VXoYHuupLbMmfNjEOhZIcGoQoVtHhx2',
			 //   responseType: 'token id_token',
			 //   audience: 'https://bettervollwyscouting.eu.auth0.com/userinfo',
			 //   scope: 'openid',
			 //   redirectUri: "https://sapbvs-p2000122943trial.dispatcher.hanatrial.ondemand.com/index.html?hc_reset#/Home"
		  //});
    // 	}

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf BVS.view.Login
         */
        //	onExit: function() {
        //
        //	}

    });

});
