'use strict';

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,
  included(app) {
    this._super.included(app);

    this.includeStyles(app);
    this.includeIcons(app);
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
   * Finds the structure-icons folder and includes it into the
   * ember-inline-svg addon.
   */
  includeIcons(app) {
    const iconPackagePath = require.resolve('@hashicorp/structure-icons');
    const iconsPath = path.resolve(iconPackagePath, '..');

    app.options.svg = app.options.svg || {};
    app.options.svg.paths = app.options.svg.paths || [];

    app.options.svg.paths.push(iconsPath);

    this.addons.forEach((addon) => {
      if (addon.name === 'ember-inline-svg') addon.included(app);
    });
  },
};
