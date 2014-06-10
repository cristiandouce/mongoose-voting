var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , voting = require('../')
  , assert = require('assert')

// Connect mongoose to mongodb
mongoose.connect('mongodb://localhost/mongoose_test_voting');

// Define User Model to work with
var User = mongoose.model('User', new Schema({
  name: String
}));

// Define Comment Schema to work with
var CommentSchema = new Schema({
  text: String,
  author: {
    type: Schema.ObjectId,
    ref: "User"
  }
});

// Extend Comment's Schema with voting plugin
CommentSchema.plugin(voting, { ref: 'User' });

// Define Comment Model to work with
var Comment = mongoose.model('Comment', CommentSchema);

describe('voting', function () {
  var author = {};
  var comment = {};

  before(function (done) {
    // Wait for mongoose to connect
    mongoose.connection.on('open', function () {
      // Also, clear database before tests
      mongoose.connection.db.dropDatabase(function (err) {
        if (err) return done(err);
        done();
      });
    });
  });

  beforeEach(function() {
    author = new User({ name: 'Cristian' });
    comment = new Comment({ text: 'Hey, this is a comment!', author: author });

    assert.equal(0, comment.vote.positive.length);
    assert.equal(0, comment.vote.negative.length);
  });

  describe('upvote', function() {
    it('should vote positive', function(done) {

      comment.upvote(author);
      assert.equal(1, comment.vote.positive.length);
      assert.equal(0, comment.vote.negative.length);


      done();
    });

    it('should vote positive once', function(done) {

      comment.upvote(author);
      comment.upvote(author);
      assert.equal(1, comment.vote.positive.length);
      assert.equal(0, comment.vote.negative.length);

      done();
    });

    it('should change vote from negative to positive', function(done) {

      comment.vote.negative.addToSet(author);
      assert.equal(1, comment.vote.negative.length);

      comment.upvote(author);
      assert.equal(1, comment.vote.positive.length);
      assert.equal(0, comment.vote.negative.length);

      done();
    });

    it('should save document when callback fn is provided', function(done) {
      // give mongo a little extra time.
      this.timeout(5000);

      comment.upvote(author, function(err, doc) {
        if (err) {
          return done(err)
        };

        assert.equal(doc, comment);

        done();
      });
    });

    it('should have saved positive voting', function(done) {
      // give mongo a little extra time.
      this.timeout(5000);

      comment.upvote(author, function(err, doc) {
        if (err) {
          return done(err)
        };

        assert.equal(1, comment.vote.positive.length);
        assert.equal(0, comment.vote.negative.length);

        done();
      });
    });


  });

  describe('downvote', function() {
    it('should vote negative', function(done) {

      comment.downvote(author);
      assert.equal(0, comment.vote.positive.length);
      assert.equal(1, comment.vote.negative.length);

      done();
    });

    it('should vote negative once', function(done) {

      comment.downvote(author);
      comment.downvote(author);
      assert.equal(0, comment.vote.positive.length);
      assert.equal(1, comment.vote.negative.length);

      done();
    });

    it('should change vote from positive to negative', function(done) {

      comment.vote.positive.addToSet(author);
      assert.equal(1, comment.vote.positive.length);

      comment.downvote(author);
      assert.equal(0, comment.vote.positive.length);
      assert.equal(1, comment.vote.negative.length);

      done();
    });

    it('should save document when callback fn is provided', function(done) {
      // give mongo a little extra time.
      this.timeout(5000);

      comment.downvote(author, function(err, doc) {
        if (err) {
          return done(err)
        };

        assert.equal(doc, comment);

        done();
      });
    });

    it('should have saved negative voting', function(done) {
      // give mongo a little extra time.
      this.timeout(5000);

      comment.downvote(author, function(err, doc) {
        if (err) {
          return done(err)
        };

        assert.equal(0, comment.vote.positive.length);
        assert.equal(1, comment.vote.negative.length);

        done();
      });
    });

  });

  describe.only('unvote', function() {
    it('should unvote', function(done) {
      var author2 = new User({ name: 'Jorge' });

      comment.upvote(author);
      comment.downvote(author2);

      assert.equal(author.id, comment.vote.positive[0]);
      assert.equal(author2.id, comment.vote.negative[0]);

      comment.unvote(author);
      assert.equal(0, comment.vote.positive.length);
      assert.equal(1, comment.vote.negative.length);

      comment.unvote(author2);
      assert.equal(0, comment.vote.positive.length);
      assert.equal(0, comment.vote.negative.length);

      done();
    });

    it('should save document when callback fn is provided', function(done) {
      // give mongo a little extra time.
      this.timeout(5000);

      comment.upvote(author, function (err, doc) {
        assert.equal(comment, doc);

        comment.unvote(author, function(err, doc) {
          if (err) {
            return done(err)
          };

          assert.equal(doc, comment);

          done();
        });

      });
    });
  });

  describe('upvoted', function() {
    it('should success if voted positive', function(done) {
      comment.upvote(author);

      assert.ok(comment.upvoted(author));

      done();
    });

    it('should fail if voted negative', function(done) {
      comment.downvote(author);

      assert.equal(false, comment.upvoted(author));

      done();
    });
  });

  describe('downvoted', function() {
    it('should success if voted negative', function(done) {
      comment.downvote(author);

      assert.ok(comment.downvoted(author));

      done();
    });

    it('should fail if voted positive', function(done) {
      comment.upvote(author);

      assert.equal(false, comment.downvoted(author));

      done();
    });
  });

  describe('upvotes', function() {
    it('should retrieve one vote per user upvoting', function(done) {
      var author2 = new User({ name: 'Jorge' });

      comment.downvote(author);
      assert.equal(0, comment.upvotes());

      comment.upvote(author2);
      assert.equal(1, comment.upvotes());

      comment.upvote(author);
      assert.equal(2, comment.upvotes());

      done();
    });
  });

  describe('downvotes', function() {
    it('should retrieve one vote per user downvoting', function(done) {
      var author2 = new User({ name: 'Jorge' });

      comment.upvote(author);
      assert.equal(0, comment.downvotes());

      comment.downvote(author2);
      assert.equal(1, comment.downvotes());

      comment.downvote(author);
      assert.equal(2, comment.downvotes());

      done();
    });
  });

  describe('votes', function() {
    it('should retrieve one vote per user voting', function(done) {
      var author2 = new User({ name: 'Jorge' });

      comment.upvote(author);
      assert.equal(1, comment.votes());

      comment.downvote(author2);
      assert.equal(2, comment.votes());

      comment.downvote(author);
      assert.equal(2, comment.votes());

      done();
    });
  });

  after(function () {
    // Clear database after tests
    mongoose.connection.db.dropDatabase(function (err) {
      if (err) return done(err);
      done();
    });
  });

});
