import json

from flask import Flask, render_template, request

from dbfunc import DatabaseHandler

# Notes
# Max 120 seats/plane


app = Flask(__name__)

Database = DatabaseHandler()
Database.connect()
print("Connection Test Completed")
# Database.getFlightData()  # Populates the database with test flight data, only needs to be run once per DB print(
# json.dumps(Database.runSQL(f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = 'MAN' ORDER BY
# flightNumber"))) Database.runSQL(f"INSERT INTO `jh-horizen-travel`.user (firstName, lastName, username, password,
# email) " f"VALUES ('foo', 'foo', 'foo', 'foo', 'foo')")
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


# API- todo
api = '/api/v1/'


@app.route(api + 'search')
def searchFlights():
    # Needs either origin or destination in airport code (e.g. BHX)
    Database.connect()  # Connect Database
    # request.args.get() to get args

    origin = request.args.get("origin")
    destination = request.args.get("destination")

    if destination == '':  # If destination is empty then it must be an origin only search
        output = Database.runSQL(
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = '{origin}' ORDER BY flightNumber")
    elif origin == '':  # If origin is empty then it must be a destination only search
        output = Database.runSQL(
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE destination = '{destination}' ORDER BY flightNumber")
    else:
        output = Database.runSQL(
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = '{origin}' AND destination = '{destination}' "
            f"ORDER BY flightNumber")

    print(output)
    Database.disconnect()  # Disconnect Database
    return json.dumps(output)


@app.route(api + "book/new")
def bookFlight():
    Database.connect()
    user_id = request.args.get('user_id')
    flight_number = request.args.get('flight_number')
    current_bookings = \
        Database.runSQL(f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE flightNumber = {flight_number}")[0][5]
    if current_bookings <= 0:
        return 406
    else:
        Database.runSQL(
            f"UPDATE `jh-horizen-travel`.flight t SET t.bookings = {current_bookings - 1} WHERE t.flightNumber = {flight_number}")
        Database.runSQL(
            f"INSERT INTO `jh-horizen-travel`.booking (user_id, flight_number) VALUES ({user_id}, {flight_number})")
        print(f"Created new booking for user: {user_id}")
        Database.disconnect()
        return 200


@app.route(api + 'users/add')
def newUser():
    # Get data from JSON args
    Database.connect()

    username = request.args.get('username')
    if Database.runSQL(f"SELECT t.* FROM `jh-horizen-travel`.user t WHERE username = '{username}'") != "[]":
        return 406

    password = request.args.get('password')
    email = request.args.get('email')
    firstname = request.args.get('firstname')
    lastname = request.args.get('lastname')

    # Conn to database
    # Insert new user into database
    Database.runSQL(f"INSERT INTO `jh-horizen-travel`.user (firstName, lastName, username, password, email) "
                    f"VALUES ('{firstname}', '{lastname}', '{username}', '{password}', '{email}')")

    Database.disconnect()  # Disconn from database
    print(f"Made new user: {username}")
    return 200  # Return code 200 OK


@app.route(api + 'users/update')
def updateUser():
    username = request.args.get('username')
    new_password = request.args.get('new_password')
    old_password = request.args.get('old_password')
    email = request.args.get('email')
    firstname = request.args.get('firstname')
    lastname = request.args.get('lastname')

    Database.connect()
    if Database.runSQL(f"SELECT t.password FROM `jh-horizen-travel`.user t WHERE username = '{username}'")[0][0] != old_password:
        return 406
    if len(new_password) >= 2:
        Database.runSQL(
            f"UPDATE `jh-horizen-travel`.user t SET t.password = {new_password} WHERE username = '{username}'")
    if len(email) >= 2:
        Database.runSQL(f"UPDATE `jh-horizen-travel`.user t SET t.email = {email} WHERE username = '{username}'")
    if len(firstname) >= 2:
        Database.runSQL(
            f"UPDATE `jh-horizen-travel`.user t SET t.firstName = {firstname} WHERE username = '{username}'")
    if len(lastname) >= 2:
        Database.runSQL(f"UPDATE `jh-horizen-travel`.user t SET t.lastName = {lastname} WHERE username = '{username}'")
    Database.disconnect()
    return 200


if __name__ == '__main__':
    app.run()
