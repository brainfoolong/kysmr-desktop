# kysmr - Fingerprint keyboard simulator for Windows

Repository is not yet finished. I'm still organizing some things. Come back in a few days.

You have an android smartphone with fingerprint sensor and you want to use your fingerprint authentication to type something on your desktop, maybe your password for your keystore because it's so long that you are bored of typing it in every day? Than you have found a solution here. You can also execute desktop programs by just using your fingerprint.

This app does the following
* Define what keys/string/programs you want to be typed/executed automatically
* Use your fingerprint to execute the keyboard simulation

## What apps you need
* Download and install [release of the desktop application](https://github.com/brainfoolong/kysmr-desktop/releases) ([Github](https://github.com/brainfoolong/kysmr-desktop))
* Download and install a [release of the mobile android app](https://play.google.com/store/apps/details?id=kysmrmobile.nullix.at) ([Github](https://github.com/brainfoolong/kysmr-mobile))

## Requirements
* Have the desktop and mobile phone in the same local network (LAN/WLAN)
* The desktop application must run when you send a command from your mobile app
* It's best when your desktop doesn't change local network ip after reboot. Otherwise you have to re-add the entries on your mobile device

## See it in action
It's not that easy to describe to power and usage of this tool, see it in a video preview.

## Contributing
Fork and make pull requests. Always create an issue before you start working.

## Development
This all is only tested for windows. You need to have [yarn](https://yarnpkg.com) and [node](https://nodejs.org/en/download/) installed. Probably you also need to install build tools with `yarn run build-tools` and `yarn run build-tools-2015`. 
* Clone
* `yarn run install`
* `yarn run compile`
* `yarn run rebuild`
* Start testing app by `yarn run start`

## Create release
Just for release management. `yarn run dist`