import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'auth-method',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    // If the scope marks this auth method as primary, designate it
    // as such with a read-only boolean field (this is how the API behaves).
    const isPrimary =
      model.scope && model.scope.primaryAuthMethodId === model.id;
    json.is_primary = isPrimary;
    return json;
  },
});
