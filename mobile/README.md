# dSocial Mobile APP

## Requirements

The dSocial mobile app uses Expo. You can review the general expo requirements:

- Expo Requiments: https://docs.expo.dev/get-started/installation/
- Configure buff registry: `$ npm config set @buf:registry  https://buf.build/gen/npm/v1/`

Here are specific steps to install the requirements on your platform.

### Install requirements for macOS 13 and macOS 14

(If you are on Ubuntu, see the next section to install requirements.)

Install Xcode. To install the Command Line Developer Tools, in a terminal enter:

```sh
xcode-select --install
```

After the Developer Tools are installed, we need to make sure it is updated. In
System Preferences, click Software Update and update it if needed.

To install asdf using brew, follow instructions at https://asdf-vm.com . In short,
first install brew following the instructions at https://brew.sh . Then, in
a terminal enter:

```sh
brew install asdf gnu-tar gpg
```

If your terminal is zsh, enter:

```sh
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
```

If your terminal is bash, enter:

```sh
echo -e "\n. \"$(brew --prefix asdf)/libexec/asdf.sh\"" >> ~/.bash_profile
```

Start a new terminal to get the changes to the environment .

(optional) To install Android Studio, download and install the latest
android-studio-{version}-mac.dmg from https://developer.android.com/studio .
(Tested with Jellyfish 2023.3.1 .)

### Install requirements for Ubuntu 20.04, 22.04 and 24.04

To install asdf, follow instructions at https://asdf-vm.com . In short, in
a terminal enter:

```sh
sudo apt install curl git make
git clone https://github.com/asdf-vm/asdf.git ~/.asdf
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
echo 'export ANDROID_HOME="$HOME/Android/Sdk"' >> ~/.bashrc
echo 'export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/23.1.7779620"' >> ~/.bashrc
```

Start a new terminal to get the changes to the environment .

To install Android Studio, download the latest
android-studio-{version}-linux.tar.gz from
https://developer.android.com/studio . (Tested with Jellyfish 2023.3.1 .)
In a terminal, enter the following with the correct {version}:

```sh
sudo tar -C /usr/local -xzf android-studio-{version}-linux.tar.gz
```

To launch Android Studio, in a terminal enter:

```sh
/usr/local/android-studio/bin/studio.sh &
```

## 🚀 How to use

### Build for iOS

#### Install the tools with asdf (only need to do once)

```sh
make asdf.install_tools
```

If you get an error like "https://github.com/CocoaPods/CLAide.git (at master@97b765e) is not yet checked out" then reinstall cocoapods like this:

```sh
asdf uninstall cocoapods
make asdf.install_tools
```

```sh
# to build and run on ios:
make ios
```

### Build for Android

#### Install the tools with asdf (only need to do once)

(If not building for iOS, edit the file `.tool-versions` and remove the unneeded lines for `ruby` and `cocoapods`.)

```sh
make asdf.install_tools
```

#### Set up the Android NDK

* Launch Android Studio and accept the default startup options. Create a new
  default project (so that we get the main screen).
* On the Tools menu, open the SDK Manager.
* In the "SDK Tools" tab, click "Show Package Details". Expand
  "NDK (Side by side)" and check "23.1.7779620".
* Click OK to install and close the SDK Manager.

```sh
# to build and run on android:
make android

# to start Metro Bundler:
make start
```

## Manual release to Google Play Store and Apple App Store

The manual release process uses the [`eas`](https://docs.expo.dev/build/setup/#install-the-latest-eas-cli) CLI to submit the app to the stores.

### Apple App Store

1. Download the `GoogleService-Info.plist` file from the Firebase Console.
2. Run `make ios.release_production` to build the app.
3. After the build is complete, submit it to the App Store running `eas submit --platform ios`

### Google Play Store

1. Download the `google-services.json` file from the Firebase Console.
2. Run `make android.release_production` to build the app.
3. After the build is complete, submit it to the Play Store running `eas submit --platform android`
You'll need to have a [service account json file](https://developers.google.com/android/management/service-account) to authenticate with Google Play Store.

## Opening the App using Links

Paste these links inside the mobile app Browser to 'wakeup' the app:

`tech.berty.dsocial://?hello=world`

The schema is:

npx uri-scheme open exp+gnokey://somepath/into/app?hello=world --ios

```sh
$ npx uri-scheme open tech.berty.dsocial://?hello=world --ios
```

