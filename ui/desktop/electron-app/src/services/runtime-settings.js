/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const RuntimeSettings = require('../models/runtime-settings.js');

// Provides a singleton class instance to enable a consistent view of
// runtime settings across the application.

const runtimeSettings = new RuntimeSettings();

module.exports = runtimeSettings;
