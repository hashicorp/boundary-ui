import Component from '@glimmer/component';

export default class HostCatalogTypeComponent extends Component {
  get isStaticOrUnknownHostCatalogType() {
    return this.args.model.isStatic || this.args.model.isUnknown;
  }
}
