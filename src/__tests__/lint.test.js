/**
 * Copyright (c) 2015-present, goreutils
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const gg = require('../index');
const Gulp = require('gulp').Gulp;
const path = require('path');
const Promise = require('bluebird');
const test = require('lookly-preset-ava/test');

function runDirectory(baseDir) {
  const gulpInstance = new Gulp();

  gg({
    baseDir,
    silent: true,
  }).setup(gulpInstance);

  return new Promise((resolve, reject) => {
    gulpInstance.on('err', reject);
    gulpInstance.on('stop', resolve);

    gulpInstance.start('lint');
  });
}

test('detects code flaws', () => (
  runDirectory(path.join(__dirname, '..', '__fixtures__', 'test-library-8'))
    .then(() => {
      throw new Error('Linter should detect errors!');
    })
    .catch(err => {
      if (err.err && err.err.plugin !== 'lookly-preset-eslint') {
        throw err;
      }
    })
));

test("should ignore errors when library uses 'provide' shim", () => (
  runDirectory(path.resolve(__dirname, '..', '__fixtures__', 'test-library-9'))
));
