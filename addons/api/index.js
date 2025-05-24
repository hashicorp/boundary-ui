/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const { WatchedDir } = require('broccoli-source');
const funnel = require('broccoli-funnel');
const path = require('path');
const buildWorkers = require('./broccoli-plugins/build-workers');

const workerRoot = path.join(__dirname, 'addon', 'workers');

module.exports = {
  name: require('./package').name,

  treeForPublic() {
    // We need to process and build our workers separately from ember as these workers are
    // not part of the app and are not getting properly bundled otherwise
    let workerTree = new WatchedDir(workerRoot);
    workerTree = new buildWorkers([workerTree]);
    const env = this.parent?.app?.env ?? 'production';
    workerTree.isProduction = env === 'production';

    return new funnel(workerTree, { destDir: 'workers' });
  },
};
