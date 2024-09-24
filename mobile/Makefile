check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))
check-file = $(foreach file,$(1),$(if $(wildcard $(file)),,$(error "Missing file: $(file)")))

ts_check:
	npm run ts:check

node_modules: ts_check package.json package-lock.json
	$(call check-program, npm)
	(npm install && touch $@) || true
.PHONY: node_modules

ios: node_modules # Run the iOS app
	npx expo run:ios
.PHONY: ios

# - IOS

ios.release_mode: node_modules # Run the iOS app in release mode
	npx expo run:ios --configuration Release
.PHONY: ios.release_mode

ios.release_production: node_modules
	$(call check-file, GoogleService-Info.plist)
	eas build --platform ios --profile production
.PHONY: ios.release_production

# - Android

android: node_modules # Run the Android app
	npx expo run:android
.PHONY: android

android.release_production: node_modules
	$(call check-file, google-services.json)
	eas build --platform android --profile production
.PHONY: android.release_production

android.reverse:
	$(call check-program, adb)
	$(if $(ANDROID_DEVICE),,$(eval ANDROID_DEVICE = $(shell adb devices | tail +2 | head -1 | cut -f 1)))
	@if [ -z "$(ANDROID_DEVICE)" ]; then \
	  >&2 echo "ERROR: no Android device found"; exit 1; \
	fi
	adb -s $(ANDROID_DEVICE) reverse tcp:8081 tcp:8081 # metro
	adb -s $(ANDROID_DEVICE) reverse tcp:26657 tcp:26657 # gnodev
	adb -s $(ANDROID_DEVICE) reverse tcp:5050 tcp:5050 # faucet
	adb -s $(ANDROID_DEVICE) reverse tcp:8546 tcp:8546 # tx-indexer
	adb -s $(ANDROID_DEVICE) reverse tcp:26660 tcp:26660 # indexer
	adb -s $(ANDROID_DEVICE) reverse tcp:26661 tcp:26661 # push notifications
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

# - Other

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
	rm -rf android

	# iOS files
	rm -rf ios

.PHONY: clean

clean_install: clean node_modules
	cd ios && pod install
.PHONY: clean_install

help:
	@echo "Available make commands:"
	@cat Makefile | grep '^[a-z]' | grep -v '=' | cut -d: -f1 | sort | sed 's/^/  /'
.PHONY: help

