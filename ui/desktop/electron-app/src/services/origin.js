const RuntimeSesttings = require('../models/runtime-settings.js');

// Provides a singleton class instance to enable a consistent view of
// runtime settings across the application.

const runtimeSettings = new RuntimeSettings();

module.exports = runtimeSettings;
