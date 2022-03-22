// Avoid `console` errors in browsers that lack a console.
// HTML5 Boilerplate template
(function () {
    var method;
    var noop = function () { };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

function supports_html5_storage() {
    try {
        var supported = ('localStorage' in window && window['localStorage']);
        if (supported) {
            localStorage.setItem("storage", "");
            localStorage.removeItem("storage");
            return supported;
        }
    } catch (e) {
        return false;
    }
}

function supports_html5_validation() {
    return typeof document.createElement("input").checkValidity == "function";
}

// http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
function UpdateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "gi");

    if (url.match(re)) {
        if (value)
            return url.replace(re, '$1' + key + "=" + value + '$2');
        else
            return url.replace(re, '$2');
    }
    else {
        if (value) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?',
                hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (hash[1]) url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}

// Function not in utility class in order to allow this javascript library to be stand-alone.
function getURLParameter(name, url) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    if (!url) {
        url = window.location.href;
    }
    var results = regex.exec(url);
    if (results == null) {
        return "";
    }
    else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}
