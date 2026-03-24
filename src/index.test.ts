import mongoose, { Schema, Types } from 'mongoose';
import voting from './index';

describe('mongoose-voting plugin (unit)', () => {
  const connection = mongoose;

  const deleteModelIfExists = (name: string) => {
    if (connection.modelNames().includes(name)) {
      connection.deleteModel(name);
    }
  };

  const createAuthor = () => ({
    _id: new Types.ObjectId(),
    name: 'Author',
  });

  const createComment = () => {
    const Comment = connection.model('Comment');
    return new Comment({ text: 'Test comment' });
  };

  beforeAll(() => {
    deleteModelIfExists('User');
    deleteModelIfExists('Comment');

    connection.model('User', new Schema({ name: String }));

    const commentSchema = new Schema({ text: String });
    commentSchema.plugin(voting, { ref: 'User' });
    connection.model('Comment', commentSchema);
  });

  afterAll(() => {
    deleteModelIfExists('User');
    deleteModelIfExists('Comment');
  });

  describe('upvote', () => {
    it('should vote positive', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);

      expect(comment.vote.positive).toHaveLength(1);
      expect(comment.vote.negative).toHaveLength(0);
    });

    it('should vote positive once (no duplicates)', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      comment.upvote(author);

      expect(comment.vote.positive).toHaveLength(1);
      expect(comment.vote.negative).toHaveLength(0);
    });

    it('should change vote from negative to positive', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.downvote(author);
      comment.upvote(author);

      expect(comment.vote.positive).toHaveLength(1);
      expect(comment.vote.negative).toHaveLength(0);
    });
  });

  describe('downvote', () => {
    it('should vote negative', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.downvote(author);

      expect(comment.vote.positive).toHaveLength(0);
      expect(comment.vote.negative).toHaveLength(1);
    });

    it('should vote negative once (no duplicates)', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.downvote(author);
      comment.downvote(author);

      expect(comment.vote.positive).toHaveLength(0);
      expect(comment.vote.negative).toHaveLength(1);
    });

    it('should change vote from positive to negative', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      comment.downvote(author);

      expect(comment.vote.positive).toHaveLength(0);
      expect(comment.vote.negative).toHaveLength(1);
    });
  });

  describe('unvote', () => {
    it('should remove votes', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      expect(comment.vote.positive).toHaveLength(1);

      comment.unvote(author);
      expect(comment.vote.positive).toHaveLength(0);
      expect(comment.vote.negative).toHaveLength(0);
    });

    it('should remove only the specified user vote', () => {
      const author = createAuthor();
      const author2 = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      comment.downvote(author2);

      comment.unvote(author);

      expect(comment.vote.positive).toHaveLength(0);
      expect(comment.vote.negative).toHaveLength(1);
    });
  });

  describe('upvoted', () => {
    it('should return true if user upvoted', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);

      expect(comment.upvoted(author)).toBe(true);
    });

    it('should return false if user downvoted', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.downvote(author);

      expect(comment.upvoted(author)).toBe(false);
    });
  });

  describe('downvoted', () => {
    it('should return true if user downvoted', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.downvote(author);

      expect(comment.downvoted(author)).toBe(true);
    });

    it('should return false if user upvoted', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);

      expect(comment.downvoted(author)).toBe(false);
    });
  });

  describe('voted', () => {
    it('should return true if user voted in any direction', () => {
      const author = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      expect(comment.voted(author)).toBe(true);

      comment.downvote(author);
      expect(comment.voted(author)).toBe(true);
    });

    it('should return false if user has not voted', () => {
      const author = createAuthor();
      const comment = createComment();

      expect(comment.voted(author)).toBe(false);
    });
  });

  describe('upvotes', () => {
    it('should count positive votes', () => {
      const author = createAuthor();
      const author2 = createAuthor();
      const comment = createComment();

      comment.downvote(author);
      expect(comment.upvotes()).toBe(0);

      comment.upvote(author2);
      expect(comment.upvotes()).toBe(1);

      comment.upvote(author);
      expect(comment.upvotes()).toBe(2);
    });
  });

  describe('downvotes', () => {
    it('should count negative votes', () => {
      const author = createAuthor();
      const author2 = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      expect(comment.downvotes()).toBe(0);

      comment.downvote(author2);
      expect(comment.downvotes()).toBe(1);

      comment.downvote(author);
      expect(comment.downvotes()).toBe(2);
    });
  });

  describe('votes', () => {
    it('should count total votes', () => {
      const author = createAuthor();
      const author2 = createAuthor();
      const comment = createComment();

      comment.upvote(author);
      expect(comment.votes()).toBe(1);

      comment.downvote(author2);
      expect(comment.votes()).toBe(2);

      comment.downvote(author);
      expect(comment.votes()).toBe(2);
    });
  });

  describe('string identifiers', () => {
    it('should support voting with string IDs', () => {
      const author = createAuthor();
      const comment = createComment();
      const stringId = author._id.toString();

      comment.upvote(stringId);
      expect(comment.upvoted(stringId)).toBe(true);

      comment.downvote(stringId);
      expect(comment.downvoted(stringId)).toBe(true);
    });
  });
});
