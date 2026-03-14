export const testUsers = {
  admin: {
    email: 'admin@mkc.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'super-admin',
  },
  member: {
    email: 'member@mkc.com',
    name: 'Member User',
    password: 'member123',
    role: 'member',
  },
  public: {
    email: 'public@mkc.com',
    name: 'Public User',
    password: 'public123',
    role: 'public',
  },
};

export const createUserFixture = (overrides = {}) => ({
  email: `test${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
  role: 'public',
  ...overrides,
});
