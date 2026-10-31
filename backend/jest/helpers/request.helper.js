import request from 'supertest';
import app from '../../index.js';
import { authHeader } from './integration.helper.js';

const login = (email, password) =>
  request(app)
    .post('/api/user/login')
    .set('X-Requested-With', 'mkc')
    .send({ email, password });

export const authHelper = {
  // Each getter returns the login response; pass it to authHeader / withAuth.
  getAdminToken: () => login('admin@mkc.com', 'admin123'),

  getMemberToken: () => login('member@mkc.com', 'member123'),

  getPublicToken: () => login('public@mkc.com', 'public123'),

  withAuth: (loginResponse) => ({
    headers: {
      ...authHeader(loginResponse),
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
