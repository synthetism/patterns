import { describe, it, expect } from 'vitest';
import { UniqueId  } from '../src/patterns/unique-id';
import { UserId }   from './examples/value-objects/userId';
import { ProductId } from './examples/value-objects/productId';
import { OrderId } from './examples/value-objects/orderId';

describe('UniqueId Pattern', () => {
  describe('UniqueId base class', () => {
    it('should generate a valid UUID when no id is provided', () => {
      const id = new UniqueId();
      expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
    
    it('should use the provided id when valid', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = new UniqueId(uuid);
      expect(id.toString()).toBe(uuid);
    });
    
    it('should validate ids with create method', () => {
      const validResult = UniqueId.create('550e8400-e29b-41d4-a716-446655440000');
      expect(validResult.isSuccess).toBe(true);
      expect(validResult.value.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
      
      const invalidResult = UniqueId.create('invalid-uuid');
      expect(invalidResult.isFailure).toBe(true);
      expect(invalidResult.errorMessage).toBe('ID must be a valid UUID');
    });
    
    it('should compare ids for equality', () => {
      const id1 = new UniqueId('550e8400-e29b-41d4-a716-446655440000');
      const id2 = new UniqueId('550e8400-e29b-41d4-a716-446655440000');
      const id3 = new UniqueId();
      
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });
  
  describe('Specialized ID classes', () => {
    it('should provide type safety for different entity types', () => {
      const userId = new UserId();
      const orderId = new OrderId();
      
      // TypeScript should prevent this assignment
   
      const wrongId: UserId = orderId;
    });
    
    it('should validate specialized ids', () => {
      const validResult = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      expect(validResult.isSuccess).toBe(true);
      expect(validResult.value instanceof UserId).toBe(true);
      
      const invalidResult = UserId.create('invalid-uuid');
      expect(invalidResult.isFailure).toBe(true);
    });
  });
  
  describe('Custom format IDs', () => {
    it('should create valid formatted IDs', () => {
      const validResult = ProductId.create('PRD-123456');
      expect(validResult.isSuccess).toBe(true);
      expect(validResult.value.toString()).toBe('PRD-123456');
      
      const invalidResult = ProductId.create('123456');
      expect(invalidResult.isFailure).toBe(true);
    });
    
    it('should generate new formatted IDs', () => {
      const productId = ProductId.createNew();
      expect(productId.toString()).toMatch(/^PRD-\d{6}$/);
    });
  });
});