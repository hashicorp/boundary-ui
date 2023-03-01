/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import config from '../config/environment';

export default helper(function appName() {
  return config.appName;
});
