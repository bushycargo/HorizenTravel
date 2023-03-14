import json

import pandas
import pymysql
from sshtunnel import SSHTunnelForwarder


class DatabaseHandler:
    def __init__(self):
        self.dbconnection = None
        self.config = getConfig()
        self.tunnel = self.makeTunnel()

    def makeTunnel(self):
        tunnel = SSHTunnelForwarder(
            (self.config['ssh_host'], 22),
            ssh_username=self.config['ssh_username'],
            ssh_pkey=self.config['ssh_pkey'],
            remote_bind_address=(self.config['localhost'], 3306)
        )
        tunnel.start()
        print("Tunnel Connection Successful")
        tunnel.close()
        return tunnel

    def connect(self):
        self.tunnel.start()
        self.dbconnection = pymysql.connect(
            host=self.config['localhost'],
            user=self.config['database_username'],
            passwd=self.config['database_password'],
            db=self.config['database_name'],
            port=self.tunnel.local_bind_port
        )

    def runSQL(self, sql):
        return pandas.read_sql_query(sql, self.dbconnection)

    def disconnect(self):
        self.tunnel.close()
        self.dbconnection.close()


def getConfig():
    with open('config.json', 'r') as file:
        config = json.load(file)  # Opening config JSON file

    # config = json.loads(config)  # Converts JSON to python dictionary
    return config
