import ApplicationAdapter from './application';
import { serializeIntoHash } from '@ember-data/adapter/-private';

export default class ScopeAdapter extends ApplicationAdapter {

  /**
   * Identical to default method except that we pass a query parameter
   * indicating the parent scope.
   * @override
   * @param {Store} store
   * @param {Model} type
   * @param {Snapshot} snapshot
   * @return {Promise} promise
   */
  createRecord(store, type, snapshot) {
    const parentScopeID = snapshot.attr('scope').attr('scope_id');
    let url =
      this.buildURL(type.modelName, null, snapshot, 'createRecord');
    // TODO this should be generalized into `buildURL`, but currently Ember Data
    // doesn't provide a way to manage query parameters.  They are passed on
    // to the underlying ajax/fetch service.
    url = `${url}?scope_id=${parentScopeID}`;
    const data = serializeIntoHash(store, type, snapshot);
    return this.ajax(url, 'POST', { data });
  }

}
