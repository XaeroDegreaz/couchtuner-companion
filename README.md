couchtuner-companion
====================

A Chrome companion extension for the Couchtuner website.

In order to hack on this project, you'll need to create symlinks of all of the common-* dirs inside each implementation.

Example:

Unix:

`ln -s common-js couchtuner/common-js`

`ln -s common-css couchtuner/common-css`

`ln -s common-html couchtuner/common-html`

Windows:

`MKLINK /D common-js couchtuner/common-js`

`MKLINK /D common-css couchtuner/common-css`

`MKLINK /D common-html couchtuner/common-html`

Eventually, I'll add a batch / shell script to create these links.