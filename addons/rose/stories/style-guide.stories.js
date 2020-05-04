import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'Style Guide',
};

export const Colors = () => ({
  template: hbs`
    <style type="text/css">
      body {
        padding: 2rem;
        color: var(--stark);
        background-color: var(--subtle);
      }
      p {
        max-width: 725px;
        margin-bottom: 2rem;
      }
      code {
        display: block;
        font-size: 0.55rem;
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

export const Sizing = () => ({
  template: hbs`
    <style type="text/css">
      body {
        padding: 2rem;
        color: var(--stark);
        background-color: var(--subtle);
      }
      p {
        max-width: 725px;
        margin-bottom: 2rem;
      }
      pre {
        color: #333;
        background-color: #EEE;
        padding: 1rem;
        margin-bottom: 2rem;
      }
      thead {
        font-weight: bold;
      }
      tr {
        border-bottom: 1px solid #EEE;
      }
      th,
      td {
        padding: 0.5rem 3rem 0.5rem 0.25rem;
        text-align: left;
      }
      .number-col {
        text-align: right;
      }
    </style>
    <section>
      <h1>Sizing</h1>
      <p>
        Use sizing function for things like margins,
        padding, and borders.  Sizes are returned in rem units rather than
        pixels, but have been calibrated with pixel equivalents in mind.
      </p>
      <p>
        To use the rems sizing function, first import the sizing module,
        then use it in your code wherever you normally specify a size:
      </p>
<pre>
@import "variables/sizing";
border: sizing.rems(xxxxs) solid;</pre>
      <table>
        <thead>
          <tr>
            <th scope="column">Name</th>
            <th scope="column" class="number-col">PX Equiv.</th>
            <th scope="column">SCSS</th>
          </tr>
        </thead>
        <tbody>
          {{#each sizes as |size|}}
            <tr>
              <th scope="row">
                <code>{{size.code}}</code>
              </th>
              <td class="number-col">{{size.pixels}}</td>
              <td>
                <code>sizing.rems({{size.code}})</code>
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </section>
  `,
  context: {
    sizes: [
      { code: 'xxl', pixels: 48 },
      { code: 'xl', pixels: 36 },
      { code: 'l', pixels: 24 },
      { code: 'm', pixels: 16, isBase: true },
      { code: 's', pixels: 12 },
      { code: 'xs', pixels: 8 },
      { code: 'off-xs', pixels: 5 },
      { code: 'xxs', pixels: 4 },
      { code: 'xxxs', pixels: 2 },
      { code: 'xxxxs', pixels: 1 },
    ],
  },
});

export const Typography = () => ({
  template: hbs`
    <style type="text/css">
      body {
        padding: 2rem;
        color: var(--stark);
        background-color: var(--subtle);
      }
      p {
        max-width: 725px;
        margin-bottom: 2rem;
      }
      pre {
        color: #333;
        background-color: #EEE;
        padding: 1rem;
        margin-bottom: 2rem;
      }
      thead {
        font-weight: bold;
      }
      tr {
        border-bottom: 1px solid #EEE;
      }
      th,
      td {
        padding: 0.5rem 3rem 0.5rem 0.25rem;
        text-align: left;
      }
      .number-col {
        text-align: right;
      }
      hr {
        margin: 1rem;
        border: 0.25px solid #DDD;
        background: none;
      }
    </style>
    <section>
      <h1>Typography</h1>
      <p>
        Paragraphs and headings are preconfigured for typography and margin.
      </p>
      <p>
        To specify custom typography, use the SCSS variables and mixin.
        The <code>type</code> mixin accepts two parameters:  a font size name
        (required) and an optional font weight name (normal, semibold, bold).
        This mixin sets both font size and line height, and optionally weight.
      </p>
<pre>
@import "utilities/type";
.my-component {
  @include type.type(m, bold);
}</pre>
      <table>
        <thead>
          <tr>
            <th scope="column">Name</th>
            <th scope="column" class="number-col">Font Size</th>
            <th scope="column">SCSS</th>
            <th scope="column">Note</th>
          </tr>
        </thead>
        <tbody>
          {{#each sizes as |size|}}
            <tr>
              <th scope="row">
                <code>{{size.code}}</code>
              </th>
              <td class="number-col">{{size.pixels}}</td>
              <td>
                <code>@include type.type({{size.code}});</code>
              </td>
              <td>
                {{size.note}}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </section>
  `,
  context: {
    sizes: [
      { code: 'xl', pixels: 28 },
      { code: 'l', pixels: 20 },
      { code: 'm', pixels: 16 },
      { code: 's', pixels: 14 },
      { code: 'xs', pixels: 12 },
      {
        code: 'h1',
        pixels: 28,
        note: 'Same as xl, but different line height.',
      },
      { code: 'h2', pixels: 20, note: 'Same as l, but different line height.' },
      { code: 'h3', pixels: 16, note: 'Same as m, but different line height.' },
      { code: 'button', pixels: 13 },
    ],
  },
});
