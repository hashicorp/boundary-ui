'use strict';

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,
  included(app) {
    this._super.included.apply(this, arguments);

    this.includeStyles(app);
    this.includeHDSStyles(app);
    //this.includeFlightIcons(app);
    this.includePublic(app);
    this.setupSVGO(app);
    //this.includeEmberFlightIcons(app);
  },

  /**
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
   * Finds this addon's styles folder and includes it into the running
   * application's `sassOptions.includePaths`, such that the application needs
   * no further configuration to import the styles.
   */
  includeStyles(app) {
    // Resolve a path to this addon's style folder `addon/styles/addon-name`,
    // where addon-name is resolved from package.json
    const addonPath = require.resolve(this.name);
    const stylePath = path.resolve(addonPath, `../addon/styles/${this.name}`);
    const styleTree = mergeTrees([
      new Funnel(stylePath, {
        destDir: this.name,
        include: ['**/*'],
      }),
    ]);

    // Setup default sassOptions on the running application
    app.options.sassOptions = app.options.sassOptions || {};
    app.options.sassOptions.includePaths =
      app.options.sassOptions.includePaths || [];

    // Include the addon styles
    app.options.sassOptions.includePaths.push(styleTree);
  },

  /**
   * Finds the HDS styles folder and includes it into the running
   * application's `sassOptions.includePaths`.
   */
  includeHDSStyles(app) {
    const stylePath =
      '../../node_modules/@hashicorp/design-system-tokens/dist/products/css';

    // Setup default sassOptions on the running application
    app.options.sassOptions = app.options.sassOptions || {};
    app.options.sassOptions.precision = 4;
    app.options.sassOptions.includePaths =
      app.options.sassOptions.includePaths || [];

    // Include the addon styles
    app.options.sassOptions.includePaths.push(stylePath);
  },

  /**
   * Finds the structure-icons folder and includes it into the
   * ember-inline-svg addon.
   */
  // includeFlightIcons(app) {
  //   const iconPackagePath = path.resolve(
  //     '../../node_modules/@hashicorp/flight-icons'
  //   );
  //   console.log(iconPackagePath, 'icon package path')
  //   const iconsPath = path.resolve(iconPackagePath, '..');
  //     console.log(app.options.svg, 'SVGG', iconsPath)
  //   app.options.svg = app.options.svg || {};
  //   app.options.svg.paths = app.options.svg.paths || [];

  //   app.options.svg.paths.push(iconsPath);
  //   console.log('APPPPPP',app.options.svg.paths, 'pathhhh' )
  //   this.addons.forEach((addon) => {
  //     console.log(addon.name, 'NAMEss')
  //     if (addon.name === 'ember-inline-svg') addon.included(app);
  //   });
  // },
  // includeEmberFlightIcons(app) {
  //     const iconPackagePath = path.resolve(
  //     '../../node_modules/@hashicorp/ember-flight-icons'
  //   );
  //   const iconsPath = path.resolve(iconPackagePath, '..');
  //   app.options.svg = app.options.svg || {};
  //   app.options.svg.paths = app.options.svg.paths || [];

  //   app.options.svg.paths.push(iconsPath);
  // },
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

  /**
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
};
