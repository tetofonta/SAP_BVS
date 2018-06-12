sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/ui/model/json/JSONModel'],
    function (Controller, JSONModel) {
        "use strict";
        return Controller.extend("sap.m.sample.FormattedText.C", {
            onInit: function () {

                // HTML string bound to the formatted text control
                var oModel = new JSONModel({
                    HTML: "<h2>" +
                    "<strong>Better Volley Scouting</strong>" +
                    "</h2>" +
                    "<p>App creata da:</p>" +
                    "<ul>" +
                    "<li>" +
                    "<strong>Francesco Torli</strong>" +
                    "</li>" +
                    "<li>" +
                    "<strong>Lorenzo Moreschi</strong>" +
                    "</li>" +
                    "<li>" +
                    "<strong>Simone Gaffurini</strong>" +
                    "</li>" +
                    "<li>" +
                    "<strong>Stefano Fontana</strong>" +
                    "</li>" +
                    "</ul>" +
                    "<p>Studenti dell'ITIS Castelli di Brescia.</p>" +
                    "<p>Stage 2017/2018.</p>" +
                    "<p>Documentazione:" +
                    "<a title='Documentazione' href='https://goo.gl/JhMymi' target='_blank'>https://goo.gl/JhMymi</a>" +
                    "</p>"
                });
                this.getView().setModel(oModel);
            }
        });
    });