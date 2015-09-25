couchtuner-companion
====================

A Chrome companion extension for the Couchtuner website.

In order to hack on this project, you'll need to create symlinks of all of the common-* dirs inside each implementation.

The symlink approach did not seem to work for Chrome on OSX -- the extension would load correctly in the extension manager, but when using the extensions, all of the files inside symlinked folders seemed to be blank in the inspector. Your mileage may vary. However, I was able to get symlinks working flawlessly on my Windows computer.

Example:

Unix:

`ln -s $(pwd)/common-* $(pwd)/couchtuner/ $(pwd)/putlocker/`

Windows:

`MKLINK /D common-js couchtuner/common-js`

`MKLINK /D common-css couchtuner/common-css`

`MKLINK /D common-html couchtuner/common-html`

Eventually, I'll add a batch / shell script to create these links.
