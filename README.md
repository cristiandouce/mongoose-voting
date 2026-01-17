# mongoose-voting

Mongoose plugin to upvote/downvote stuff. Extends any model with handy methods for voting.

[![Build Status](https://travis-ci.org/cristiandouce/mongoose-voting.png?branch=master)](https://travis-ci.org/cristiandouce/mongoose-voting)

## Install

```
npm install mongoose-voting
```

## Usage example

```ts
import { Schema, model, Types } from 'mongoose';
import voting from 'mongoose-voting';

const CommentSchema = new Schema({ text: String });

// Default voter is the `User` model
CommentSchema.plugin(voting);

// Or you can tell `mongoose-voting` which model to reference
CommentSchema.plugin(voting, { ref: 'Author' });

const Comment = model('Comment', CommentSchema);

const authorId = new Types.ObjectId();
const comment = new Comment({ text: 'Great article!', author: authorId });

comment.upvote(authorId);
comment.upvoted(authorId);      // true
comment.downvoted(authorId);    // false

comment.downvote(authorId, (err, doc) => {
	if (err) throw err;
	doc.downvoted(authorId);      // true
});

comment.voted(authorId);        // true
```

## API

### .upvote(user)
Upvotes document by user. `user` can be a model instance, an `ObjectId`, or the hex string from an `ObjectId`.
```js
comment.upvote(author);
comment.voted(author);    // true
comment.upvoted(author);  // true
```

### .upvote(user, fn)
Same as `.upvote(user)` but calls `save` on the model passing `fn` as a callback.
```js
comment.upvote(author, function(err, doc) {
	doc.voted(author);    // true
	doc.upvoted(author);  // true
});
```

### .downvote(user)
Downvotes document by user. `user` can be a model instance, an `ObjectId`, or the hex string from an `ObjectId`.
```js
comment.upvote(author);
comment.voted(author);    // true
comment.upvoted(author);  // true
```

### .downvote(user, fn)
Same as `.downvote(user)` but calls `save` on the model passing `fn` as a callback.
```js
comment.downvote(author, function(err, doc) {
	doc.voted(author);      // true
	doc.downvoted(author);  // true
});
```

### .unvote(user)
Cancels any vote cast by `user`. The user can be a model instance, an `ObjectId`, or the hex string from an `ObjectId`.
```js
comment.upvote(author);
comment.voted(author);    // true
comment.unvote(author);
comment.voted(author);    // false
```

### .unvote(user, fn)
Same as `.unvote(user)` but calls `save` on the model passing `fn` as a callback.
```js
comment.upvote(author);
comment.voted(author);    // true
comment.unvote(author);
comment.voted(author);    // false
```

### .upvoted(user)
Returns `true` if the document was upvoted by `user`, `false` otherwise.
```js
comment.upvote(user);
comment.upvoted(user);    // true
comment.downvoted(user);  // false
```

### .downvoted(user)
Returns `true` if the document was downvoted by `user`, `false` otherwise.
```js
comment.downvote(user);
comment.upvoted(user);    // false
comment.downvoted(user);  // true
```

### .voted(user)
Returns `true` if the document was upvoted or downvoted by `user`, `false` otherwise.
```js
comment.downvote(user);
comment.voted(user);    // true
comment.upvote(user);
comment.voted(user);    // true
```

### .upvotes()
Returns the number of upvotes.
```js
comment.downvote(user);
comment.upvotes();      // 0
comment.upvote(user);
comment.upvotes();      // 1
```

### .downvotes()
Returns the number of downvotes.
```js
comment.downvote(user);
comment.upvotes();      // 1
comment.upvote(user);
comment.upvotes();      // 0
```

### .votes()
Returns the total number of votes.
```js
comment.downvote(user);
comment.votes();          // 1
comment.upvote(user);
comment.votes();          // 1
comment.downvote(user2);
comment.votes();          // 2
```

## Development

Install dependencies and compile the TypeScript sources:

```
npm install
npm run build
```

Run the Jest unit tests:

```
npm run test:unit
```

Integration tests require Docker to provide MongoDB. The default command orchestrates startup and shutdown:

```
npm run test:integration
```

To manage the container lifecycle manually use the setup and teardown helpers:

```
npm run test:integration:setup
npm run test:integration:teardown
```

## FAQ

### How to work with sub documents?

```js
Article.findById(req.params.article_id, function(err, article) {
	const comment = article.comments.id(req.params.comment_id);

	comment.upvote(req.user._id); // <- this is the key

	article.save(function(err) {
		if (err) {
			return res.status(500).json({ error: 'Cannot save the challenge idea ' + err });
		}
		return res.json(comment);
	});
});
```

## License

MIT
