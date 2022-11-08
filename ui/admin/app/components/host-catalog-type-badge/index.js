import Component from '@glimmer/component';
const types = ['aws', 'azure'];

export default class HostCatalogTypeComponent extends Component {
  //display icons only for plugin compositeTypes
  get icon() {
    return (
      types.includes(this.args.model.compositeType) &&
      `${this.args.model.compositeType}-color`
    );
  }
}
