import request from 'supertest';
import { app } from '../server';

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toMatchObject({
      status: 'OK',
      environment: expect.any(String),
    });
  });
});
