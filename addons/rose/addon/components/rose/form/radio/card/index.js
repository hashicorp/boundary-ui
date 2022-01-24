import RoseFormRadioRadioComponent from '../radio';

export default class RoseFormRadioCardComponent extends RoseFormRadioRadioComponent {
  // =attributes
  layout = this.args.layout;
  className = `rose-form-radio-card-${this.layout}`;
}
