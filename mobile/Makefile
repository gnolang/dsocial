check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))

node_modules: package.json package-lock.json
	$(call check-program, npm)
	(npm install && touch $@) || true
.PHONY: node_modules

ios: node_modules
	cd ios; pod install
	npm run ios
.PHONY: ios

ios.release-mode: node_modules
	npx expo run:ios --configuration Release
.PHONY: ios.release-mode

android: node_modules
	npm run android
.PHONY: android

android.reverse:
	$(call check-program, adb)
	$(if $(ANDROID_DEVICE),,$(eval ANDROID_DEVICE = $(shell adb devices | tail +2 | head -1 | cut -f 1)))
	@if [ -z "$(ANDROID_DEVICE)" ]; then \
	  >&2 echo "ERROR: no Android device found"; exit 1; \
	fi
	adb -s $(ANDROID_DEVICE) reverse tcp:8081 tcp:8081 # metro
	adb -s $(ANDROID_DEVICE) reverse tcp:36657 tcp:36657 # gnoland
	adb -s $(ANDROID_DEVICE) reverse tcp:8545 tcp:8545 # faucet
	adb -s $(ANDROID_DEVICE) reverse tcp:26660 tcp:26660 # indexer
.PHONY: android.reverse

start: node_modules
	npm run start
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
	$(call check-program, npm)

	# React-Native cmd
	npm cache clean --force

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
	npm run build
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
