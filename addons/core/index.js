/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

var path = require('path');

module.exports = {
  name: require('./package').name,

  options: {
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
  },

  included(app) {
    this._super.included.apply(this, arguments);
    this.includePublic(app);
    this.setupSVGO(app);
  },

  /**
   * Finds the public folder and includes it into the ember-inline-svg addon.
   */
  includePublic(app) {
    const publicPath = path.resolve('public');
    const dummyPublicPath = path.resolve('tests/dummy/public');

    app.options.svg = app.options.svg || {};
    app.options.svg.paths = app.options.svg.paths || [];

    app.options.svg.paths.push(publicPath);
    if (this.isDevelopingAddon()) app.options.svg.paths.push(dummyPublicPath);

    this.addons.forEach((addon) => {
      if (addon.name === 'ember-inline-svg') addon.included(app);
    });
  },

  /**
   * Adjust SVG optimizer defaults (used by ember-inline-svg).
   */
  setupSVGO(app) {
    app.options.svg = app.options.svg || {};
    app.options.svg.optimize = app.options.svg.optimize || {};
    app.options.svg.optimize.plugins = app.options.svg.optimize.plugins || [];
    app.options.svg.optimize.plugins.push({ removeViewBox: false });
  },
};
