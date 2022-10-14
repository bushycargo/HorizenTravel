function signOut(){
    document.getElementById("account").classList.add("disabled");
    document.getElementById("signOut").classList.add("disabled");
    document.getElementById("login").classList.remove("disabled");
}
function login(){
    document.getElementById("account").classList.remove("disabled");
    document.getElementById("signOut").classList.remove("disabled");
    document.getElementById("login").classList.add("disabled");
}