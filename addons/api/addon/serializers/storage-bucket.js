import ApplicationSerializer from './application';

export default class StorageBucketSerializer extends ApplicationSerializer {
  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);

    // Remove secret fields
    delete normalized.data.attributes.access_key_id;
    delete normalized.data.attributes.secret_access_key;
    return normalized;
  }
}
