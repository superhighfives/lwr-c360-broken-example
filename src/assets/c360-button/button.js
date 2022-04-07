import { fragmentFrom } from 'elix/src/core/htmlLiterals.js';
import { firstRender, defaultState, render, template, setState, state } from 'elix/src/base/internal';
import SlotContentMixin from 'elix/src/base/SlotContentMixin.js';
import SdsButton from '@salesforce-ux/sds-button/button';
import { reflectAttribute } from '@salesforce-ux/sds-utils';
import { booleanAttributeValue } from 'elix/src/core/AttributeMarshallingMixin';
import css from './button.module.css';
export default class C360Button extends SlotContentMixin(SdsButton) {
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      size: 'default',
      variant: 'primary',
      kinetics: true,
      kxType: 'ripple',
    });
  }

  get size() {
    return this[state].size;
  }

  set size(size) {
    this[setState]({
      size: size,
    });
  }

  get kxDisabled() {
    return this[state].kxDisabled;
  }

  set kxDisabled(kxDisabled) {
    const isKxDisabled = booleanAttributeValue('kx-disabled', kxDisabled);
    this[setState]({
      kxDisabled: isKxDisabled,
      kinetics: !isKxDisabled,
    });
  }

  get kinetics() {
    return this[state].kinetics;
  }

  set kinetics(kinetics) {
    this[setState]({ kinetics });
  }

  get kxType() {
    return this[state].kxType;
  }

  set kxType(kxType) {
    this[setState]({ kxType });
  }

  get isRippling() {
    return this[state].isRippling;
  }

  set isRippling(isRippling) {
    this[setState]({ isRippling });
  }

  [render](changed) {
    super[render](changed);
    const button = this.shadowRoot.querySelector('[part="button"]');

    if (changed.size) {
      const { size } = this[state];
      reflectAttribute(this, 'size', size);
    }

    if (changed.variant) {
      const { variant } = this[state];
      reflectAttribute(this, 'variant', variant);
    }

    if (changed.content) {
      const defaultSlotHasContent = this[state].content && this.checkSlotContent(this[state].content);
      if (defaultSlotHasContent) {
        button.removeAttribute('icon-only');
      } else {
        button.setAttribute('icon-only', '');
      }
    }

    if (changed.isRippling) {
      button.classList.toggle('sds-kx-is-animating-from-click', this.isRippling);
    }

    if (changed.kxType) {
      const { kxType, kinetics } = this[state];
      reflectAttribute(this, 'kx-type', kinetics ? kxType : false);
    }

    if (changed.size) {
      const { size } = this[state];
      reflectAttribute(this, 'size', size);
    }

    if (changed.variant) {
      const { variant } = this[state];
      reflectAttribute(this, 'variant', variant);
    }

    if (this[firstRender]) {
      this.addEventListener('mouseenter', handleEnter);
      this.addEventListener('mouseleave', handleLeave);
      this.addEventListener('click', handleClick);

      // animationEnd is composed:false and doesn't bubble out of the shadow root
      // so in this case, the button element needs the listener
      button.addEventListener('animationend', handleRippleEnd.bind(this));
    }
  }

  checkSlotContent(nodes) {
    const assignedNodes = nodes.filter((node) => {
      if (node.tagName) {
        return true;
      }
      return node.textContent ? node.textContent.trim() : false;
    });
    return assignedNodes.length > 0;
  }

  get [template]() {
    const result = super[template];
    const button = result.content.querySelector("[part='button']");
    button.append(fragmentFrom.html`
      <div part="kx-ripple"></div>
    `);
    result.content.append(fragmentFrom.html`
      <style>
        ${css}
      </style>
    `);
    return result;
  }
}

const kxRefs = {};

function setCoordProps(element) {
  const { offsetX, offsetY } = kxRefs._pointerRef;
  element.style.setProperty('--c360-c-button-kx-pointer-position-x', `${offsetX}px`);
  element.style.setProperty('--c360-c-button-kx-pointer-position-y', `${offsetY}px`);
}

function animate(timestamp, element) {
  if (kxRefs.previousTimeRef !== undefined) setCoordProps(element);
  kxRefs.previousTimeRef = timestamp;
  kxRefs.requestRef = window.requestAnimationFrame((timestamp) => {
    animate(timestamp, element);
  });
}

function handleMove({ offsetX, offsetY }) {
  kxRefs._pointerRef = { offsetX, offsetY };
}

function handleEnter() {
  kxRefs.requestRef = window.requestAnimationFrame((timestamp) => {
    animate(timestamp, this);
  });

  this.addEventListener('mousemove', handleMove);
}

function handleLeave() {
  window.cancelAnimationFrame(kxRefs.requestRef);
  this.removeEventListener('mousemove', handleMove);
}

function handleClick(event) {
  if (this.kxType !== 'ripple') return; // conditionally short circuit the handler since it is not kineticss type ripple
  const { offsetX, offsetY } = event;
  kxRefs._pointerRef = { offsetX, offsetY };
  setCoordProps(this);
  this.isRippling = true;
}

function handleRippleEnd(event) {
  this.isRippling = false;
}
