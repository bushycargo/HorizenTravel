import json

import mysql.connector


class DatabaseHandler:
    def __init__(self):
        self.dbconnection = None
        self.config = getConfig()

    def connect(self):
        # self.tunnel.start() # Depreciated, Not used anymore since server migration to Scaleway
        self.dbconnection = mysql.connector.connect(
            host=self.config['localhost'],
            port=self.config['port'],
            user=self.config['database_username'],
            password=self.config['database_password'],
            database=self.config['database_name']
        )
        if self.dbconnection.is_connected():
            return
        else:
            print("Issue during DB Connection")
            exit(0)

    def runSQL(self, sql):
        if self.dbconnection.is_connected():
            cursor = self.dbconnection.cursor()
            cursor.execute(sql)
            output = cursor.fetchall()
            self.dbconnection.commit()
            cursor.close()
            return output

    def disconnect(self):
        # self.tunnel.close()
        self.dbconnection.close()

    def getFlightData(self):
        with open('flightData.json', 'r') as file:
            flightdata = json.load(file)
        print(flightdata)

        for flight in flightdata:
            print(flight)
            origin = flight['origin']
            destination = flight['destination']
            departure = flight['departure_time']
            arrival = flight['arrival_time']
            bookings = 120
            self.runSQL(f"INSERT INTO `jh-horizen-travel`.flight (origin, destination, depart_time, arrive_time, bookings) VALUES ('{origin}', '{destination}', '{departure}', '{arrival}', '{bookings}');")


def getConfig():
    with open('config.json', 'r') as file:
        config = json.load(file)  # Opening config JSON file

    # config = json.loads(config)  # Converts JSON to python dictionary
    return config
