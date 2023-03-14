from flask import Flask, render_template

from dbfunc import DatabaseHandler

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


# API- todo
api = '/api/v1/'


@app.route(api + 'search')
def search():
    return "0"


if __name__ == '__main__':
    app.run()
