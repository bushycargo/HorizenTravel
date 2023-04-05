import * as ch from "./cookie-handler.js";

let auth_token = ch.getCookie("auth_token")
const xhr = new XMLHttpRequest();

xhr.open("POST", "/api/v1/users/validate")
xhr.onload = function (event){
    if (event.target.response !== "true"){
        window.location.replace("/login");
    }
}
xhr.send(auth_token)