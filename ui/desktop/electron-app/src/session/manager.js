const SessionManager = require('../models/session-manager.js');

/**
 * Singleton for SessionManager
 */
const sessionManager = new SessionManager();
module.exports = sessionManager;
