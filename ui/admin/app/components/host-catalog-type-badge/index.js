import Component from '@glimmer/component';
const types = ['aws', 'azure'];

export default class HostCatalogTypeComponent extends Component {
  /**
   * Display icons only for plugin compositeTypes.
   * @type {string}
   */
  get icon() {
    return (
      types.includes(this.args.model.compositeType) &&
      `${this.args.model.compositeType}-color`
    );
  }
}
