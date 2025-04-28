/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'worker',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    if (json.api_tags) {
      const keys = Object.keys(model.api_tags);
      keys.forEach((key) => {
        if (json.api_tags[key]?.length === 0) {
          delete json.api_tags[key];
        }
      });
    }

    return json;
  },
});
