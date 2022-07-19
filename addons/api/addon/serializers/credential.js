import ApplicationSerializer from './application';

export default class CredentialSerializer extends ApplicationSerializer {
  serialize() {
    let serialized = super.serialize(...arguments);
    console.log(serialized);
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    normalized['attributes']['password'] = '';
    return normalized;
  }
}