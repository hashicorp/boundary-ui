import ApplicationSerializer from './application';

const fieldsByType = {
  aws: [
    'disable_credential_rotation',
    'region',
    'access_key_id',
    'secret_access_key',
  ],
  azure: [
    'disable_credential_rotation',
    'tenant_id',
    'client_id',
    'subscription_id',
    'secret_id',
    'secret_value',
  ],
};

export default class HostCatalogSerializer extends ApplicationSerializer {
  // =methods
  serialize(snapshot) {
    const serialized = super.serialize(...arguments);
    switch (snapshot.record.compositeType) {
      case 'static':
        return this.serializeStatic(...arguments);
      default:
        return serialized;
    }
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { isPlugin, compositeType } = snapshot.record;
    const { options } = attribute;
    // Nested conditionals for readability
    // This deletes any fields that don't belong to the record type
    if (isPlugin && options.isNestedAttribute && json.attributes) {
      // The key must be included in the fieldsByType list above
      if (!fieldsByType[compositeType].includes(key))
        delete json.attributes[key];
    }
    // This deletes any fields that don't belong to the record type
    if (isPlugin && options.isNestedSecret && json.secrets) {
      if (!fieldsByType[compositeType].includes(key)) delete json.secrets[key];
    }

    // new one for isNestedSecret
    return value;
  }

  serializeStatic() {
    const serialized = super.serialize(...arguments);
    // Delete unnecessary fields for static host-catalog
    delete serialized.attributes;
    delete serialized.secrets;
    return serialized;
  }
}
