import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class ResourceTypeService extends Service {
  // =services

  @service intl;
  @service('resource') resourceService;

  // =attributes

  get resource() {
    return this.resourceService.for(this.resourceType);
  }

  get name() {
    return this.intl.t(
      `resources.${this.resource.type}.types.${this.type}.name`
    );
  }

  get description() {
    return this.intl.t(
      `resources.${this.resource.type}.types.${this.type}.description`
    );
  }
}
