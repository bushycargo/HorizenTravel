import * as ch from "./cookie-handler.js";

if(ch.getCookie("isLoggedIn") !== "True"){
    window.location.replace("/login");
}

function change_email_box() {
    const element = document.getElementById("js-dom-point");
    element.innerHTML = `
    <div class="login">
        <h1>Change Email</h1>
        <form method="post" action="">
            <p><input class="signup-form-input" type="email" name="new_email" value="" placeholder="New Email" required></p>
            <p><input class="signup-form-input" type="password" name="password" value="" placeholder="Password" required></p>
            <hr>
            <p class="submit"><input type="submit" name="commit" value="Change Email"></p>
        </form>
    </div>
    `;
}

function change_password_box(){
    const element = document.getElementById("js-dom-point");
    element.innerHTML = `
    <div class="login">
        <h1>Change Password</h1>
        <form method="post" action="">
            <p><input class="signup-form-input" type="password" name="old_password" value="" placeholder="Old Password" required></p>
            <p><input class="signup-form-input" type="password" name="new_password" value="" placeholder="New Password" required></p>
            <hr>
            <p class="submit"><input type="submit" name="commit" value="Change Password"></p>
        </form>
    </div>
    `;
}