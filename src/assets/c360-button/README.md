# `@salesforce-ux/c360-button`
[![npm (custom registry)](https://img.shields.io/npm/v/@salesforce-ux/c360-button/latest?color=green&label=npm%20package)](https://www.npmjs.com/package/@salesforce-ux/c360-button)

## About
The button represent an control that should invoke an action

## Getting Started
Let's start by installing c360-button as a dependency of your project with [npm](https://www.npmjs.com/package/@salesforce-ux/c360-button).
```
npm i @salesforce-ux/c360-button
```

## Distributable
After installation, all the distributables for the `c360-button` are found under `/node_modules/@salesforce-ux/c360-button/dist/` folder.

|File Name             |Description     |
|--------------------- |--------------- |
|`button.css`          | The CSS file specific to `c360-button` only. It doesnot include the styles for it's parent `sds-button`. `c360-button` extends from `sds-button`|
|`button.compiled.css` | The Compiled CSS file for `c360-button`. This file includes styles for both `c360-button` and its parent `sds-button`. This file is useful for **LWC** applications.([see below](#for-lightning-web-componentlwc-application) &rarr;)|
|`button.js`           | The bundled JS file for `c360-button` component. This file is useful for **Non LWC** applications.([see below](#for-non-lwc-application) &rarr;)|


## `c360-button` Integration

For the sake of understanding, we will categorize the development environment into LWC and Non LWC application.    
This Guide will cover the integration approach for these two types of application.

### For `Lightning Web Component(LWC)` Application

> #### Dependency Inclusion

[`c360-styling-hooks`](https://www.npmjs.com/package/@salesforce-ux/c360-styling-hooks) is a styling dependency for `c360-button`. Hence, this needs to be embedded into your web app in order to make the `c360-button` render properly.

```css
/* myComponent.css */
@import "@salesforce-ux/c360-styling-hooks/dist/hooks.custom-props.css";
```

There are also other ways [`c360-styling-hooks`](https://www.npmjs.com/package/@salesforce-ux/c360-styling-hooks) can be embedded. Please checkout the [`c360-styling-hooks` Integration Guide](https://www.npmjs.com/package/@salesforce-ux/c360-styling-hooks) to learn more.


> #### Component CSS Import
```css
/* myComponent.css */
@import "@salesforce-ux/c360-styling-hooks/dist/hooks.custom-props.css";
@import "@salesforce-ux/c360-button/dist/button.compiled.css";
```

> #### HTML Decoration
After that,the HTML of your LWC component template needs to be decorated to have all the named part attributes as per the [component's specification](./button.spec.md).
Below is a reference to the component's structure.
```html
<c360-button>
  <button part="button">
    <slot name="start" part="start"></slot>
      Label
    <slot name="end" part="end"></slot>
  </button>
</c360-button>
```

### For `Non LWC` Application


> #### Dependency Inclusion [Read the section above](#dependency-inclusion)


> #### Component Import
```js
/* myComponent.js */
import C360Button from "@salesforce-ux/c360-button/dist/button";
```

> #### Component Registration
```js
/* myComponent.js */
customElements.define('c360-button', C360Button);
```

#### Example

Below is one approach to integrate your `c360-button` component.
##### Script
```js
/* myComponent.js */
import "@salesforce-ux/c360-styling-hooks/dist/hooks.custom-props.css";
import C360Button from "@salesforce-ux/c360-button/dist/button";
window.customElements.define('c360-button', c360Button);

```

##### HTML
```html
<c360-button variant="primary" size="small">
  Click
</c360-button>
```

## Interactive Demo
To see more examples with interactive demo, please visit `c360 Subsytem`'s [Storybook Environment](https://c360-subsystem-storybook.herokuapp.com/?path=/story/c360-subsystem-components-button--text)
