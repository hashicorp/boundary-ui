import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class HeaderNavComponent extends Component {
  // =services

  @service session;
  @service scope;
  @service router;
}
