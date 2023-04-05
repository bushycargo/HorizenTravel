function validatePassword(){
    let password = document.getElementById("password");
    let password_confirmation = document.getElementById("confirm_password");
    let signup_form = document.getElementById("signup-form");
    if(password.value !== password_confirmation.value){
        window.alert("Passwords do not match!");
    }
    else if(password.value.length < 8){
        window.alert("Password needs to be longer than 8 characters.")
    }
    else {
        signup_form.submit();
    }
}