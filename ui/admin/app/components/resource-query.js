
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ResourceQueryComponent extends Component {
  @service
  store;

  @tracked
  results = [];

  async loadResults(resource, input) {
    console.log({ resource });
    const queryResults = await this.store.query(resource, {
      scope_id: 'p_56ZDH1N78E',
      recursive: true,
    }, { peekDb: true });
    const results = queryResults.map(r => ({ model: r }));
    this.results = results;
  }

  @action
  onInput(e) {
    const input = e.target.value;
    const [, resourceType] = input.split(':').map(i => i.split());
    this.loadResults(resourceType?.[0], {});
  }
}
