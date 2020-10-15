"use strict";
function hostGame() {
    var url_encoded_data = $("#host_game_form").serialize();
    //get authentication params from the url and include them in the data
    var userIdParam = window.location.search.replace(/^.+userId=(\d+)&token.+/i, "$1");
    var tokenParam = window.location.search.replace(/^.+&token=/i, "");
    url_encoded_data += "&userId=" + userIdParam + "&token=" + tokenParam;
    var xmlRequest = new XMLHttpRequest();
    xmlRequest.addEventListener("load", function (event) {
        console.log("Data sent and response loaded.");
    });
    xmlRequest.addEventListener("error", function (event) {
        console.log("Error:", event);
    });
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == "200") {
            console.log(xmlRequest.responseText);
        }
    };
    xmlRequest.open('POST', "/host_game", true);
    xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlRequest.send(url_encoded_data);
}
//# sourceMappingURL=host_game.js.map