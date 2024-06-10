/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';

/**
 * NOTE:  we don't yet use this model for display in the UI and thus no
 * attributes are included at this time.  This model is used only for
 * validating that an auth token exists.
 */
export default class GeneratedAuthTokenModel extends BaseModel {}
