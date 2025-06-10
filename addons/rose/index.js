/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const path = require('path');

module.exports = {
  name: require('./package').name,
  included(app) {
    this._super.included.apply(this, arguments);

    this.import('node_modules/codemirror/lib/codemirror.css');
    this.import('node_modules/codemirror/theme/monokai.css');
    this.import('node_modules/codemirror/addon/lint/lint.css');
    this.import('node_modules/jsonlint/lib/jsonlint.js');

    this.includeHDSStyles(app);
    this.includeFlightIcons(app);
    this.includePublic(app);
    this.setupSVGO(app);
  },

  /**
   * Due to a limitation in how ember treats nested addons (see https://github.com/ember-cli/ember-cli/issues/4475)
   * this is needed to reach down into @hashicorp/design-system-components' contentFor hook to run the logic
   * that injects the sprite into the DOM
   */
  contentFor(type, config) {
    return this.findOwnAddonByName(
      '@hashicorp/design-system-components',
    ).contentFor(type, config);
  },

  /**
   * Finds the HDS styles folder and includes it into the running
   * application's `sassOptions.includePaths`.
   */
  includeHDSStyles(app) {
    const tokensPath = path.resolve(
      __dirname,
      'node_modules/@hashicorp/design-system-tokens/dist/products/css',
    );
    const hdsPath = path.resolve(
      __dirname,
      'node_modules/@hashicorp/design-system-components/dist/styles',
    );

    // Setup default sassOptions on the running application
    app.options.sassOptions = app.options.sassOptions || {};
    app.options.sassOptions.includePaths =
      app.options.sassOptions.includePaths || [];

    // Include the addon styles
    app.options.sassOptions.includePaths.push(tokensPath, hdsPath);
  },

  /**
   * Finds the structure-icons folder and includes it into the
   * ember-inline-svg addon.
   */
  includeFlightIcons(app) {
    const iconPackagePath = path.resolve(
      __dirname,
      'node_modules/@hashicorp/flight-icons',
    );
    const iconsPath = path.resolve(iconPackagePath, '..');

    app.options.svg ||= {};
    app.options.svg.paths ||= [];

    app.options.svg.paths.push(iconsPath);

    this.addons.forEach((addon) => {
      if (addon.name === 'ember-inline-svg') addon.included(app);
    });
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
   * Note: Currently, there is a svgo pre-release that disables removeViewBox
   * by default. So, this extra setup can be discarded once ember-inline-svg
   * is updated to svgo v4.
   */
  setupSVGO(app) {
    app.options.svg = app.options.svg || {};
    app.options.svg.optimize = app.options.svg.optimize || {};
    app.options.svg.optimize.plugins = app.options.svg.optimize.plugins || [];
    app.options.svg.optimize.plugins.push({ removeViewBox: false });
  },
};
