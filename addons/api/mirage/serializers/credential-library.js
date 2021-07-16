import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'credential-library',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    json.credential_store_id = model.credentialStoreId;
    return json;
  },
});
