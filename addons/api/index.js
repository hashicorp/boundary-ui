/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';
const funnel = require('broccoli-funnel');
const path = require('path');

module.exports = {
  name: require('./package').name,
  treeForPublic() {
    // Merge the trees if a public folder is added to this addon in the future.
    const addonFolder = path.join(__dirname, 'addon', 'workers');
    return new funnel(addonFolder, { destDir: 'workers' });
  },
};
