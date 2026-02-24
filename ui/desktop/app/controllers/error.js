/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ErrorController extends Controller {
  @controller('application') appUtilities;
}
