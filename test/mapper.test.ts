import { describe, it, expect } from 'vitest';
import { Post, PostMapper } from '../examples/value-objects/post';


  describe('Post and Mapper Example', () => {
    // Import the necessary classes from your example
    // We'll need to export these classes from the example file
    
    
    it('should map between domain and persistence models', () => {
      const mapper = new PostMapper();
      const createdAt = new Date('2025-01-01');
      
      // Create domain model
      const post = Post.create({
        id: '123',
        title: 'Test Post',
        createdAt
      }).value;
      
      // Map to persistence
      const persistenceModel = mapper.toPersistence(post);
      expect(persistenceModel).toEqual({
        id: '123',
        title: 'Test Post',
        createdAt
      });
      
      // Map back to domain
      const domainModel = mapper.toDomain(persistenceModel).value;
      expect(domainModel.id).toBe('123');
      expect(domainModel.title.value).toBe('Test Post');
      expect(domainModel.createdAt).toEqual(createdAt);
    });
  });