from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from colors_module import ColorsModule


def create_app():
    app = Flask(__name__)
    CORS(app)

    api = Api(app)

    api.add_resource(ColorsModule, '/')

    return app