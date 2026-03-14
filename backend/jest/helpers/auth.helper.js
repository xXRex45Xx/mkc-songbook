import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

export const createTestToken = (user, role = 'member') => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email, 
      name: user.name,
      role: role 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const decodeToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
  return jwt.verify(token, JWT_SECRET);
};
