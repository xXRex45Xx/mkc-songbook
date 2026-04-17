import generateOtp from '../../utils/otp.util.js';

describe('generateOtp', () => {
  it('should return a number', () => {
    const otp = generateOtp();
    expect(typeof otp).toBe('number');
  });

  it('should return a 6-digit number', () => {
    const otp = generateOtp();
    expect(otp).toBeGreaterThanOrEqual(100000);
    expect(otp).toBeLessThanOrEqual(999999);
  });

  it('should return different values on consecutive calls', () => {
    const otp1 = generateOtp();
    const otp2 = generateOtp();
    const otp3 = generateOtp();

    expect(otp1).not.toBe(otp2);
    expect(otp2).not.toBe(otp3);
    expect(otp1).not.toBe(otp3);
  });

  it('should return integers (not floats)', () => {
    const otp = generateOtp();
    expect(Number.isInteger(otp)).toBe(true);
  });

  it('should generate OTPs within expected range consistently', () => {
    const otps = Array.from({ length: 100 }, generateOtp);

    otps.forEach((otp) => {
      expect(otp).toBeGreaterThanOrEqual(100000);
      expect(otp).toBeLessThanOrEqual(999999);
    });
  });
});
