/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Model } from 'miragejs';

export default Model.extend({
  assignDefaults(defaultAttrs, attrs) {
    Object.entries(defaultAttrs).map(([key, value]) => {
      if (!attrs[key]) {
        attrs[key] = value;
      }
    });
  },
  defaultAttrs: () => ({
    version: 1,
    authorized_actions: ['no-op', 'read', 'update', 'delete'],
    created_time: new Date(),
  }),
  save() {
    this.assignDefaults(this.defaultAttrs(), this.attrs);
    return Model.prototype.save.apply(this, arguments);
  },
});
