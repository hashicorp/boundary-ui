/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';
import config from '../config/environment';

export default helper(function appName() {
  return config.appName;
});
