import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import oidc from './oidc';
import ldap from './ldap';
import password from './password';

const modelTypeToComponent = {
  ldap,
  password,
  oidc,
};

export default class FormAuthMethodIndex extends Component {
  get authMethodFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for auth method: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
