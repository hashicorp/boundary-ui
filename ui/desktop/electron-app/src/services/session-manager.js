/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const SessionManager = require('../models/session-manager.js');

/**
 * Singleton for SessionManager
 */
const sessionManager = new SessionManager();
module.exports = sessionManager;
