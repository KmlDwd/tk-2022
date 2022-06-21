from typing import Callable, Union

import cv2
from flask import make_response, request
from flask_restful import Resource
from marshmallow import Schema, fields

from check_json import check_json

Comparable = Union[float, int]
INCH2CM = 0.393701


def get_comparator(comparator: str, threshold=0) -> Callable[[Comparable, Comparable], bool]:
    return {"==": lambda checked, reference: abs(checked - reference) < threshold,
            ">": lambda checked, reference: checked > reference,
            ">=": lambda checked, reference: checked >= reference,
            "<": lambda checked, reference: checked < reference,
            "<=": lambda checked, reference: checked <= reference}[comparator]


class _OptionsSchema(Schema):
    """Class specifies module options"""
    name = fields.String(required=False)
    type = fields.String(required=False)
    noFaces = fields.Number(required=False)
    noSmiles = fields.Number(required=False)
    comparator = fields.String(required=False)
    threshold = fields.Number(required=False)


class _Schema(Schema):
    """Class specifies API parameters"""
    paths = fields.List(fields.String())
    options = fields.Nested(_OptionsSchema)


class FacesModule(Resource):

    def __init__(self) -> None:
        super().__init__()

    def findFaces(self, img):
        trained_face_data = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

        # Convert to grayscale
        grayscaled_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect faces
        face_coordinates = trained_face_data.detectMultiScale(grayscaled_img)

        return len(face_coordinates)

    def findSmiles(self, img):
        number_of_smiles = 0
        # Load some pre-trained data on face frontals from opencv (haar cascade algorithm)
        face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        smile_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')

        # Convert to grayscale
        grayscaled_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_detector.detectMultiScale(grayscaled_img)

        # Run the face detector within each of these faces
        for (x, y, w, h) in faces:
            # Draw a rectangle around the face
            cv2.rectangle(img, (x, y), (x + w, y + h), (100, 200, 50), 4)

            # Get the sub frame (using numpy N-diminsional array slicing)
            the_face = img[y:y + h, x:x + w]

            # Change to grayscale
            face_grayscale = cv2.cvtColor(the_face, cv2.COLOR_BGR2GRAY)

            # Detects smiles
            smiles = smile_detector.detectMultiScale(
                face_grayscale, scaleFactor=1.7, minNeighbors=20)  # scaleFactors,min_neighbours

            number_of_smiles += len(smiles)
        return number_of_smiles

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
        filtered_paths = []
        options = json_data.get('options')
        comparator = get_comparator(options.get("comparator"),
                                    options.get("threshold"))

        paths = json_data.get("paths")
        faces = FacesModule()
        for path in paths:
            img = cv2.imread(path)

            if "faces" in options.get("type") and not comparator(faces.findFaces(img), int(options.get("noFaces"))):
                continue

            if "smiles" in options.get("type") and not comparator(faces.findSmiles(img), int(options.get("noSmiles"))):
                continue

            filtered_paths.append(path)

        return make_response({"pictures": filtered_paths, }, 200)
