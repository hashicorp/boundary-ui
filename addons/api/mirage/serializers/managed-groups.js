import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'managed-groups',

  _hashForModel() {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    return json;
  },
});
