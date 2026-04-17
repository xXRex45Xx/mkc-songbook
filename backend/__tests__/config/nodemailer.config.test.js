// Mock dotenv to prevent loading actual .env file and set env vars
jest.mock('dotenv', () => ({
  config: jest.fn(() => {
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'testpass';
  }),
}));

describe('nodemailer.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create transporter with correct SMTP settings', async () => {
    const mockCreateTransport = jest.fn().mockReturnValue({ sendMail: jest.fn() });
    
    // Mock nodemailer before importing
    jest.mock('nodemailer', () => ({
      createTransport: mockCreateTransport,
    }));

    await import('../../config/nodemailer.config.js');

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  });

  it('should send email with correct parameters', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({});
    
    // Mock nodemailer before importing
    jest.mock('nodemailer', () => ({
      createTransport: () => ({ sendMail: mockSendMail }),
    }));

    const { default: sendEmail } = await import('../../config/nodemailer.config.js');
    
    await expect(sendEmail('recipient@example.com', 'Test Subject', 'Test Body')).resolves.toBeUndefined();

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('should throw error when email sending fails', async () => {
    const mockError = new Error('SMTP connection failed');
    const mockSendMail = jest.fn().mockRejectedValue(mockError);
    
    // Mock nodemailer before importing
    jest.mock('nodemailer', () => ({
      createTransport: () => ({ sendMail: mockSendMail }),
    }));

    const { default: sendEmail } = await import('../../config/nodemailer.config.js');
    
    await expect(sendEmail('user@example.com', 'Test', 'Body')).rejects.toThrow('SMTP connection failed');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });
});
