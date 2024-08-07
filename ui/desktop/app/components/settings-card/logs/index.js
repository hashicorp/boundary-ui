import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SettingsCardLogsComponent extends Component {
  // =services
  @service ipc;

  // =attributes

  get logLevels() {
    return [
      {
        label: 'error',
        value: 'error',
      },
      {
        label: 'warn',
        value: 'warn',
      },
      {
        label: 'info',
        value: 'info',
      },
      {
        label: 'debug',
        value: 'debug',
      },
    ];
  }

  // =methods
  @action
  async selectLogLevel({ target: { value } }) {
    await this.ipc.invoke('setLogLevel', value);
  }
}
