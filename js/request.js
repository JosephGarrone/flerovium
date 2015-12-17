function Request() {

}

Request.get = function(url, f) {
    var xhr = Request.getXHR();
    if (url.indexOf("?") > -1) {
        url = url + "&uniq="  + Math.floor((Math.random() * 10000000) + 1);
    } else {
        url = url + "?uniq="  + Math.floor((Math.random() * 10000000) + 1);
    }
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function(evt) {
        f(this.response);
    };
    xhr.send();
};

Request.post = function(url, f) {
    var xhr = Request.getXHR();
    if (url.indexOf("?") > -1) {
        url = url + "&uniq="  + Math.floor((Math.random() * 10000000) + 1);
    } else {
        url = url + "?uniq="  + Math.floor((Math.random() * 10000000) + 1);
    }
    xhr.open("POST", url, true);
    xhr.responseType = "json";
    xhr.onload = function(evt) {
        f(this.response);
    };
    xhr.send();
};

Request.getXHR = function() {
    var XMLHttpFactories = [
        function () {return new XMLHttpRequest()},
        function () {return new ActiveXObject("Msxml2.XMLHTTP")},
        function () {return new ActiveXObject("Msxml3.XMLHTTP")},
        function () {return new ActiveXObject("Microsoft.XMLHTTP")}
    ];
    var xhr = null;
    for (var i=0;i<XMLHttpFactories.length;i++) {
        try { xhr = XMLHttpFactories[i](); }
        catch (e) { continue; }
        break;
    }
    if (!xhr)
        throw Error("XMLHttpRequest is not supported");
    return xhr;
};