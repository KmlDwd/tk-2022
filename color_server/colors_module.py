from enum import Enum
from typing import Callable, Union

from PIL import ImageStat, Image, ImageColor
from flask import make_response, request
from flask_restful import Resource
from marshmallow import Schema, fields

from check_json import check_json

Comparable = Union[float, int]

STAT_METRICS = {'max', 'min', 'mean', 'median', 'rms'}
PIXEL_METRICS = {'percentage'}


def eight_bit_to_rgb(pixel):
    r = (pixel >> 5) * 255 / 7
    g = ((pixel >> 2) & 0x07) * 255 / 7
    b = (pixel & 0x03) * 255 / 3
    return r, g, b


def color_percentage(data_record, expected, tolerance):
    if hasattr(data_record, '__iter__'):
        return lambda pixel: all([abs(x - y) < tolerance for x, y in zip(expected, pixel)])
    else:
        return lambda pixel: all([abs(x - y) < tolerance for x, y in zip(expected, eight_bit_to_rgb(pixel))])


def get_comparator(comparator: str, threshold=0) -> Callable[[Comparable, Comparable], bool]:
    return {"==": lambda checked, reference: abs(checked - reference) < threshold,
            ">": lambda checked, reference: checked > reference,
            ">=": lambda checked, reference: checked >= reference,
            "<": lambda checked, reference: checked < reference,
            "<=": lambda checked, reference: checked <= reference}[comparator]


class ColorMetric(Enum):
    max = 1
    min = 2
    mean = 3
    median = 4
    rms = 5
    percentage = 6


def get_stat_based_metric(metric: ColorMetric):
    return {
        "max": lambda stat: map(lambda x: x[1], stat.extrema),
        "min": lambda stat: map(lambda x: x[0], stat.extrema),
        "mean": lambda stat: stat.mean,
        "median": lambda stat: stat.median,
        "rms": lambda stat: stat.rms
    }[metric.name]


def get_pixel_based_metric(metric: ColorMetric):
    return {
        "percentage": color_percentage
    }[metric.name]


class _OptionsSchema(Schema):
    """Class specifies module options"""
    threshold = fields.Float(required=False)
    percent_threshold = fields.Float(required=False)
    tolerance = fields.Float(required=False)
    color = fields.String()
    metric = fields.Number(required=False)
    name = fields.String(required=False)
    comparator = fields.String(required=False)


class _Schema(Schema):
    """Class specifies API parameters"""
    paths = fields.List(fields.String())
    color = fields.Tuple((fields.Float(), fields.Float(), fields.Float()))
    metric = fields.String()
    comparator = fields.String()

    options = fields.Nested(_OptionsSchema)


class ColorsModule(Resource):
    def __init__(self) -> None:
        super().__init__()

    @staticmethod
    def get_filter_func(color, metric, comparator, threshold, percent_threshold, tolerance):
        comparator = get_comparator(comparator, threshold)

        if metric in STAT_METRICS:
            metric = get_stat_based_metric(metric)

            def is_compliant(path):
                calc_metric = list(metric(ImageStat.Stat(Image.open(path))))
                if len(calc_metric) > 2:
                    return all(map(
                        comparator,
                        calc_metric,
                        color
                    ))
                elif len(calc_metric) == 1:
                    colors = (color[0] + color[1] + color[2]) / 3
                    return comparator(calc_metric[0], colors)
                else:  # This is not a normal image. I refuse to return it.
                    return False
        elif metric in PIXEL_METRICS:
            metric = get_pixel_based_metric(metric)

            def is_compliant(path):
                print(path, end='-> ')
                image = Image.open(path)
                data = list(image.getdata())
                w, h = image.size
                total = w * h
                bound_metric = metric(data[0], color, tolerance)
                compliant_pixels = list(filter(lambda x: bound_metric(x), data))

                percent = 100 * len(compliant_pixels) / total
                print(percent)
                return comparator(percent, percent_threshold)

        else:
            def is_compliant(_):
                return True

        return is_compliant

    @staticmethod
    def CheckColor(paths, is_compliant):
        result = list(filter(is_compliant, paths))
        return result

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

        print(json_data)
        paths = json_data.get("paths")

        color = ImageColor.getcolor(json_data.get("options").get("color"), "RGB")
        metric = json_data.get("options").get("metric")
        comparator = json_data.get("options").get("comparator")
        threshold = json_data.get("options").get("threshold")
        percent_threshold = json_data.get("options").get("percent_threshold")
        tolerance = json_data.get("options").get("tolerance")

        is_compliant = ColorsModule.get_filter_func(color, metric, comparator, threshold, percent_threshold, tolerance)

        filter_paths = ColorsModule.CheckColor(paths, is_compliant)

        return make_response({"pictures": filter_paths}, 200)
