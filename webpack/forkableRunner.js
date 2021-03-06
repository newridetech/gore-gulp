/**
 * Copyright (c) 2016-present, goreutils
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const development = require('./config/babel/web/development');
const production = require('./config/babel/web/production');
const Promise = require('bluebird');
const webpack = require('webpack');

module.exports = function runWebpack(inp, callback) {
  const webpackConfigPromise = inp.variant === 'production' ? (
    production(inp.config, inp.pckg, inp.entries)
  ) : (
    development(inp.config, inp.pckg, inp.entries)
  );

  webpackConfigPromise.then(webpackConfig => (
    Promise.fromCallback(webpackCallback => {
      webpack(webpackConfig, err => {
        webpackCallback(err, webpackConfig);
      });
    })
  )).asCallback((err, data) => {
    if (err) {
      callback(err.toString(), data);
    } else {
      callback(null, data);
    }
  });
};
