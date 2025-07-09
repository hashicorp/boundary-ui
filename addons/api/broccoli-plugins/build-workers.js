/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const Plugin = require('broccoli-plugin');

const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

module.exports = class BuildWorkers extends Plugin {
  build() {
    this.inputPaths.forEach((inputPath) => {
      this._buildWorkers(inputPath);
    });
  }

  _buildWorkers(inputPath) {
    const workers = this._getWorkers(inputPath);

    const workerBuilder = this._configureWorkerBuilder({
      isProduction: this.isProduction,
      buildDir: this.outputPath,
    });

    Object.entries(workers).map(workerBuilder);
  }

  _getWorkers(inputPath) {
    let workers = {};
    let dir = fs.readdirSync(inputPath);

    dir.forEach((name) => {
      workers[name] = path.join(inputPath, name);
    });

    return workers;
  }

  _configureWorkerBuilder({ isProduction, buildDir }) {
    return ([name, entryPath]) => {
      esbuild.buildSync({
        loader: { '.js': 'js' },
        entryPoints: [entryPath],
        bundle: true,
        outfile: path.join(buildDir, name),
        format: 'esm',
        minify: isProduction,
        sourcemap: !isProduction,
      });
    };
  }
};
