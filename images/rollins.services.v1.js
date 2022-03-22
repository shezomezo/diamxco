/* File Created: January 26, 2012 */

var rolClientV1 = {

    endpointUrl: ((document.location.host.indexOf("localhost") == 0)
        ? document.location.protocol + "//" + document.location.host + "/"
        : document.location.protocol + "//locator.rollins.com/") + "",

    jsonp: function (url) {
        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        document.body.appendChild(script);
    },

    doCmd: function (cmd, waitFunc, callback, args) {
        if (waitFunc)
            waitFunc();
        var url = this.endpointUrl + cmd + "?callback=" + callback;
        for (var key in args) {
            if (!args.hasOwnProperty(key)) continue;
            url += "&" + escape(key) + "=" + escape(args[key]);
        }
        this.jsonp(url);
    },

    doCmdFromForm: function (cmd, waitFunc, callback, argsForm) {
        var args = [];
        for (i = 0; i < argsForm.elements.length; i++) {
            var field = argsForm.elements[i];
            args[field.name] = field.value;
        }
        this.doCmd(cmd, waitFunc, callback, args);
    }
};