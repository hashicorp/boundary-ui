/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import { underscore } from '@ember/string';

export default ApplicationSerializer.extend({
  modelName: 'user',

  keyForRelationshipIds(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName)
    )}_ids`;
  },

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    if (model.accountIds.length) json.account_ids = model.accountIds;
    return json;
  },
});
