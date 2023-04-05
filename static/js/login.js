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
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
    }
    if (remember_me){
        setCookie("auth_token", response, 365)
    }
    else {
        setCookie("auth_token", response, 1)
    }
    window.location.replace("/account")
}