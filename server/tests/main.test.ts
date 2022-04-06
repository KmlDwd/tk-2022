import supertest from 'supertest';
import traverse from '../src/modules/mainModule/main';
import { serialize, deserialize } from 'bson';
import process from 'process';

const rootPath = process.cwd().split('\\').join('/').split('/server')[0];

const testCases = [
	{
		testRequest: {
			path: `${rootPath}/server/resources/exampleImages`,
			moduleConfig: [],
		},
		testResponse: {
			pictures: [
				`${rootPath}/server/resources/exampleImages/bike.jpg`,
				`${rootPath}/server/resources/exampleImages/bus.jpg`,
				`${rootPath}/server/resources/exampleImages/feather.jpg`,
				`${rootPath}/server/resources/exampleImages/fish.jpg`,
				`${rootPath}/server/resources/exampleImages/flower1.jpg`,
				`${rootPath}/server/resources/exampleImages/flower2.jpg`,
				`${rootPath}/server/resources/exampleImages/lizard1.jpg`,
				`${rootPath}/server/resources/exampleImages/lizard2.jpg`,
				`${rootPath}/server/resources/exampleImages/lizard3.jpg`,
				`${rootPath}/server/resources/exampleImages/ptsd.jpg`,
			],
		},
	},
];

describe('Test default path', () => {
	test('should response with status 200 and valid binary buffer', (done) => {
		for (const { testRequest, testResponse } of testCases) {
			const chunks: Buffer[] = [];
			supertest(traverse)
				.post('/')
				.set('Content-Type', 'application/octet-stream')
				.send(serialize(testRequest))
				.expect(200)
				.expect('Content-Type', /octet-stream/)
				.buffer()
				.parse((res, callback) => {
					res.on('data', (chunk) => {
						chunks.push(Buffer.from(chunk));
					});
					res.on('end', () => {
						callback(null, null);
					});
				})
				.end((err, res) => {
					if (err) {
						throw err;
					}
					const response = deserialize(Buffer.concat(chunks));
					expect(response).toBeDefined();
					expect(response).toEqual(testResponse);
					done();
				});
		}
	});
});