import mongoose, { Schema, Types } from 'mongoose';
import votingPlugin from './index';

describe('mongoose-voting plugin (unit)', () => {
  const connection = mongoose;

  const deleteModelIfExists = (modelName: string) => {
    if (connection.modelNames().includes(modelName)) {
      connection.deleteModel(modelName);
    }
  };

  const createAuthor = () => ({
    _id: new Types.ObjectId(),
    name: 'Author'
  });

  const createComment = () => {
    const Comment = connection.model('Comment');
    return new Comment({ text: 'Test comment' });
  };

  beforeAll(() => {
    deleteModelIfExists('User');
    deleteModelIfExists('Comment');

    const userSchema = new Schema({ name: String });
    connection.model('User', userSchema);

    const commentSchema = new Schema({ text: String });
    commentSchema.plugin(votingPlugin, { ref: 'User' });
    connection.model('Comment', commentSchema);
  });

  afterAll(() => {
    deleteModelIfExists('User');
    deleteModelIfExists('Comment');
  });

  it('adds upvote without duplicating entries', () => {
    const author = createAuthor();
    const comment = createComment();

    comment.upvote(author);
    comment.upvote(author);

    expect(comment.vote.positive).toHaveLength(1);
    expect(comment.vote.negative).toHaveLength(0);
  });

  it('moves negative vote to positive when upvoted', () => {
    const author = createAuthor();
    const comment = createComment();

    comment.downvote(author);
    comment.upvote(author);

    expect(comment.vote.positive).toHaveLength(1);
    expect(comment.vote.negative).toHaveLength(0);
  });

  it('adds downvote without duplicating entries', () => {
    const author = createAuthor();
    const comment = createComment();

    comment.downvote(author);
    comment.downvote(author);

    expect(comment.vote.positive).toHaveLength(0);
    expect(comment.vote.negative).toHaveLength(1);
  });

  it('moves positive vote to negative when downvoted', () => {
    const author = createAuthor();
    const comment = createComment();

    comment.upvote(author);
    comment.downvote(author);

    expect(comment.vote.positive).toHaveLength(0);
    expect(comment.vote.negative).toHaveLength(1);
  });

  it('removes votes when unvote is called', () => {
    const author = createAuthor();
    const comment = createComment();

    comment.upvote(author);
    expect(comment.vote.positive).toHaveLength(1);

    comment.unvote(author);
    expect(comment.vote.positive).toHaveLength(0);
    expect(comment.vote.negative).toHaveLength(0);
  });

  it('supports voting with string identifiers', () => {
    const author = createAuthor();
    const comment = createComment();

    const stringId = author._id.toString();

    comment.upvote(stringId);
    expect(comment.upvoted(stringId)).toBe(true);

    comment.downvote(stringId);
    expect(comment.downvoted(stringId)).toBe(true);
  });

  it('reports voting state correctly', () => {
    const author = createAuthor();
    const author2 = createAuthor();
    const comment = createComment();

    comment.upvote(author);
    comment.downvote(author2);

    expect(comment.upvoted(author)).toBe(true);
    expect(comment.downvoted(author)).toBe(false);
    expect(comment.downvoted(author2)).toBe(true);
    expect(comment.voted(author2)).toBe(true);
  });

  it('counts votes correctly', () => {
    const author = createAuthor();
    const author2 = createAuthor();
    const comment = createComment();

    comment.upvote(author);
    comment.downvote(author2);

    expect(comment.upvotes()).toBe(1);
    expect(comment.downvotes()).toBe(1);
    expect(comment.votes()).toBe(2);
  });

  it('invokes save when upvote callback is provided', async () => {
    const author = createAuthor();
    const comment = createComment();
    const saveSpy = jest
      .spyOn(comment, 'save')
      .mockResolvedValue(comment);

    await new Promise<void>((resolve, reject) => {
      comment.upvote(author, (error: unknown | null, updated: typeof comment) => {
        try {
          expect(error).toBeNull();
          expect(updated.vote.positive).toHaveLength(1);
          expect(updated.vote.negative).toHaveLength(0);
          expect(saveSpy).toHaveBeenCalledTimes(1);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    });

    saveSpy.mockRestore();
  });

  it('invokes save when downvote callback is provided', async () => {
    const author = createAuthor();
    const comment = createComment();
    const saveSpy = jest
      .spyOn(comment, 'save')
      .mockResolvedValue(comment);

    await new Promise<void>((resolve, reject) => {
      comment.downvote(author, (error: unknown | null, updated: typeof comment) => {
        try {
          expect(error).toBeNull();
          expect(updated.vote.positive).toHaveLength(0);
          expect(updated.vote.negative).toHaveLength(1);
          expect(saveSpy).toHaveBeenCalledTimes(1);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    });

    saveSpy.mockRestore();
  });

  it('invokes save when unvote callback is provided', async () => {
    const author = createAuthor();
    const comment = createComment();
    comment.upvote(author);

    const saveSpy = jest
      .spyOn(comment, 'save')
      .mockResolvedValue(comment);

    await new Promise<void>((resolve, reject) => {
      comment.unvote(author, (error: unknown | null, updated: typeof comment) => {
        try {
          expect(error).toBeNull();
          expect(updated.vote.positive).toHaveLength(0);
          expect(updated.vote.negative).toHaveLength(0);
          expect(saveSpy).toHaveBeenCalledTimes(1);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    });

    saveSpy.mockRestore();
  });
});
