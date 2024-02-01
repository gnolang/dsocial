check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))

node_modules: package.json yarn.lock
	$(call check-program, yarn)
	(yarn && touch $@) || true
.PHONY: node_modules

ios: node_modules
	yarn ios
.PHONY: ios

android: node_modules
	yarn android
.PHONY: android

start: node_modules
	yarn start
.PHONY: start
