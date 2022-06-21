import os

from lib.classifier import classifier
from marshmallow import Schema, fields
from flask_restful import Resource
from flask import make_response, request
from check_json import check_json


class _OptionsSchema(Schema):
    """Class specifies module options"""
    name = fields.String(required=False)
    dogsSpecies = fields.String(required=True)


class _Schema(Schema):
    """Class specifies API parameters"""
    paths = fields.List(fields.String())
    options = fields.Nested(_OptionsSchema)


class DogsModule(Resource):

    def __init__(self) -> None:
        super().__init__()

    def run_classifier(self, path):

        # NOTE: this function only works for model architectures:
        #      'vgg', 'alexnet', 'resnet'
        model = "vgg"

        image_classification = classifier(path, model)
        return image_classification

    def check_if_dog(self, paths):
        filtered_paths = []
        with open(os.path.dirname(__file__) + "/lib/dognames.txt") as f:
            lines = f.read().splitlines()
            for path in paths:
                classification = self.run_classifier(path).lower()
                if classification in lines:
                    filtered_paths.append(path)
        return filtered_paths

    def check_breed(self, paths, breed):
        filtered_paths = []
        for path in paths:
            classification = self.run_classifier(path)
            if breed in classification:
                filtered_paths.append(path)
        return filtered_paths

    @staticmethod
    def post():
        schema = _Schema()

        # validate request
        errors = schema.validate(request.get_json())
        if errors:
            print("ERROR: ", errors)
            return make_response(errors, 400)

        json_data: dict = request.get_json(force=True)
        response_err = check_json(json_data)
        if response_err:
            print("Response error: ", response_err)
            return make_response(response_err, 400)

        # load data
        print(json_data)
        paths = json_data.get("paths")
        dogsSpecies = json_data.get("options").get("dogsSpecies")

        filter_paths = DogsModule().check_breed(paths, dogsSpecies)

        return make_response({"pictures": filter_paths, }, 200)
