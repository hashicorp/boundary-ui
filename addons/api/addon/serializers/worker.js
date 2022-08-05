import ApplicationSerializer from './application';

export default class WorkerSerializer extends ApplicationSerializer {
   // =methods

  /**
   * If `adapterOptions.workerGenratedAuthToken` is set,
   * then the payload is serialized via `serializedWithGeneratedToken`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
   serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const workerGeneratedAuthToken = snapshot?.adapterOptions?.workerGeneratedAuthToken;
    if (workerGeneratedAuthToken)
      serialized = this.serializeWithGeneratedToken(snapshot, workerGeneratedAuthToken);
    return serialized;
  }

  /**
   * Returns a payload with `worker_generated_auth_token` serialized.
   * @param {Snapshot} snapshot
   * @param {[string]} account_ids
   * @return {object}
   */
  serializeWithGeneratedToken(snapshot, workerGeneratedAuthToken) {
    return {
      version: snapshot.attr('version'),
      worker_generated_auth_token: workerGeneratedAuthToken
    };
  }
}
