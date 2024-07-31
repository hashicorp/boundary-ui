/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { mergeTests } = require('@playwright/test');
const { electronTest } = require('../fixtures/electronTest');
const { authenticateTest } = require('./authenticateTest');

// Redundant since authenticateTest already extends electronTest but this is for demonstration purposes
// The last item in the list will override any previous ones in a fixture name collision
exports.test = mergeTests(authenticateTest, electronTest);
