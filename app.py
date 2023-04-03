import json

from flask import Flask, render_template, request

from dbfunc import DatabaseHandler

# Notes
# Max 120 seats/plane


app = Flask(__name__)

Database = DatabaseHandler()
Database.connect()
print("Connection Test Completed")
# Database.getFlightData()  # Populates the database with test flight data, only needs to be run once per DB
# print(json.dumps(Database.runSQL(f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = 'MAN' ORDER BY flightNumber")))
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
            f"SELECT t.* FROM `jh-horizen-travel`.flight t WHERE origin = '{origin}' AND destination = '{destination}' ORDER BY flightNumber")

    print(output)
    Database.disconnect()  # Disconnect Database
    return json.dumps(output)


if __name__ == '__main__':
    app.run()
