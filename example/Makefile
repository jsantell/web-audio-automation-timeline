BROWSERIFY=../node_modules/browserify/bin/cmd.js
EXAMPLE=./

all: browserify

browserify:
	mkdir -p $(EXAMPLE)/scripts
	node $(BROWSERIFY) ../index.js --standalone Timeline > $(EXAMPLE)/scripts/timeline.js

.PHONY: browserify
