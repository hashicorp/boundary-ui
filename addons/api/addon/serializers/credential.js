import ApplicationSerializer from './application';

export default class CredentialSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    return serialized;
  }
}