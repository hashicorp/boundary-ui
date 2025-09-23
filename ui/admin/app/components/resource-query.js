import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { parse } from 'liqe';

export default class ResourceQueryComponent extends Component {
  @service
  store;

  @tracked
  searchText = 'resource:target';

  @tracked
  results = [];

  @tracked
  selectedResult = null;

  @tracked
  meta = false;

  @tracked
  show = false;

  constructor() {
    super(...arguments);

    document.body.addEventListener("keydown", (e) => {
      if (e.metaKey) {
        this.meta = true;
        console.log('meta on');
      }

      console.log(this.meta, e.code);
      if (this.meta && e.code === 'Slash') {
        console.log('toggle!');
        this.show = !this.show;
      }
    });

    document.body.addEventListener('keyup', (e) => {
      this.meta = e.metaKey;
      console.log('key up', this.meta);
    });
  }

  async loadResults(resource, filters) {
    console.log({ resource });
    const q = {
      scope_id: 'global',
      recursive: true,
      query: { filters },
    };
    console.log({ q });
    const queryResults = await this.store.query(resource, q, { peekDb: true });

    const results = queryResults.map((r) => ({ model: r }));
    console.log('store results', { results });
    this.results = results;
  }

  @action
  onInput(e) {
    const input = e.target.value;
    const result = parse(input);
    console.log('parse results', { result });
    const results = gatherInputs(result);
    console.log('gather input results', { results });

    const resource = results.find((r) => r.field.name === 'resource');
    const resourceValue = resource.expression.value;

    const remaining = results.filter((r) => r !== resource);
    const filters = {};
    for (const result of remaining) {
      if (
        result.expression.value &&
        result.expression.type === 'LiteralExpression'
      ) {
        filters[result.field.name] = [{ equals: result.expression.value }] ;
      }

      if (result.expression.type === "EmptyExpression") {
        console.log("empty expression case here");
      }
    }

    this.loadResults(resourceValue, filters);
  }

  @action
  selectResult(result) {
    this.selectedResult = result;
  }

  @action
  clearResult() {
    this.selectedResult = null;
  }
}

function gatherInputs(result) {
  const results = [];
  const feed = [result];

  do {
    const current = feed.shift();

    if (current.left || current.right) {
      current.left && feed.push(current.left);
      current.right && feed.push(current.right);
    } else {
      results.push(current);
    }
  } while (feed.length);

  return results;
}
