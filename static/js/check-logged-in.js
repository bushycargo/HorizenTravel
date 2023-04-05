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

let auth_token = getCookie("auth_token")
const xhr = new XMLHttpRequest();

xhr.open("POST", "/api/v1/users/validate")
xhr.onload = function (event){
    if (event.target.response !== "true"){
        window.location.replace("/login");
    }
}
xhr.send(auth_token)