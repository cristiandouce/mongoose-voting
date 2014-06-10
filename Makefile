TESTS = test/*.js

test: node_modules
	@./node_modules/.bin/mocha --reporter list $(TESTFLAGS) $(TESTS)

node_modules:
	@npm install

.PHONY: test