let jwt_token = getCookie("auth_token")
const xhr = new XMLHttpRequest();
const sign_out_button = document.getElementById("signOut")
const sign_in_button = document.getElementById("login")
const account_button = document.getElementById("account")

xhr.open("POST", "/api/v1/users/validate")
xhr.onload = function (event){
    if (event.target.response !== "true"){
        isLoggedOut()
    }
    else {
        isLoggedIn()
    }
}
xhr.send(jwt_token)
function isLoggedIn(){
    if(window.location.pathname === "/login" || window.location.pathname === "/signup"){
        window.location.replace("/")
    }

    // If sign out button is disabled, then enable it
    if (sign_out_button.classList.contains("disabled")){
        sign_out_button.classList.remove("disabled")
    }
    // If sign in button is enabled, then disable it
    if (!sign_in_button.classList.contains("disabled")){
        sign_in_button.classList.add("disabled")
    }
    // If account button is disabled, then able it
    if (account_button.classList.contains("disabled")){
        account_button.classList.remove("disabled")
    }
}
function isLoggedOut(){
    // If on account page when logged out then redirect to log in page.
    if (window.location.pathname === "/account"){
        window.location.replace("/login")
    }

    // If sign out button is not disabled, then disable it
    if (!sign_out_button.classList.contains("disabled")){
        sign_out_button.classList.add("disabled")
    }

    // If sign in button is disabled, then enable it
    if (sign_in_button.classList.contains("disabled")){
        sign_in_button.classList.remove("disabled")
    }

    // If account button is not disabled, then disable it.
    if (!account_button.classList.contains("disabled")){
        account_button.classList.add("disabled")
    }
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
