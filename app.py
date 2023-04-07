import json
import time

import bcrypt
import jwt
from flask import Flask, render_template, request, redirect, make_response
from jwt import InvalidSignatureError

from dbfunc import DatabaseHandler

# Notes
# Max 120 seats/plane


app = Flask(__name__)

Database = DatabaseHandler()
Database.connect()
print("Connection Test Completed")
Database.disconnect()


# Template Routes
@app.route('/')
def index():
    return render_template("index.html")


@app.route('/about')
def about():  # put application's code here
    return render_template("about.html")


@app.route('/book')
def book():  # put application's code here
    return render_template("book.html")


@app.route('/account')
def account():
    return render_template("account.html")


@app.route('/login')
def loginPage():
    return render_template("login.html")


@app.route('/signup')
def signupPage():
    return render_template("signup.html")


# API- todo
api = '/api/v1/'


@app.route(api + 'get/airports')
def getAirports():
    Database.connect()
    airports = Database.runSQL("SELECT t.* FROM `jh-horizen-travel`.airport t")
    Database.disconnect()
    response = make_response(json.dumps(airports))
    response.headers['Content-Type'] = 'application/json'
    return response


@app.route(api + 'search', methods=['POST'])
def searchFlights():
    # Needs either origin or destination in airport code (e.g. BHX)
    origin = request.form.get("origin_airport")
    destination = request.form.get("destination_airport")
    passengers = request.form.get("total_adults") + request.form.get("total_children")
    if destination == "":
        destination = None
    if origin == "":
        origin = None

    Database.connect()
    if destination is None:  # If destination is empty then it must be an origin only search
        output = Database.runSQL(
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = '{origin}' ORDER BY flightNumber")
    elif origin is None:  # If origin is empty then it must be a destination only search
        output = Database.runSQL(
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE destination = '{destination}' ORDER BY flightNumber")
    else:
        output = Database.runSQL(
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = '{origin}' AND destination = '{destination}' "
            f"ORDER BY flightNumber")

    flight_data = []
    for flight in output:
        if flight[5] > int(passengers):
            flight_data.insert(0, flight)

    Database.disconnect()  # Disconnect Database
    response = make_response(json.dumps(flight_data))
    response.headers['Content-Type'] = 'application/json'
    return response


@app.route(api + "book/new", methods=['POST'])
def bookFlight():
    auth_token = request.cookies.get("auth_token")
    if validateJWT(auth_token) == "false":
        return "Invalid Auth Token"

    user_id = jwt.decode(auth_token, options={"verify_signature": False}).get("sub")
    flight_number = request.json['flight_number']
    passengers = request.json['passengers']

    Database.connect()
    current_bookings = \
        Database.runSQL(f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE flightNumber = {flight_number}")[0][5]
    if current_bookings < passengers:
        return "Invalid Number of Passengers"
    else:
        Database.runSQL(
            f"UPDATE `jh-horizen-travel`.flight t SET t.bookings = {current_bookings - passengers} WHERE t.flightNumber = {flight_number}")
        Database.runSQL(
            f"INSERT INTO `jh-horizen-travel`.booking (user_id, flight_number, passengers) VALUES ({user_id}, {flight_number}, {passengers})")
        print(f"Created new booking for user: {user_id}")
        Database.disconnect()
        return "200"


@app.route(api + 'users/login', methods=['POST'])
def loginUser():
    username = request.form.get("username")
    password = request.form.get("password")
    remember_me = request.form.get("remember_me")
    return generateJWT(username, password, remember_me)


@app.route(api + 'users/validate', methods=['POST'])
def validateLogin():
    return validateJWT(request.get_data().decode('utf-8'))


def generateJWT(username, password, remember_me):
    db_on = False
    if not Database.dbconnection.is_connected():
        Database.connect()
        db_on = True

    user_id = Database.runSQL(f"SELECT t.user_id FROM `jh-horizen-travel`.user t WHERE username = '{username}'")[0][0]

    try:
        hashed_password = \
            Database.runSQL(f"SELECT t.password FROM `jh-horizen-travel`.user t WHERE username = '{username}'")[0][0]
    except IndexError:
        return "Invalid Login"

    if db_on:
        Database.disconnect()

    if bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8")):
        if remember_me == "on":
            payload_data = {
                "sub": f"{user_id}",
                "username": f"{username}",
                "exp": time.time() + 86400 * 365
            }
        else:
            payload_data = {
                "sub": f"{user_id}",
                "username": f"{username}",
                "exp": time.time() + 86400
            }

        auth_token = jwt.encode(
            payload=payload_data,
            key=hashed_password
        )
        return auth_token
    else:
        return "Invalid Login"


def validateJWT(data):
    try:
        unverified_decoded = jwt.decode(data, options={"verify_signature": False})
    except jwt.exceptions.DecodeError:
        return "false"

    user_id = unverified_decoded.get("sub")

    Database.connect()
    password_hash = \
        Database.runSQL(f"SELECT t.password FROM `jh-horizen-travel`.user t WHERE user_id = '{user_id}'")[0][0]
    Database.disconnect()

    try:
        decoded = jwt.decode(data, key=password_hash, algorithms=['HS256'])
    except InvalidSignatureError:
        return "false"
    return "true"


@app.route(api + 'users/add', methods=['POST'])
def newUser():
    Database.connect()

    username = request.form.get('username')
    if len(Database.runSQL(f"SELECT t.* FROM `jh-horizen-travel`.user t WHERE username = '{username}'")) != 0:
        return "User already exists"
    password = request.form.get('password')
    email = request.form.get('email')
    firstname = request.form.get('first_name')
    lastname = request.form.get('last_name')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)

    # Insert new user into database
    Database.runSQL(f'INSERT INTO `jh-horizen-travel`.user (firstName, lastName, username, password, email) '
                    f'VALUES ("{firstname}", "{lastname}", "{username}", "{hashed_password.decode("utf-8")}", "{email}")')

    Database.disconnect()  # Disconn from database
    print(f"Made new user: {username}")
    return redirect("/login")


@app.route(api + 'users/update')
def updateUser():
    auth_token = request.headers.get("auth_token")
    jwt_data = jwt.decode(auth_token, options={"verify_signature": False})
    user_id = jwt_data.get("sub")
    new_password = request.args.get('new_password')
    old_password = request.args.get('old_password').encode("utf-8")
    email = request.args.get('email')
    firstname = request.args.get('firstname')
    lastname = request.args.get('lastname')

    if not validateJWT(auth_token):
        return redirect("/login")

    Database.connect()

    old_hashed_password = \
        Database.runSQL(f"SELECT t.password FROM `jh-horizen-travel`.user t WHERE user_id = '{user_id}'")[0][0]
    if not bcrypt.checkpw(old_password, old_hashed_password):
        return "Invalid Password"

    if len(new_password) >= 8:
        salt = bcrypt.gensalt()
        new_hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), salt)
        Database.runSQL(
            f"UPDATE `jh-horizen-travel`.user t SET t.password = {new_hashed_password} WHERE user_id = '{user_id}'")
    if len(email) >= 2:
        Database.runSQL(f"UPDATE `jh-horizen-travel`.user t SET t.email = {email} WHERE user_id = '{user_id}'")
    if len(firstname) >= 2:
        Database.runSQL(
            f"UPDATE `jh-horizen-travel`.user t SET t.firstName = {firstname} WHERE user_id = '{user_id}'")
    if len(lastname) >= 2:
        Database.runSQL(f"UPDATE `jh-horizen-travel`.user t SET t.lastName = {lastname} WHERE user_id = '{user_id}'")
    Database.disconnect()
    return 200


@app.route(api + 'contact-form', methods=['POST'])
def contactForm():
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    email = request.form.get('email')
    message = request.form.get('message')

    Database.connect()
    Database.runSQL(
        f"INSERT INTO `jh-horizen-travel`.form (first_name, last_name, email, message) VALUES ('{first_name}', '{last_name}', '{email}', '{message}')")
    Database.disconnect()
    print(f"New contact form from: {email}")
    return redirect("/")


@app.route(api + 'admin/report')
def generateAdminReport():
    return 501


if __name__ == '__main__':
    app.run()
