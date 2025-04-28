/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { underscore } from '@ember/string';

export default ApplicationSerializer.extend({
  modelName: 'target',

  keyForRelationshipIds(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName),
    )}_ids`;
  },

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    const { hostSets, aliases } = this.schema;
    if (model.hostSetIds?.length) {
      json.host_sources = model.hostSetIds.map((host_set_id) => {
        const hostSet = hostSets.find(host_set_id);
        const host_catalog_id = hostSet?.hostCatalog?.id;
        return { id: host_set_id, host_catalog_id };
      });
    }

    // After we clear an associated alias, we try to mimic the BE logic
    // by manually filter out the alias id from the target model

    const associatedAliases = aliases
      .all()
      .models.reduce((arr, { destinationId, id }) => {
        // We iterate through the aliases list and
        // find the cleared alias by looking for camelCase destinationId since there is no other way to find the impacted alias
        if (destinationId !== null) arr.push(id);
        return arr;
      }, []);

    json.aliases = model.aliases?.filter((alias) =>
      associatedAliases.includes(alias.id),
    );

    return json;
  },
});
