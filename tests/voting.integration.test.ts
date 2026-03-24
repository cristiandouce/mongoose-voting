import mongoose, { Schema } from 'mongoose';
import voting from '../src';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mongoose-voting-tests';

const deleteModelIfExists = (name: string) => {
  if (mongoose.modelNames().includes(name)) {
    mongoose.deleteModel(name);
  }
};

describe('mongoose-voting plugin (integration)', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);

    deleteModelIfExists('IntegrationUser');
    deleteModelIfExists('IntegrationComment');

    mongoose.model('IntegrationUser', new Schema({ name: String }));

    const commentSchema = new Schema({
      text: String,
      author: { type: Schema.Types.ObjectId, ref: 'IntegrationUser' },
    });
    commentSchema.plugin(voting, { ref: 'IntegrationUser' });
    mongoose.model('IntegrationComment', commentSchema);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    deleteModelIfExists('IntegrationUser');
    deleteModelIfExists('IntegrationComment');
  });

  afterEach(async () => {
    await Promise.all([
      mongoose.model('IntegrationUser').deleteMany({}),
      mongoose.model('IntegrationComment').deleteMany({}),
    ]);
  });

  it('persists positive votes when saving', async () => {
    const User = mongoose.model('IntegrationUser');
    const Comment = mongoose.model('IntegrationComment');

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
    const User = mongoose.model('IntegrationUser');
    const Comment = mongoose.model('IntegrationComment');

    const author = await User.create({ name: 'Another author' });
    const comment = await Comment.create({ text: 'Second comment', author: author._id });

    comment.downvote(author);
    await comment.save();

    const persisted = await Comment.findById(comment._id).orFail();

    expect(persisted.vote.positive).toHaveLength(0);
    expect(persisted.vote.negative).toHaveLength(1);
    expect(persisted.downvoted(author._id)).toBe(true);
  });

  it('supports mixed voting interactions', async () => {
    const User = mongoose.model('IntegrationUser');
    const Comment = mongoose.model('IntegrationComment');

    const [first, second] = await User.create([
      { name: 'First user' },
      { name: 'Second user' },
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
