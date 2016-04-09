/**
 * Copyright (c) 2015-present, goreutils
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/* global describe: false, it: false */

const config = require("../config");
const gg = require("../../index");
const Gulp = require("gulp").Gulp;
const path = require("path");
const Promise = require("bluebird");

function runDirectory(baseDir) {
    const gulpInstance = new Gulp();

    gg({
        "baseDir": baseDir
    }).setup(gulpInstance);

    return new Promise(function (resolve, reject) {
        gulpInstance.on("err", reject);
        gulpInstance.on("stop", resolve);

        gulpInstance.start("lint");
    });
}

describe("lint", function () {
    this.timeout(config.timeout);

    it("detects code flaws", function (done) {
        runDirectory(path.join(__dirname, "..", "..", "__fixtures__", "test-library-8"))
            .then(function () {
                done(new Error("Linter should detect errors!"));
            })
            .catch(function (err) {
                if ("space-preconfigured-eslint" === err.err.plugin) {
                    done();
                } else {
                    done(err);
                }
            });
    });

    it("should ignore errors when library uses 'provide' shim", function (done) {
        runDirectory(path.resolve(__dirname, "..", "..", "__fixtures__", "test-library-9")).asCallback(done);
    });
});
