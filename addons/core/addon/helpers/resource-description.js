import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class extends Helper {
  // =services

  @service resource;

  // =methods

  /**
   * Returns description for the specified resource.  Resource may be
   * referenced either as a string (e.g. `'target'`) or a model instance
   * from which the resource is inferred.
   */
  compute([resourceOrModel]) {
    const { description } = this.resource.for(resourceOrModel);
    return description;
  }
}
