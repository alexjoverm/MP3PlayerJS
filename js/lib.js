var lib = {};

(function (window) {
    lib.log = function(text) {
        $('#output')[0].innerHTML += text + '<br/>';
    };

}(window));

