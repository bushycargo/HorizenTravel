
let auth_token = getCookie("auth_token")

if (auth_token !== ""){
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/v1/users/validate")
    xhr.onload = function (event){
        if (event.target.response === "true"){
            window.location.replace("/account");
        }
    }
    xhr.send(auth_token)
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
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
}
function loginRequest() {
    const login_form = document.getElementById("login-form");
    const formData = new FormData(login_form)
    const xhr = new XMLHttpRequest();
    let remember_me = false
    if (formData.get('remember_me') === 'on'){
        remember_me = true
    }
    xhr.open("POST", "/api/v1/users/login")
    xhr.onload = function (event){
        responseHandler(event.target.response, remember_me)
    //     Expect a JWT Token response
    }

    xhr.send(formData)
}
function responseHandler(response, remember_me){
    if (response === "Invalid Login"){
        alert("Invalid Login")
        return
    }
    if (remember_me){
        setCookie("auth_token", response, 365)
    }
    else {
        setCookie("auth_token", response, 1)
    }
    window.location.replace("/account")
}