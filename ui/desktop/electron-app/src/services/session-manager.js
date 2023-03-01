/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const SessionManager = require('../models/session-manager.js');

/**
 * Singleton for SessionManager
 */
const sessionManager = new SessionManager();
module.exports = sessionManager;
