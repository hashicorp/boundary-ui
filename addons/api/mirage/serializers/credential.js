import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'credential',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    json.credential_store_id = model.credentialStoreId;

    // in a real API, the following field is set-only and returned
    // as an associated HMAC field
    delete json.attributes?.password_hmac;

    return json;
  },
});
