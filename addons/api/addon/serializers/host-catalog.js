import ApplicationSerializer from './application';

export default class HostCatalogSerializer extends ApplicationSerializer {
  // =methods
  serialize(snapshot) {
    const serialized = super.serialize(...arguments);
    switch (snapshot.record.type) {
      case 'static':
        return this.serializeStatic(...arguments);
      case 'plugin':
        return this.serializeDynamic(...arguments);
      default:
        return serialized;
    }
  }

  serializeStatic() {
    const serialized = super.serialize(...arguments);
    // Delete unnecessary fields for static host-catalog
    delete serialized.attributes;
    return serialized;
  }

  serializeDynamic(snapshot) {
    const { isAWS, isAzure } = snapshot.record;
    const serialized = super.serialize(...arguments);

    // Is a Aws plugin, delete all the Azure attributes
    if (isAWS) {
      delete serialized.attributes.region;
    }

    // Is an Azure plugin, delete all the Aws attributes
    if (isAzure) {
      delete serialized.attributes.tenant_id;
      delete serialized.attributes.client_id;
      delete serialized.attributes.subscription_id;
    }
    return serialized;
  }
}
