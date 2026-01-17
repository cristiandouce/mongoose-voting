import mongoose, { Schema, Types } from 'mongoose';
import votingPlugin from '../src';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mongoose-voting-tests';

const deleteModelIfExists = (modelName: string) => {
  if (mongoose.modelNames().includes(modelName)) {
    mongoose.deleteModel(modelName);
  }
};

describe('mongoose-voting plugin (integration)', () => {
  const connection = mongoose;

  beforeAll(async () => {
    await connection.connect(MONGODB_URI);

    deleteModelIfExists('IntegrationUser');
    deleteModelIfExists('IntegrationComment');

    const userSchema = new Schema({ name: String });
    connection.model('IntegrationUser', userSchema);

    const commentSchema = new Schema({
      text: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: 'IntegrationUser'
      }
    });

    commentSchema.plugin(votingPlugin, { ref: 'IntegrationUser' });
    connection.model('IntegrationComment', commentSchema);
  });

  afterAll(async () => {
    await connection.connection.dropDatabase();
    await connection.disconnect();
    deleteModelIfExists('IntegrationUser');
    deleteModelIfExists('IntegrationComment');
  });

  afterEach(async () => {
    await Promise.all([
      connection.model('IntegrationUser').deleteMany({}),
      connection.model('IntegrationComment').deleteMany({})
    ]);
  });

  it('persists positive votes when saving', async () => {
    const User = connection.model('IntegrationUser');
    const Comment = connection.model('IntegrationComment');

    const author = await User.create({ name: 'Cristian' });
    const comment = await Comment.create({ text: 'Hello world', author: author._id });

    comment.upvote(author);
    await comment.save();

    const persisted = await Comment.findById(comment._id).orFail();

    expect(persisted.vote.positive).toHaveLength(1);
    expect(persisted.vote.negative).toHaveLength(0);
    expect(persisted.upvoted(author._id)).toBe(true);
  });

  it('persists negative votes when saving', async () => {
    const User = connection.model('IntegrationUser');
    const Comment = connection.model('IntegrationComment');

    const author = await User.create({ name: 'Another author' });
    const comment = await Comment.create({ text: 'Second comment', author: author._id });

    comment.downvote(author);
    await comment.save();

    const persisted = await Comment.findById(comment._id).orFail();

    expect(persisted.vote.positive).toHaveLength(0);
    expect(persisted.vote.negative).toHaveLength(1);
    expect(persisted.downvoted(author._id)).toBe(true);
  });

  it('saves when callback is provided', async () => {
    const User = connection.model('IntegrationUser');
    const Comment = connection.model('IntegrationComment');

    const author = await User.create({ name: 'Callback user' });
    const comment = await Comment.create({ text: 'Callback comment', author: author._id });

    await new Promise<void>((resolve, reject) => {
      comment.upvote(author, (error: unknown | null, updated: typeof comment) => {
        try {
          expect(error).toBeNull();
          expect(updated.vote.positive).toHaveLength(1);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    });

    const persisted = await Comment.findById(comment._id).orFail();
    expect(persisted.vote.positive).toHaveLength(1);
  });

  it('supports mixed voting interactions', async () => {
    const User = connection.model('IntegrationUser');
    const Comment = connection.model('IntegrationComment');

    const [first, second] = await User.create([
      { name: 'First user' },
      { name: 'Second user' }
    ]);

    const comment = await Comment.create({ text: 'Mixed votes', author: first._id });

    comment.upvote(first);
    comment.downvote(second);
    comment.unvote(first);
    comment.upvote(second);

    await comment.save();

    const persisted = await Comment.findById(comment._id).orFail();

    expect(persisted.vote.positive).toHaveLength(1);
    expect(persisted.vote.negative).toHaveLength(0);
    expect(persisted.upvoted(second._id)).toBe(true);
    expect(persisted.votes()).toBe(1);
  });
});
