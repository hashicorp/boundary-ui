/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const RuntimeSettings = require('../models/runtime-settings.js');

// Provides a singleton class instance to enable a consistent view of
// runtime settings across the application.

const runtimeSettings = new RuntimeSettings();

module.exports = runtimeSettings;
