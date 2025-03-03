const { afterEachCleanUp } = require('./testing/test-utils.js');
const { shimInit } = require('./shim-init-node.js');
const sharp = require('sharp');
const nodeSqlite = require('sqlite3');
const nodeSqliteCipher = require('@journeyapps/sqlcipher');
const pdfJs = require('pdfjs-dist');
const packageInfo = require('./package.json');

// Used for testing some shared components
const React = require('react');

require('../../jest.base-setup.js')();

shimInit({ sharp, nodeSqlite, nodeSqliteCipher, pdfJs, React, appVersion: () => packageInfo.version });

global.afterEach(async () => {
	await afterEachCleanUp();
});
