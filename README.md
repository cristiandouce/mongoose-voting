# mongoose-voting

  Mongoose plugin to upvote/downvote stuff. Extends any model with handy methods for voting.

  [![CI](https://github.com/cristiandouce/mongoose-voting/actions/workflows/ci.yml/badge.svg)](https://github.com/cristiandouce/mongoose-voting/actions/workflows/ci.yml)

## Install

```
  $ npm install mongoose-voting
```

## Usage example

```js
  const voting = require('mongoose-voting');

  const CommentSchema = new Schema({..});

  // Default voter is `User` model
  CommentSchema.plugin(voting);

  // Or you can tell `mongoose-voting`
  // which model references
  CommentSchema.plugin(voting, { ref: 'Author' });

  // ...

  const author = new Author({});
  const comment = new Comment({});

  // upvote and check
  comment.upvote(author);
  comment.upvoted(author);      // true
  comment.downvoted(author);    // false

  // downvote and save
  comment.downvote(author);
  await comment.save();

  comment.voted(author);        // true
```

### TypeScript

```ts
  import voting, { VotingDocument } from 'mongoose-voting';

  const CommentSchema = new Schema({ text: String });
  CommentSchema.plugin(voting, { ref: 'User' });

  type CommentDoc = VotingDocument<{ text: string }>;

  const comment = new Comment({ text: 'Hello' }) as CommentDoc;
  comment.upvote(author);
  comment.upvoted(author);  // true
```

## API

### .upvote(user)
  Upvotes document by user. `user` can be either a model instance (like `User`), an `ObjectId` or even the hex string from `ObjectId`.
```js
  comment.upvote(author);
  comment.voted(author);    // true
  comment.upvoted(author);  // true
```

### .downvote(user)
  Downvotes document by user. `user` can be either a model instance (like `User`), an `ObjectId` or even the hex string from `ObjectId`.
```js
  comment.downvote(author);
  comment.voted(author);      // true
  comment.downvoted(author);  // true
```

### .unvote(user)
  Cancels any vote cast by user. `user` can be either a model instance (like `User`), an `ObjectId` or even the hex string from `ObjectId`.
```js
  comment.upvote(author);
  comment.voted(author);    // true
  comment.unvote(author);
  comment.voted(author);    // false
```

### .upvoted(user)
  Returns `true` if document was 'upvoted' by user. `false` otherwise.
```js
  comment.upvote(user);
  comment.upvoted(user);    // true
  comment.downvoted(user);  // false
```

### .downvoted(user)
  Returns `true` if document was 'downvoted' by user. `false` otherwise.
```js
  comment.downvote(user);
  comment.upvoted(user);    // false
  comment.downvoted(user);  // true
```

### .voted(user)
  Returns `true` if document was 'upvoted' or 'downvoted' by user. `false` otherwise.
```js
  comment.downvote(user);
  comment.voted(user);    // true
  comment.upvote(user);
  comment.voted(user);    // true
```

### .upvotes()
  Returns Number of `upvotes` count.
```js
  comment.downvote(user);
  comment.upvotes();      // 0
  comment.upvote(user);
  comment.upvotes();      // 1
```

### .downvotes()
  Returns Number of `downvotes` count.
```js
  comment.downvote(user);
  comment.downvotes();    // 1
  comment.upvote(user);
  comment.downvotes();    // 0
```

### .votes()
  Returns Number of `votes` count.
```js
  comment.downvote(user);
  comment.votes();          // 1
  comment.upvote(user);
  comment.votes();          // 1
  comment.downvote(user2);
  comment.votes();          // 2
```

## Saving

All voting methods modify the document in memory. Call `save()` to persist:

```js
  comment.upvote(author);
  await comment.save();
```

## Development

```bash
  # Install dependencies
  $ npm install

  # Build (ESM + CJS)
  $ npm run build

  # Run unit tests
  $ npm run test:unit

  # Run integration tests (requires Docker)
  $ npm run test:integration:setup
  $ npm run test:integration
  $ npm run test:integration:teardown
```

## FAQ

### How to work with sub documents?

```js
const article = await Article.findById(req.params.article_id);
const comment = article.comments.id(req.params.comment_id);

comment.upvote(req.user._id);

await article.save();
return res.json(comment);
```

## Migrating from 0.x

v1.0.0 is a major rewrite. Key changes:

- **mongoose >= 9.0.0** required (was ^3.6.11)
- **Node >= 20** required (was 0.10+)
- **TypeScript types** now available: `VotingDocument`, `VotingMethods`, `VoterInput`
- **ESM and CJS** both supported via package exports
- **Callback overload removed**: `upvote(user, fn)` no longer exists. Use `comment.upvote(user); await comment.save();` instead.
- **Vote arrays default to `[]`**: Fixes the old "Cannot read property 'positive' of undefined" bug.

## License

  MIT
