import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'credential',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    json.credential_store_id = model.credentialStoreId;

    // in a real API, the password, private_key, and passphrase
    // field is not returned so we delete it from the response
    delete json.attributes?.password;
    delete json.attributes?.private_key;
    delete json.attributes?.passphrase;

    return json;
  },
});
