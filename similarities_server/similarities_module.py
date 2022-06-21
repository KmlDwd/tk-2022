from marshmallow import Schema, fields
from flask_restful import Resource
from flask import make_response, request
from check_json import check_json
from PIL import Image
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('clip-ViT-B-32')


class _OptionsSchema(Schema):
    """Class specifies module options"""
    name = fields.String(required=False)
    imagePath = fields.String(required=True)
    confidence = fields.Integer(required=False)


class _Schema(Schema):
    """Class specifies API parameters"""
    paths = fields.List(fields.String())
    options = fields.Nested(_OptionsSchema)


class SimilaritiesModule(Resource):

    def __init__(self) -> None:
        super().__init__()

    def run_classifier(self, path, photo_path):
        image1 = Image.open(path).convert('RGB')
        image2 = Image.open(photo_path).convert('RGB')

        encoded_image = model.encode([image1, image2], batch_size=128,
                                     convert_to_tensor=True)
        processed_images = util.paraphrase_mining_embeddings(encoded_image)
        return processed_images[0][0]

    def check_similarity(self, paths, similarity, photo_path, ):
        filtered_paths = []

        for path in paths:
            try:
                calculated_percent = self.run_classifier(path, photo_path) * 100
                print(f'Processed {path} with result {calculated_percent}%')
                if calculated_percent >= float(similarity):
                    filtered_paths.append(path)
            except ValueError:
                print(f'{path} not valid')
                continue
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
        imagePath = json_data.get("options").get("imagePath")
        confidence = json_data.get("options").get("confidence")
        if confidence:
            filter_paths = SimilaritiesModule().check_similarity(paths, confidence, imagePath)
        else:
            filter_paths = SimilaritiesModule().check_similarity(paths, 0, imagePath)

        return make_response({"pictures": filter_paths, }, 200)
