import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { parse } from 'liqe';

class Frame {
  @tracked
  name = '';

  @tracked
  searchText = '';

  @tracked
  options = [];

  @tracked
  selectedOptionIndex = null;

  // TODO: enum: loading, etc...
  @tracked
  state = '';

  #load;

  @tracked
  context;

  #select;

  constructor(name, { options, load, select, context }) {
    this.name = name;
    this.options = options;
    this.#load = load;
    this.#select = select;
    this.context = context ?? {};
  }

  select() {
    this.#select(this.options[this.selectedOptionIndex], this.context);
  }

  async load() {
    this.isLoading = true;
    const options = await this.#load(this.context);
    if (!Array.isArray(options)) {
      throw new Error(`load must return an array`);
    }
    this.selectedOptionIndex = 0;
    this.options = options;
    this.isLoading = false;
  }
}

class Option {
  @tracked
  name;

  @tracked
  category;

  @tracked
  context = {};

  constructor(name, { category, context }) {
    this.name = name;
    this.action = action;
    this.category = category;
    this.context = context ?? {};
  }
}

export default class ResourceQueryComponent extends Component {
  @service
  store;

  @service
  router;

  @service
  flashMessages;

  @tracked
  results = [];

  @tracked
  selectedResult = null;

  @tracked
  meta = false;

  @tracked
  show = true;

  @tracked
  highlightedIndex = 0;

  @tracked
  action = null;

  @tracked
  frames = [];

  constructor() {
    super(...arguments);
    this.setupKeyboardHandlers();

    const self = this;

    const resourceAttributeFrame = new Frame('Resource Attribute', {
      async select() {},
      async load(context) {
        // const { attr, model } = context;
        return [new Option('Copy Value', {})];
      },
    });

    const resourceAttributesFrame = new Frame('Resource Attributes', {
      async select(option, context) {
        resourceAttributeFrame.context = {
          model: context.model,
          attr: option.context.attr,
        };

        self.frames.push(resourceAttributeFrame);
        self.frames = self.frames;
      },

      async load(context) {
        const { model } = context;
        await model.reload();

        const attrs = [];
        model.eachAttribute((attr) => {
          attrs.push(attr);
        });

        return attrs.map((attr) => {
          const attrValue = model[attr];
          console.log({ attrValue });
          const attrValueString = Array.isArray(attrValue)
            ? attrValue
                .map((item) =>
                  typeof item === 'object'
                    ? 'id' in item
                      ? item.id
                      : JSON.stringify(item)
                    : item,
                )
                .join(', ')
            : `${attrValue}`;
          return new Option(`${attr}: ${attrValueString}`, {
            category: 'result',
            context: { attr },
          });
        });
      },
    });

    const resourceOptionsFrame = new Frame('Resource Options', {
      async select(option, context) {
        const { model } = context;
        if (option.name === 'Resource Attributes') {
          resourceAttributesFrame.context.model = model;
          resourceAttributesFrame.load();
          self.frames.push(resourceAttributesFrame);
          self.frames = self.frames;
        }

        if (option.name === 'Copy ID') {
          navigator.clipboard.writeText(model.id);
          self.flashMessages.success('Copied ID to clipboard');
        }

        if (option.name === 'Goto') {
          self.router.transitionTo(
            `/scopes/${model.scope.id}/targets/${model.id}`,
          );
        }
      },

      async load() {
        return [
          new Option('Copy ID', { category: 'result' }),
          new Option('Resource Attributes', {
            category: 'result',
          }),
          new Option('Goto', {
            category: 'result',
          }),
        ];
      },
    });

    const initialFrame = new Frame('Global Query', {
      async select(option) {
        console.log('option selected!', option);
        resourceOptionsFrame.context.model = option.context.model;
        await resourceOptionsFrame.load();
        self.frames.push(resourceOptionsFrame);
        console.log('frames after push', self.frames);
        self.frames = self.frames;
      },

      async load({ store, resource, query }) {
        if (!store) throw new Error(`Set context.store`);
        if (!resource || !query) return;

        const q = {
          scope_id: 'global',
          recursive: true,
          query,
        };

        const queryResults = await store.query(resource, q, {
          // this should be peek in practice but for demo purposes with mirage
          // this can be left off
          // peekDb: true,
        });

        const results = queryResults.map((r) => ({ model: r }));
        console.log('store results', { results });

        return results.map(({ model }) => {
          let optionName = `${model.id}`;
          if (model.name) {
            optionName += ` (${model.name})`;
          }
          if (model.scope) {
            optionName += ` (${model.scope.id})`;
          }
          return new Option(optionName, {
            category: 'result',
            context: { model },
          });
        });
      },
    });

    this.frames = [initialFrame];
  }

  setupKeyboardHandlers() {
    document.body.addEventListener('keydown', (e) => {
      console.log(e.code);

      if (e.metaKey) {
        this.meta = true;
        console.log('meta on');
      }

      if (this.meta && e.code === 'Slash') {
        this.show = !this.show;
      }

      if (e.code === 'ArrowUp') {
        this.highlightedIndex--;
        const newIndex = Math.max(0, this.currentFrame.selectedOptionIndex - 1);
        this.selectIndex(newIndex);
        return false;
      }

      if (e.code === 'ArrowDown') {
        this.highlightedIndex++;
        const newIndex = Math.min(
          this.currentFrame.options.length - 1,
          this.currentFrame.selectedOptionIndex + 1,
        );
        this.selectIndex(newIndex);
        return false;
      }

      if (e.code === 'Enter') {
        this.currentFrame.select();
      }

      if (e.code === 'Escape') {
        if (this.frames.length === 1) {
          this.show = false;
        } else {
          this.popFrame();
        }
      }
    });

    document.body.addEventListener('keyup', (e) => {
      this.meta = e.metaKey;
      console.log('key up', this.meta);
    });
  }

  get currentFrame() {
    return this.frames.at(-1);
  }

  get previousFrame() {
    return this.frames.at(-2);
  }

  @action
  selectIndex(index) {
    this.currentFrame.selectedOptionIndex = index;
  }

  @action
  clickOption(index) {
    this.selectIndex(index);
    this.currentFrame.select();
  }

  @action
  async onInput(e) {
    const input = e.target.value;
    this.currentFrame.searchText = input;

    const result = parse(input);
    console.log('parse results', { result });
    const results = gatherInputs(result);
    console.log('gather input results', { results });

    const resource = results.find((r) => r.field.name === 'resource');
    const resourceValue = resource.expression.value;

    const remaining = results.filter((r) => r !== resource);
    let search = '';
    const filters = {};

    for (const result of remaining) {
      console.log({ result });
      if (result.field.type === 'ImplicitField') {
        search = search += result.expression.value;
        continue;
      }

      if (
        result.expression.value &&
        result.expression.type === 'LiteralExpression'
      ) {
        if (result.operator.type === 'ComparisonOperator') {
          filters[result.field.name] ??= [];

          switch (result.operator.operator) {
            case ':': {
              filters[result.field.name].push({
                equals: result.expression.value,
              });
              break;
            }

            case ':>': {
              filters[result.field.name].push({ gt: result.expression.value });
              break;
            }

            case ':>=': {
              filters[result.field.name].push({ gte: result.expression.value });
              break;
            }

            case ':<': {
              filters[result.field.name].push({ lt: result.expression.value });
              break;
            }

            case ':<=': {
              filters[result.field.name].push({ lte: result.expression.value });
              break;
            }
          }
        }
        continue;
      }

      if (result.expression.type === 'EmptyExpression') {
        console.log('empty expression case here');
      }
    }

    const attrs = [];
    try {
      const resource = this.store.createRecord(resourceValue);
      resource.eachAttribute((attr) => {
        attrs.push(attr);
      });
      debugger;
    } catch {}

    this.currentFrame.context = {
      store: this.store,
      resource: resourceValue,
      query: { filters, search },
      attrs,
    };

    this.currentFrame.load();
  }

  @action
  popFrame() {
    this.frames.pop();
    this.frames = this.frames;
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
