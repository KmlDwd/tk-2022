from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from weather_module import WeatherModule

def create_app():
	app = Flask(__name__)
	CORS(app)

	api = Api(app)

	api.add_resource(WeatherModule, '/')

	return app
