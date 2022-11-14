//https://guides.emberjs.com/release/configuring-ember/handling-deprecations/
this.window.deprecationWorkflow = this.window.deprecationWorkflow || {};
this.window.deprecationWorkflow.config = {
  workflow: [
    {
      handler: 'log',
      matchMessage: /Rose .* component is deprecated, use HDS .* instead/,
    },
  ],
};
