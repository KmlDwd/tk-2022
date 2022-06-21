import os
from typing import Callable, Union

import imagesize
from flask import make_response, request
from flask_restful import Resource
from marshmallow import Schema, fields

from check_json import check_json

Comparable = Union[float, int]
INCH2CM = 0.393701


class _OptionsSchema(Schema):
    """Class specifies module options"""
    name = fields.String(required=False)
    cm = fields.Field(required=False)
    kb = fields.Number(required=False)
    pixels = fields.Field(required=False)
    comparator = fields.String(required=False)
    threshold = fields.Number(required=False)
    unit = fields.String(required=False)


class _Schema(Schema):
    """Class specifies API parameters"""
    paths = fields.List(fields.String())
    options = fields.Nested(_OptionsSchema)


class SizeModule(Resource):

    def __init__(self) -> None:
        super().__init__()

    def get_comparator(self, comparator: str, threshold=0) -> Callable[[Comparable, Comparable], bool]:
        return {"==": lambda checked, reference: abs(checked - reference) < threshold,
                ">": lambda checked, reference: checked > reference,
                ">=": lambda checked, reference: checked >= reference,
                "<": lambda checked, reference: checked < reference,
                "<=": lambda checked, reference: checked <= reference}[comparator]

    def check_size_in_KB(self, path):
        size_in_b = os.path.getsize(path)
        size_in_KB = size_in_b / 1024
        return size_in_KB

    def pixels_to_cm(self, pixels, DPI):
        return pixels / DPI * INCH2CM

    def check_size_in_cm(self, path):
        width, height = imagesize.get(path)
        widthDPI, heightDPI = imagesize.getDPI(path)
        return [self.pixels_to_cm(width, widthDPI), self.pixels_to_cm(height, heightDPI)]

    def filter_by_KB(self, paths, reference, comparator, threshold):
        filtered_paths = []
        comparator = self.get_comparator(comparator, threshold)
        for path in paths:
            if comparator(self.check_size_in_KB(path), reference):
                filtered_paths.append(path)
        return filtered_paths

    def filter_by_pixels(self, paths, reference, comparator, threshold):
        filtered_paths = []
        comparator = self.get_comparator(comparator, threshold)
        for path in paths:
            width, height = imagesize.get(path)
            if comparator(width, reference[0]) and comparator(height, reference[1]):
                filtered_paths.append(path)
        return filtered_paths

    def filter_by_cm(self, paths, reference, comparator, threshold):
        filtered_paths = []
        comparator = self.get_comparator(comparator, threshold)
        for path in paths:
            size_in_cm = self.check_size_in_cm(path)
            if comparator(size_in_cm[0], reference[0]) and comparator(size_in_cm[1], reference[1]):
                filtered_paths.append(path)
        return filtered_paths

    def get_filter_and_refernce(self, params):
        return {"kb": (self.filter_by_KB, float(params["kb"]) if 'kb' in params else 0),
                "pixels": (self.filter_by_pixels, params["pixels"] if 'pixels' in params else 0),
                "cm": (self.filter_by_cm, params["cm"] if 'cm' in params else 0)
                }[params["unit"]]

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

        filter_method, reference = SizeModule().get_filter_and_refernce(json_data.get('options'))
        threshold = float(json_data.get('options').get("threshold")) if 'threshold' in json_data.get('options').get(
            "comparator") else 0
        result = filter_method(paths=paths, reference=reference, comparator=json_data.get('options').get("comparator"),
                               threshold=threshold)

        return make_response({"pictures": result, }, 200)
