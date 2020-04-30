import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'Style Guide',
};

export const Colors = () => ({
  template: hbs`
    <style type="text/css">
      body {
        padding: 2rem;
        font-family: sans-serif;
        line-height: 1.5rem;
        color: var(--stark);
        background-color: var(--subtle);
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 1.5rem;
        margin: 1rem 0;
      }
      h3 {
        font-size: 0.85rem;
        margin: 0.5rem 0;
      }
      p {
        max-width: 725px;
        margin-bottom: 2rem;
      }
      code {
        display: block;
        font-size: 0.55rem;
        font-family: "Andale Mono", monospace;
        max-width: 100%;
        overflow-x: scroll;
        color: var(--ui-gray);
      }
      .side-by-side {
        display: flex;
      }
      section {
        padding-right: 2rem;
      }
      .swatches {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
      }
      .swatch {
        width: 6rem;
        //border: 1px solid var(--ui-gray-subtler-4);
        border-radius: 4px;
        margin: 0 0.5rem 0.5rem 0;
        box-shadow: 0px 3px 6px rgba(var(--stark-components), var(--opacity-3));
      }
      .swatch-chip {
        height: 5rem;
        border: 0.5rem solid var(--subtle);
        border-radius: 4px;
      }
      .swatch-detail {
        border-top: 1px solid var(--ui-gray-subtler-4);
        padding: 0.5rem;
      }
    </style>

    <section>
      <h1>Colors</h1>
      <p>
        Find the color you need and copy the CSS custom property variable into
        your stylesheet.
        Use only these variables when specifying colors.  This ensures
        consistency and dark mode compatibility.
      </p>
    </section>

    <div class="side-by-side">
      <section>
        <h2>Relative Poles</h2>
        <p>
          These colors depend on light or dark mode.  Use these most often
          when specifying primary foreground and backround colors.
        </p>
        <ul class="swatches">
          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--subtle);"></div>
            <div class="swatch-detail">
              <code>var(--subtle)</code>
            </div>
          </li>

          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--stark);"></div>
            <div class="swatch-detail">
              <code>var(--stark)</code>
            </div>
          </li>
        </ul>
      </section>
      <section>
        <h2>Absolute Colors</h2>
        <p>
          Colors sometimes <strong>don't change in dark mode</strong>.  Use these
          values sparingly.
        </p>
        <ul class="swatches">
          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--white);"></div>
            <div class="swatch-detail">
              <code>var(--white)</code>
            </div>
          </li>

          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--black);"></div>
            <div class="swatch-detail">
              <code>var(--black)</code>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section>
      <h2>Theme Colors</h2>
      <h3>Info</h3>
      <ul class="swatches">
        {{#each colors.info as |color|}}
          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
            <div class="swatch-detail">
              <code>var(--{{color}})</code>
            </div>
          </li>
        {{/each}}
      </ul>
    </section>
    <div class="side-by-side">
      <section>
        <h3>Alert</h3>
        <ul class="swatches">
          {{#each colors.alert as |color|}}
            <li class="swatch">
              <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
              <div class="swatch-detail">
                <code>var(--{{color}})</code>
              </div>
            </li>
          {{/each}}
        </ul>
      </section>
      <section>
        <h3>Warning</h3>
        <ul class="swatches">
          {{#each colors.warning as |color|}}
            <li class="swatch">
              <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
              <div class="swatch-detail">
                <code>var(--{{color}})</code>
              </div>
            </li>
          {{/each}}
        </ul>
      </section>
    </div>
    <div class="side-by-side">
      <section>
        <h3>Failure</h3>
        <ul class="swatches">
          {{#each colors.failure as |color|}}
            <li class="swatch">
              <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
              <div class="swatch-detail">
                <code>var(--{{color}})</code>
              </div>
            </li>
          {{/each}}
        </ul>
      </section>
      <section>
        <h3>Success</h3>
        <ul class="swatches">
          {{#each colors.success as |color|}}
            <li class="swatch">
              <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
              <div class="swatch-detail">
                <code>var(--{{color}})</code>
              </div>
            </li>
          {{/each}}
        </ul>
      </section>
    </div>
    <section>
      <h3>UI Border</h3>
      <ul class="swatches">
        {{#each colors.ui-border as |color|}}
          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
            <div class="swatch-detail">
              <code>var(--{{color}})</code>
            </div>
          </li>
        {{/each}}
      </ul>
      <h3>UI Gray</h3>
      <ul class="swatches">
        {{#each colors.ui-gray as |color|}}
          <li class="swatch">
            <div class="swatch-chip" style="background-color: var(--{{color}});"></div>
            <div class="swatch-detail">
              <code>var(--{{color}})</code>
            </div>
          </li>
        {{/each}}
      </ul>
    </section>
  `,
  context: {
    colors: {
      relative: ['subtle', 'stark'],
      absolute: ['white', 'black'],
      info: [
        'info-subtler-3',
        'info-subtler-2',
        'info-subtler-1',
        'info',
        'info-starker-1',
        'info-starker-2',
      ],
      alert: ['alert-subtler-2', 'alert-subtler-1', 'alert', 'alert-starker-1'],
      warning: [
        'warning-subtler-2',
        'warning-subtler-1',
        'warning',
        'warning-starker-1',
      ],
      failure: [
        'failure-subtler-2',
        'failure-subtler-1',
        'failure',
        'failure-starker-1',
      ],
      success: [
        'success-subtler-2',
        'success-subtler-1',
        'success',
        'success-starker-1',
      ],
      'ui-border': ['ui-border-subtler-1', 'ui-border'],
      'ui-gray': [
        'ui-gray-subtler-6',
        'ui-gray-subtler-5',
        'ui-gray-subtler-4',
        'ui-gray-subtler-3',
        'ui-gray-subtler-2',
        'ui-gray-subtler-1',
        'ui-gray',
        'ui-gray-starker-1',
        'ui-gray-starker-2',
        'ui-gray-starker-3',
        'ui-gray-starker-4',
      ],
    },
  },
});
