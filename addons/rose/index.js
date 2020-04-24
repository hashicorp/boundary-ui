'use strict';

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  /**
   * Finds this addon's styles folder and includes it into the running
   * application's `sassOptions.includePaths`, such that the application needs
   * no further configuration to import the styles.
   */
  included(app) {
    this._super.included(app);

    // Resolve a path to this addon's style folder `addon/styles/addon-name`,
    // where addon-name is resolved from package.json
    const addonPath = require.resolve(this.name);
    const stylePath = path.resolve(addonPath, `../addon/styles/${this.name}`);
    const styleTree = mergeTrees([
      new Funnel(stylePath, {
        destDir: this.name,
        include: ['**/*']
      })
    ]);

    // Setup default sassOptions on the running application
    app.options.sassOptions = app.options.sassOptions || {};
    app.options.sassOptions.includePaths =
      app.options.sassOptions.includePaths || [];

    // Include the addon styles
    app.options.sassOptions.includePaths.push(styleTree);
  }

};
