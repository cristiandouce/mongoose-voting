# mongoose-voting

  Mongoose plugin to upvote/downvote stuff. Extends any model with handy methods for voting.

  [![Build Status](https://travis-ci.org/cristiandouce/mongoose-voting.png?branch=master)](https://travis-ci.org/cristiandouce/mongoose-voting)

## Install

```
  $ npm install mongoose-voting
```

## Usage example

```js
  var CommentSchema = new Schema({..});

  // Default voter is `User` model
  CommentSchema.plugin(voting);

  // Or you can tell `mongoose-voting`
  // which model references
  CommentSchema.plugin(voting, { ref: 'Author' });

  // ...

  var author = new Author({});
  var comment = new Comment({});

  // upvote and check
  comment.upvote(author);
  comment.upvoted(author);      // true
  comment.downvoted(author);    // false

  // downvote with save
  comment.downvote(author, function(err, doc) {
    assert.equal(doc, comment);  // true
    doc.downvoted(author);      // true
  });

  comment.voted(author);        // true
```

## API

### .upvote(user)
  Upvotes document by user. `user` can be either a model instance (like `User`), an `ObjectId` or even the hex string from `ObjectId`.
```js
  comment.upvote(author);
  comment.voted(author);    // true
  comment.upvoted(author);  // true
```

### .upvote(user, fn)
  Same as `.upvote(user)` but calls `save` on model with `fn` function as callback.
```js
  comment.upvote(author, function(err, doc) {
    doc.voted(author);    // true
    doc.upvoted(author);  // true
  });
```

### .downvote(user)
  Downvotes document by user. `user` can be either a model instance (like `User`), an `ObjectId` or even the hex string from `ObjectId`.
```js
  comment.upvote(author);
  comment.voted(author);    // true
  comment.upvoted(author);  // true
```

### .downvote(user, fn)
  Same as `.downvote(user)` but calls `save` on model with `fn` function as callback.
```js
  comment.downvote(author, function(err, doc) {
    doc.voted(author);      // true
    doc.downvoted(author);  // true
  });
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
  comment.upvotes();      // 1
  comment.upvote(user);
  comment.upvotes();      // 0
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

## Test

```
  $ npm install --dev
  $ make test
```
## License

  MIT
