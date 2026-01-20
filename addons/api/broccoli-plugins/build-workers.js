/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const Plugin = require('broccoli-plugin');

const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

module.exports = class BuildWorkers extends Plugin {
  build() {
    this.inputPaths.forEach((inputPath) => {
      this.#buildWorkers(inputPath);
    });
  }

  #buildWorkers(inputPath) {
    const workers = this.#getWorkers(inputPath);

    const workerBuilder = this.#configureWorkerBuilder({
      isProduction: this.isProduction,
      buildDir: this.outputPath,
    });

    Object.entries(workers).map(workerBuilder);
  }

  #getWorkers(inputPath) {
    let workers = {};
    let dir = fs.readdirSync(inputPath);

    dir
      .filter((name) => name.endsWith('-worker.js'))
      .forEach((name) => {
        workers[name] = path.join(inputPath, name);
      });

    return workers;
  }

  #configureWorkerBuilder({ isProduction, buildDir }) {
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
