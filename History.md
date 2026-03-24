
1.0.0 / 2026-03-22
==================

  * BREAKING: Requires Node >= 20 and mongoose >= 9.0.0
  * BREAKING: Callback overload removed from upvote/downvote/unvote
  * Rewritten in TypeScript with full type exports
  * Dual ESM/CJS build via package exports
  * Migrated from mocha to Jest (unit + integration tests)
  * Migrated CI from Travis CI to GitHub Actions
  * Fixed: vote arrays now default to [] preventing undefined errors
  * Added: Docker Compose for local MongoDB development

0.3.0 / 2015-12-17
==================

  * Drop support for node@0.8 and add 0.12 and 4.2
  * fix .voted(user) throws error: "Cannot read property 'positive' of undefined"
  * Adding documentation for unvote with callback
  * Adding documentation for the unvote option

0.2.0 / 2014-06-10
==================

 * Add new `unvote` method to cancel votes
 * Update to no longer support `vote.census` array
 * Update makefile
 * Merge branch 'master' of github.com:cristiandouce/mongoose-voting
 * Remove node@0.6.x from supported versions
 * Update README.md typo
 * Update package.json module description

0.1.1 / 2013-06-14 
==================

  * Add .upvotes(), .downvotes() and .votes() counters
  * Updated package.json
  * Add travis-ci image to Readme.md

0.1.0 / 2013-06-13 
==================

  * Updated Readme.md
  * Initial commit
