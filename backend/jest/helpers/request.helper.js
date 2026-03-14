import request from 'supertest';
import app from '../../index.js';

export const authHelper = {
  getAdminToken: async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: 'admin@mkc.com', password: 'admin123' });
    return response.body.token;
  },
  
  getMemberToken: async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: 'member@mkc.com', password: 'member123' });
    return response.body.token;
  },
  
  getPublicToken: async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: 'public@mkc.com', password: 'public123' });
    return response.body.token;
  },
  
  withAuth: (token) => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }),
};

export const apiRequest = {
  get: (url, auth = null) =>
    request(app).get(url).set(auth || {}),
  
  post: (url, body, auth = null) =>
    request(app).post(url).send(body).set(auth || {}),
  
  put: (url, body, auth = null) =>
    request(app).put(url).send(body).set(auth || {}),
  
  patch: (url, body, auth = null) =>
    request(app).patch(url).send(body).set(auth || {}),
  
  delete: (url, auth = null) =>
    request(app).delete(url).set(auth || {}),
};
