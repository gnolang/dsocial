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

android.reverse:
	adb reverse tcp:8081 tcp:8081
	adb reverse tcp:36657 tcp:36657
	adb reverse tcp:8545 tcp:8545
.PHONY: android.reverse

start: node_modules
	yarn start
.PHONY: start

# - asdf

asdf.add_plugins:
	$(call check-program, asdf)
	@echo "Installing asdf plugins..."
	@set -e; \
	for PLUGIN in $$(cut -d' ' -f1 .tool-versions | grep "^[^\#]"); do \
		asdf plugin add $$PLUGIN || [ $$?==2 ] || exit 1; \
	done

asdf.install_tools: asdf.add_plugins
	$(call check-program, asdf)
	@echo "Installing asdf tools..."
	@asdf install

clean:
	$(call check-program, yarn)

	# React-Native cmd
	yarn cache clean -f

# React-Native files
	rm -rf .tmp
	rm -rf node_modules
	rm -rf /tmp/react-native-packager-cache-*
	rm -rf /tmp/metro-bundler-cache-*
	rm -rf .eslintcache

	# Android files
	rm -rf android/.gradle
	rm -rf android/build
	rm -rf android/app/build
	rm -f android/libs/gobridge.aar

	# iOS files
	rm -rf ios/build
	rm -rf ios/Pods

.PHONY: clean

clean_install: clean node_modules
	cd ios && pod install
.PHONY: clean_install

release: node_modules
	yarn build
	eas build --platform ios --profile production
.PHONY: release

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  ios            - Build the iOS app"
	@echo "  android        - Build the Android app"
	@echo "  start          - Start the metro server"
	@echo "  clean          - Clean the project"
	@echo "  clean_install  - Clean the project and install dependencies"
	@echo "  release        - Build the app for production"
	@echo "  help           - Show this help message"
.PHONY: help
