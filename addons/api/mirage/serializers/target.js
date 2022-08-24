import ApplicationSerializer from './application';
import { underscore } from '@ember/string';

export default ApplicationSerializer.extend({
  modelName: 'target',

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
    const { hostSets } = this.schema;
    if (model.hostSetIds?.length) {
      json.host_sources = model.hostSetIds.map((host_set_id) => {
        const hostSet = hostSets.find(host_set_id);
        const host_catalog_id = hostSet?.hostCatalog?.id;
        return { id: host_set_id, host_catalog_id };
      });
    }
    let brokeredCredSourceIds = [];
    let injectedCredSources = [];
    model.attributes.brokeredCredentialSourceIds.forEach((cred) => {
      brokeredCredSourceIds.push(cred.id);
      brokeredCredSourceIds.filter(Boolean);
    });

    model.attributes.injectedApplicationCredentialSourceIds.forEach((cred) => {
      injectedCredSources.push(cred.id);
      injectedCredSources.filter(Boolean);
    });

    if (model.attributes.brokeredCredentialSourceIds?.length) {
      json.brokered_credential_source_ids = [...brokeredCredSourceIds];
    }

    if (model.brokeredCredentialSourceIds?.length) {
      json.brokered_credential_source_ids = model.brokeredCredentialSourceIds;
    }

    if (model.attributes.injectedApplicationCredentialSourceIds?.length) {
      json.injection_application_source_ids = [...injectedCredSources];
    }

    if (model.injectedApplicationCredentialSourceIds?.length) {
      json.injectedApplicationCredentialSourceIds =
        model.injectedApplicationCredentialSourceIds;
    }

    return json;
  },
});
