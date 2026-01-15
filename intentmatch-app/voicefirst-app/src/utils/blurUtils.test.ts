/**
 * Unit tests for blur utility functions
 * Run with: npm test (if Jest is configured)
 */

import {
  calculateBlurIntensity,
  getUnlockProgress,
  isPhotoUnlocked,
  getNextMilestone,
} from './blurUtils';

describe('calculateBlurIntensity', () => {
  it('should return 100 for 0 messages', () => {
    expect(calculateBlurIntensity(0)).toBe(100);
  });

  it('should return 80 for 1 message', () => {
    expect(calculateBlurIntensity(1)).toBe(80);
  });

  it('should return 80 for 2 messages', () => {
    expect(calculateBlurIntensity(2)).toBe(80);
  });

  it('should return 50 for 3 messages', () => {
    expect(calculateBlurIntensity(3)).toBe(50);
  });

  it('should return 50 for 4 messages', () => {
    expect(calculateBlurIntensity(4)).toBe(50);
  });

  it('should return 20 for 5 messages', () => {
    expect(calculateBlurIntensity(5)).toBe(20);
  });

  it('should return 20 for 7 messages', () => {
    expect(calculateBlurIntensity(7)).toBe(20);
  });

  it('should return 0 for 8 messages', () => {
    expect(calculateBlurIntensity(8)).toBe(0);
  });

  it('should return 0 for 10 messages', () => {
    expect(calculateBlurIntensity(10)).toBe(0);
  });

  it('should return 0 for 100 messages', () => {
    expect(calculateBlurIntensity(100)).toBe(0);
  });
});

describe('getUnlockProgress', () => {
  it('should return 0% for 0 messages', () => {
    expect(getUnlockProgress(0)).toBe(0);
  });

  it('should return 12% for 1 message', () => {
    expect(getUnlockProgress(1)).toBe(12);
  });

  it('should return 25% for 2 messages', () => {
    expect(getUnlockProgress(2)).toBe(25);
  });

  it('should return 37% for 3 messages', () => {
    expect(getUnlockProgress(3)).toBe(37);
  });

  it('should return 50% for 4 messages', () => {
    expect(getUnlockProgress(4)).toBe(50);
  });

  it('should return 62% for 5 messages', () => {
    expect(getUnlockProgress(5)).toBe(62);
  });

  it('should return 75% for 6 messages', () => {
    expect(getUnlockProgress(6)).toBe(75);
  });

  it('should return 87% for 7 messages', () => {
    expect(getUnlockProgress(7)).toBe(87);
  });

  it('should return 100% for 8 messages', () => {
    expect(getUnlockProgress(8)).toBe(100);
  });

  it('should cap at 100% for more than 8 messages', () => {
    expect(getUnlockProgress(10)).toBe(100);
    expect(getUnlockProgress(20)).toBe(100);
    expect(getUnlockProgress(100)).toBe(100);
  });
});

describe('isPhotoUnlocked', () => {
  it('should return false for less than 8 messages', () => {
    expect(isPhotoUnlocked(0)).toBe(false);
    expect(isPhotoUnlocked(1)).toBe(false);
    expect(isPhotoUnlocked(2)).toBe(false);
    expect(isPhotoUnlocked(3)).toBe(false);
    expect(isPhotoUnlocked(4)).toBe(false);
    expect(isPhotoUnlocked(5)).toBe(false);
    expect(isPhotoUnlocked(6)).toBe(false);
    expect(isPhotoUnlocked(7)).toBe(false);
  });

  it('should return true for 8 or more messages', () => {
    expect(isPhotoUnlocked(8)).toBe(true);
    expect(isPhotoUnlocked(9)).toBe(true);
    expect(isPhotoUnlocked(10)).toBe(true);
    expect(isPhotoUnlocked(100)).toBe(true);
  });
});

describe('getNextMilestone', () => {
  it('should return first milestone for 0 messages', () => {
    const milestone = getNextMilestone(0);
    expect(milestone).not.toBeNull();
    expect(milestone?.count).toBe(1);
    expect(milestone?.label).toContain('1 message');
  });

  it('should return 3-message milestone for 1-2 messages', () => {
    let milestone = getNextMilestone(1);
    expect(milestone?.count).toBe(3);
    expect(milestone?.label).toContain('3 messages');

    milestone = getNextMilestone(2);
    expect(milestone?.count).toBe(3);
    expect(milestone?.label).toContain('3 messages');
  });

  it('should return 5-message milestone for 3-4 messages', () => {
    let milestone = getNextMilestone(3);
    expect(milestone?.count).toBe(5);
    expect(milestone?.label).toContain('5 messages');

    milestone = getNextMilestone(4);
    expect(milestone?.count).toBe(5);
    expect(milestone?.label).toContain('5 messages');
  });

  it('should return 8-message milestone for 5-7 messages', () => {
    let milestone = getNextMilestone(5);
    expect(milestone?.count).toBe(8);
    expect(milestone?.label).toContain('8 messages');

    milestone = getNextMilestone(6);
    expect(milestone?.count).toBe(8);

    milestone = getNextMilestone(7);
    expect(milestone?.count).toBe(8);
  });

  it('should return null for 8 or more messages', () => {
    expect(getNextMilestone(8)).toBeNull();
    expect(getNextMilestone(9)).toBeNull();
    expect(getNextMilestone(10)).toBeNull();
    expect(getNextMilestone(100)).toBeNull();
  });
});

describe('Edge cases and error handling', () => {
  it('should handle negative message counts gracefully', () => {
    // Although this shouldn't happen in practice
    expect(calculateBlurIntensity(-1)).toBe(100); // Treats as 0
  });

  it('should handle very large message counts', () => {
    expect(calculateBlurIntensity(1000000)).toBe(0);
    expect(getUnlockProgress(1000000)).toBe(100);
    expect(isPhotoUnlocked(1000000)).toBe(true);
  });

  it('should handle decimal message counts', () => {
    // Although message count should be integer
    expect(calculateBlurIntensity(2.5)).toBe(80); // 2.5 is between 1-2
    expect(calculateBlurIntensity(5.9)).toBe(20); // 5.9 is between 5-7
  });
});

describe('Integration scenarios', () => {
  it('should correctly calculate progression from 0 to 8 messages', () => {
    const progression = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((count) => ({
      count,
      blur: calculateBlurIntensity(count),
      progress: getUnlockProgress(count),
      unlocked: isPhotoUnlocked(count),
    }));

    // Verify blur decreases monotonically (or stays same)
    for (let i = 1; i < progression.length; i++) {
      expect(progression[i].blur).toBeLessThanOrEqual(progression[i - 1].blur);
    }

    // Verify progress increases monotonically
    for (let i = 1; i < progression.length; i++) {
      expect(progression[i].progress).toBeGreaterThan(progression[i - 1].progress);
    }

    // Verify unlocked only at the end
    for (let i = 0; i < progression.length - 1; i++) {
      expect(progression[i].unlocked).toBe(false);
    }
    expect(progression[progression.length - 1].unlocked).toBe(true);
  });

  it('should have correct milestone transitions', () => {
    const transitions = [
      { from: 0, to: 1, nextMilestone: 1 },
      { from: 1, to: 2, nextMilestone: 3 },
      { from: 2, to: 3, nextMilestone: 3 },
      { from: 3, to: 4, nextMilestone: 5 },
      { from: 4, to: 5, nextMilestone: 5 },
      { from: 5, to: 6, nextMilestone: 8 },
      { from: 6, to: 7, nextMilestone: 8 },
      { from: 7, to: 8, nextMilestone: 8 },
    ];

    transitions.forEach(({ from, to, nextMilestone }) => {
      const milestone = getNextMilestone(from);
      expect(milestone?.count).toBe(nextMilestone);
    });
  });
});

describe('Performance tests', () => {
  it('should execute calculateBlurIntensity quickly', () => {
    const iterations = 10000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      calculateBlurIntensity(i % 10);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100); // Should complete in less than 100ms
  });

  it('should execute all utility functions quickly', () => {
    const iterations = 1000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      const count = i % 10;
      calculateBlurIntensity(count);
      getUnlockProgress(count);
      isPhotoUnlocked(count);
      getNextMilestone(count);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100); // Should complete in less than 100ms
  });
});

describe('Type safety and consistency', () => {
  it('should always return numbers from calculateBlurIntensity', () => {
    for (let i = 0; i <= 10; i++) {
      const result = calculateBlurIntensity(i);
      expect(typeof result).toBe('number');
      expect(Number.isFinite(result)).toBe(true);
    }
  });

  it('should always return numbers from getUnlockProgress', () => {
    for (let i = 0; i <= 10; i++) {
      const result = getUnlockProgress(i);
      expect(typeof result).toBe('number');
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    }
  });

  it('should always return booleans from isPhotoUnlocked', () => {
    for (let i = 0; i <= 10; i++) {
      const result = isPhotoUnlocked(i);
      expect(typeof result).toBe('boolean');
    }
  });

  it('should return consistent milestone objects or null', () => {
    for (let i = 0; i <= 10; i++) {
      const result = getNextMilestone(i);
      if (result !== null) {
        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('label');
        expect(typeof result.count).toBe('number');
        expect(typeof result.label).toBe('string');
      }
    }
  });
});
