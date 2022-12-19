import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';

export default class ResourceService extends Service {
  // =services

  @service intl;

  // =methods

  for(resourceOrModel) {
    const resourceType =
      resourceOrModel?.constructor?.modelName || resourceOrModel;
    return getOwner(this).lookup(`service:resource/${resourceType}`);
  }

  typeFor(resourceOrModel, typeName) {
    const resourceType =
      resourceOrModel?.constructor?.modelName || resourceOrModel;
    return getOwner(this).lookup(
      `service:resource/${resourceType}/${typeName}`
    );
  }

  // =attributes

  get name() {
    return this.intl.t(`resources.${this.type}.title`);
  }

  get namePlural() {
    return this.intl.t(`resources.${this.type}.title_plural`);
  }

  get description() {
    return this.intl.t(`resources.${this.type}.description`);
  }

  get types() {
    return this._types.map((type) => this.typeFor(this.type, type));
  }
}
