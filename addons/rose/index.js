'use strict';

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,
  included(app) {
    this._super.included.apply(this, arguments);

    app.import('node_modules/codemirror/lib/codemirror.css');
    app.import('node_modules/codemirror/theme/monokai.css');

    this.includeFlightIcons(app);
    this.includePublic(app);
    this.setupSVGO(app);
  },

  /**
<<<<<<< HEAD
   * Due to a limitation in how ember treats nested addons (see https://github.com/ember-cli/ember-cli/issues/4475)
   * this is neeeded to reach down in to @hashicorp/ember-flight-icons' contentFor hook to run the logic
   * that injects the sprite into the DOM
   */
  contentFor(type, config) {
    return this.findOwnAddonByName('@hashicorp/ember-flight-icons').contentFor(
      type,
      config
    );
  },

  /**
   * Finds the structure-icons folder and includes it into the
   * ember-inline-svg addon.
   */
  includeFlightIcons(app) {
    const iconPackagePath = path.resolve(
      '../../node_modules/@hashicorp/flight-icons'
    );
    const iconsPath = path.resolve(iconPackagePath, '..');

    app.options.svg = app.options.svg || {};
    app.options.svg.paths = app.options.svg.paths || [];

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
   */
  setupSVGO(app) {
    app.options.svg = app.options.svg || {};
    app.options.svg.optimize = app.options.svg.optimize || {};
    app.options.svg.optimize.plugins = app.options.svg.optimize.plugins || [];
    app.options.svg.optimize.plugins.push({ removeViewBox: false });
  },
};
