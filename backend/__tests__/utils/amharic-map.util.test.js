import { regexBuilder, similarRegexMap } from '../../utils/amharic-map.util.js';

describe('similarRegexMap', () => {
  it('should contain mappings for Amharic characters', () => {
    expect(similarRegexMap).toBeDefined();
    expect(typeof similarRegexMap).toBe('object');
  });

  it('should have regex patterns as values', () => {
    const sampleKey = 'ሀ';
    expect(similarRegexMap[sampleKey]).toBeDefined();
    expect(typeof similarRegexMap[sampleKey]).toBe('string');
    expect(similarRegexMap[sampleKey]).toMatch(/^\[/);
    expect(similarRegexMap[sampleKey]).toMatch(/\]$/);
  });

  it('should contain multiple character mappings', () => {
    const keys = Object.keys(similarRegexMap);
    expect(keys.length).toBeGreaterThan(10);
  });

  it('should include mappings for similar-looking characters', () => {
    expect(similarRegexMap['ሀ']).toContain('ሀ');
    expect(similarRegexMap['ሀ']).toContain('ሃ');
    expect(similarRegexMap['ሀ']).toContain('ሐ');
  });
});

describe('regexBuilder', () => {
  describe('single character input', () => {
    it('should return regex pattern for mapped character', () => {
      const result = regexBuilder('ሀ');
      expect(result).toBe('[ሀሃሐሓኀኃኻ]');
    });

    it('should return regex pattern for another mapped character', () => {
      const result = regexBuilder('ሠ');
      expect(result).toBe('[ሠሰ]');
    });

    it('should return original character for unmapped character', () => {
      const result = regexBuilder('A');
      expect(result).toBe('A');
    });

    it('should return original character for unmapped Latin character', () => {
      const result = regexBuilder('Z');
      expect(result).toBe('Z');
    });
  });

  describe('multiple character input', () => {
    it('should build regex for multiple Amharic characters', () => {
      const result = regexBuilder('ሀሁ');
      expect(result).toBe('[ሀሃሐሓኀኃኻ][ሁሑኁኹ]');
    });

    it('should handle mixed Amharic and Latin characters', () => {
      const result = regexBuilder('ሀABC');
      expect(result).toBe('[ሀሃሐሓኀኃኻ]ABC');
    });

    it('should handle mixed Amharic characters with different mappings', () => {
      const result = regexBuilder('ሀሠሰ');
      expect(result).toBe('[ሀሃሐሓኀኃኻ][ሠሰ][ሠሰ]');
    });

    it('should handle string with only Latin characters', () => {
      const result = regexBuilder('Hello');
      expect(result).toBe('Hello');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = regexBuilder('');
      expect(result).toBe('');
    });

    it('should handle single unmapped character', () => {
      const result = regexBuilder('x');
      expect(result).toBe('x');
    });

    it('should handle string with only unmapped characters', () => {
      const result = regexBuilder('123!@#');
      expect(result).toBe('123!@#');
    });

    it('should handle special Amharic characters', () => {
      const result = regexBuilder('ጸ');
      expect(result).toBe('[ጸፀ]');
    });

    it('should handle complex Amharic string', () => {
      const result = regexBuilder('ሀሁሂሃሄ');
      expect(result).toBe(
        '[ሀሃሐሓኀኃኻ][ሁሑኁኹ][ሂሒኂኺ][ሀሃሐሓኀኃኻ][ሄሔኄኼ]'
      );
    });
  });

  describe('regex pattern validity', () => {
    it('should generate valid regex patterns', () => {
      const result = regexBuilder('ሀ');
      expect(() => new RegExp(result)).not.toThrow();
    });

    it('should generate valid regex pattern for complex input', () => {
      const result = regexBuilder('ሀሁሂ');
      expect(() => new RegExp(result)).not.toThrow();
    });

    it('should match expected characters with generated regex', () => {
      const pattern = regexBuilder('ሀ');
      const regex = new RegExp(pattern);
      expect('ሀ').toMatch(regex);
      expect('ሃ').toMatch(regex);
      expect('ሐ').toMatch(regex);
    });
  });
});
