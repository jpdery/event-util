all: build build-compress

build:
	@wrup -r event-util ./ > event-util.js
	@echo "File written to 'event-util.js'"

build-compress:
	@wrup -r event-util ./ > event-util.min.js --compress
	@echo "File written to 'event-util.min.js'"