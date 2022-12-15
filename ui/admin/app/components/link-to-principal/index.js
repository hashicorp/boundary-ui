import Component from '@glimmer/component';

const principalTypeRoutes = {
  user: 'scopes.scope.users.user',
  group: 'scopes.scope.groups.group',
  'managed-group':
    'scopes.scope.auth-methods.auth-method.managed-groups.managed-group',
};

export default class LinkToPrincipalComponent extends Component {
  /**
   * Display icons only for plugin compositeTypes.
   * @type {string}
   */
  get isManagedGroup() {
    return this.args.model.constructor.modelName === 'managed-group';
  }

  get link() {
    return principalTypeRoutes[this.args.model.constructor.modelName];
  }
}
