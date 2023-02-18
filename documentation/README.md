<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Boundary Code Styleguide documentation](#boundary-code-styleguide-documentation)
  - [HDS Usage](#hds-usage)
    - [@color component attribute](#color-component-attribute)
  - [Forms](#forms)
    - [Disable attribute](#disable-attribute)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Boundary Code Styleguide documentation

Boundary Code styleguide documentation will cover opinionated rules or practices the team agreeds to follow.

## HDS Usage

### @color component attribute

For components that provide the attribute `@color` we will use it just for product-specific colors such as `boundary` or `vault`.

We will not accept usage of [token colors](https://helios.hashicorp.design/foundations/tokens) for `@color` attribute.

If you need to provide a specific color to a component we want to use a [css class Helper or a CSS variable](https://helios.hashicorp.design/foundations/colors?tab=palette) in case we already define CSS for such component.

## Forms

### Disable attribute

Notice all our forms are customized, providing a `disabled` attribute for the form which is yield to only rose components. [Here the code](https://github.com/hashicorp/boundary-ui/blob/main/addons/rose/addon/components/rose/form/index.hbs).
We want the fields to use the form disable reference as a condition to disable themselves, except specific cases where we want to override such behaviour.

This is the pattern we enforce as default disable behaviour:
- For rose components: `disabled={{@disabled}}`
- For HDS components: `disabled={{form.disabled}}`