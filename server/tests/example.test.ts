import request from 'supertest';
import example from '../src/modules/exampleModule/example';

describe('Test default path', () => {
	test('It should response with status 404', (done) => {
		request(example)
			.get('/')
			.then(({ statusCode }: { statusCode: number }) => {
				expect(statusCode).toBe(404);
				done();
			});
	});
});

describe('Test the cors path', () => {
	test('It should response the GET method', (done) => {
		request(example)
			.get('/cors')
			.then(({ statusCode }: { statusCode: number }) => {
				expect(statusCode).toBe(200);
				done();
			});
	});
});