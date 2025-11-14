/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const { WatchedDir } = require('broccoli-source');
const funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const path = require('path');
const Funnel = require('broccoli-funnel');

const buildWorkers = require('./broccoli-plugins/build-workers');

const workerRoot = path.join(__dirname, 'addon', 'workers');

module.exports = {
  name: require('./package').name,

  options: {
    // Don't automatically import sqlite, we need to manually control how it gets used
    autoImport: {
      exclude: ['@sqlite.org/sqlite-wasm'],
    },
  },

  treeForAddon() {
    // Exclude anything in the workers folder from being bundled in the final
    // build as we're manually bundling the files ourselves below.
    const tree = this._super.treeForAddon.apply(this, arguments);
    return funnel(tree, {
      exclude: ['api/workers/**/*'],
    });
  },

  treeForPublic(tree) {
    const env = this.parent?.app?.env ?? 'production';
    const { enableSqlite } = this.parent?.app?.options[this.name] ?? {};

    const isProduction = process.env.EMBER_ENV === 'production';
    let f = new Funnel(tree, {
      // Paths are **relative to the root of the addon tree**.
      // `exclude` accepts an array of glob patterns.
      exclude: isProduction ? ['mirage/**/*.js'] : [],
    });

    tree = this._super.treeForAddon.call(this, f);

    // If sqlite is not enabled and we're not running a test directly in the addon,
    // we don't need to build the workers
    if (!enableSqlite && this.app?.env !== 'test') {
      return tree;
    }

    // We need to process and build our workers separately from ember as these
    // workers are not part of the app and are not getting properly bundled otherwise
    let workerTree = new WatchedDir(workerRoot);
    workerTree = new buildWorkers([workerTree]);
    workerTree.isProduction = env === 'production';

    const workers = funnel(workerTree, {
      destDir: 'workers',
    });

    // Also include the sqlite wasm file directly to be placed next to the workers
    const sqliteWasmDirectoryPath = path.resolve(
      require.resolve('@sqlite.org/sqlite-wasm/sqlite3.wasm'),
      '..',
    );
    const wasmFile = funnel(sqliteWasmDirectoryPath, {
      files: ['sqlite3.wasm'],
      destDir: 'workers',
    });

    const trees = [workers, wasmFile];
    if (tree) {
      trees.push(tree);
    }

    return merge(trees);
  },
};
