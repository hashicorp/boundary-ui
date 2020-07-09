import ApplicationAdapter from './application';
import ScopeAdapterMixin from '../mixins/scope-adapter';

export default class HostCatalogAdapter extends ApplicationAdapter.extend(
  ScopeAdapterMixin
) {}
