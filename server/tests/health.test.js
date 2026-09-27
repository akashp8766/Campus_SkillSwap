const request = require('supertest');
const { app } = require('../index');

describe('Health Check API', () => {
  it('should return a 200 OK status from the /health route', async () => {
    // Supertest acts like a fake browser pinging your API
    const response = await request(app).get('/health');
    
    // We expect the backend to return status 200 (Success)
    expect(response.status).toBe(200);
    
    // We expect the JSON body to contain 'status': 'ok'
    expect(response.body.status).toBe('ok');
  });
});
