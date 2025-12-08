import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedObject } from 'tracked-built-ins';

const MAX_TTL_SECONDS = 94670856;

export default class FormAppTokenComponent extends Component {
  // =attributes

  @tracked showPermissionFlyout = false;

  get maxTTL() {
    return MAX_TTL_SECONDS;
  }

  // =actions

  @action
  updateTime(field, time) {
    this.args.model[field] = time;
  }

  @action
  openPermissionFlyout() {
    this.showPermissionFlyout = true;
    this.args.model.permissions.newPermission = new TrackedObject({});
  }

  @action
  closePermissionFlyout() {
    this.showPermissionFlyout = false;
    delete this.args.model.permissions.newPermission;
  }

  @action
  addPermission() {
    this.args.model.permissions.newPermission = { label: 'test' };
    this.args.model.permissions.addedPermissions.push(
      this.args.model.permissions.newPermission,
    );
    this.showPermissionFlyout = false;
  }

  @action
  createAppToken() {
    this.args.model.permissions = this.args.model.permissions.addedPermissions;
    this.args.submit();
  }
}
