/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { getOwner, setOwner } from '@ember/owner';

export default class SqliteHandler {
  constructor(context) {
    setOwner(this, getOwner(context));
  }

  async request(context, next) {
    switch (context.request.op) {
      default:
        return next(context.request);
    }
  }
}
