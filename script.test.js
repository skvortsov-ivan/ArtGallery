const { add, subtract, multiply, divide } = require('./script');

describe('Calculator', () => {
  
  describe('add()', () => {
    it('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
    
    it('adds negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });
  });
  
  describe('divide()', () => {
    it('divides numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
    });
    
    it('throws error on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });

  describe('subtract()', () => {
    it('subtracts two numbers', () => {
        expect(subtract(5, 3)).toBe(2);
    });
    
    it('subtracts negative numbers', () => {
        expect(subtract(-5, -3)).toBe(-2);
    });
  });
  
  describe('multiply()', () => {
    it('multiplies two numbers', () => {
        expect(multiply(3, 4)).toBe(12);
    });
  
    it('multiplies by zero', () => {
        expect(multiply(5, 0)).toBe(0);
    });
  });
  
});