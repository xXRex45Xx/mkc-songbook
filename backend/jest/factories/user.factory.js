import { v4 as uuidv4 } from 'uuid';

export const createUserFactory = (overrides = {}) => ({
  _id: uuidv4(),
  email: `user${Date.now()}@example.com`,
  name: `Test User ${Date.now()}`,
  password: 'hashedPassword123',
  role: 'public',
  favorites: [],
  photo: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createAdminUserFactory = (overrides = {}) =>
  createUserFactory({
    ...overrides,
    role: 'super-admin',
    email: `admin${Date.now()}@example.com`,
    name: `Admin User ${Date.now()}`,
  });

export const createMemberUserFactory = (overrides = {}) =>
  createUserFactory({
    ...overrides,
    role: 'member',
    email: `member${Date.now()}@example.com`,
    name: `Member User ${Date.now()}`,
  });
