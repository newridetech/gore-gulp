/**
 * Copyright (c) 2015-present, goreutils
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

var path = require("path"),
    _ = require("lodash"),
    defaults = require(path.join(__dirname, "..", "defaults")),
    eslint = require("gulp-eslint"),
    fs = require("fs"),
    gulpif = require("gulp-if"),
    Promise = require("bluebird");

function awaitEslintrc(config) {
    var bundledEslintrc = path.join(__dirname, "..", "..", "eslint", ".eslintrc"),
        userEslintrc = path.join(config.baseDir, ".eslintrc");

    return new Promise(function (resolve, reject) {
        fs.stat(userEslintrc, function (err, stat) {
            if (err) {
                if ("ENOENT" === err.code) {
                    resolve(bundledEslintrc);
                } else {
                    reject(err);
                }
            } else if (stat.isFile()) {
                resolve(userEslintrc);
            } else {
                resolve(bundledEslintrc);
            }
        });
    });
}

function awaitGlobPattern(config, pckgPromise) {
    return pckgPromise.then(function (pckg) {
        return [
            path.resolve(config.baseDir, pckg.directories.lib, "**", "*" + defaults.ecmaScriptFileExtensionsGlobPattern),
            "!" + path.resolve(config.baseDir, pckg.directories.lib, "**", "__fixtures__", "**", "*")
        ];
    });
}

function normalizeGlobals(pckg) {
    return _.mapValues(pckg.provide, _.constant(false));
}

module.exports = function (config, pckgPromise, gulp) {
    var initPromises = [
        awaitEslintrc(config),
        awaitGlobPattern(config, pckgPromise),
        pckgPromise
    ];

    return function () {
        return Promise.all(initPromises)
            .spread(function (eslintrc, globPattern, pckg) {
                return new Promise(function (resolve, reject) {
                    gulp.src(globPattern)
                        .pipe(eslint({
                            "configFile": eslintrc,
                            "globals": normalizeGlobals(pckg),
                            "plugins": [
                                "react"
                            ],
                            "useEslintrc": false
                        }))
                        .pipe(gulpif(!pckg.config.isSilent, eslint.format()))
                        .pipe(eslint.failAfterError())
                        // force data to flow by reading from pipe
                        .on("data", _.noop)
                        .on("error", reject)
                        .on("finish", resolve);
                });
            });
    };
};
