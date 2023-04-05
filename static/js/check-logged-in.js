import * as ch from "./cookie-handler.js";

if(ch.getCookie("isLoggedIn") !== "True"){
    window.location.replace("/login");
}
