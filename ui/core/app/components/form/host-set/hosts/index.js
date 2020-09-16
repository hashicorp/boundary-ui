import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class FormHostSetHostsComponent extends Component {
  // =attributes

  /**
   * An array of wrapped `HostModel` instances where the wrapper includes
   * a `selected` boolean field indicating if the host is represented
   * in `model.host_ids`.
   * @type {[{host: HostModel, selected: boolean}]}
   */
  @computed('args.{hosts.[],model.host_ids.[]}')
  get options() {
    const { hosts, model: hostSet } = this.args;
    return hosts.map((host) => ({
      host,
      selected: Boolean(hostSet.host_ids.findBy('value', host.id)),
    }));
  }
}
