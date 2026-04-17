const nodemailer = jest.requireActual('nodemailer');

// Mock createTransport
nodemailer.createTransport = jest.fn(() => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  verify: jest.fn().mockResolvedValue(true),
}));

module.exports = nodemailer;
