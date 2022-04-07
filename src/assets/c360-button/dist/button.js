/**
 * JavaScript template literals for constructing DOM nodes from HTML
 *
 * @module html
 */

/**
 * A JavaScript template string literal that returns an HTML document fragment.
 *
 * Example:
 *
 *     const fragment = fragmentFrom.html`Hello, <em>world</em>.`
 *
 * returns a `DocumentFragment` whose `innerHTML` is `Hello, <em>world</em>.`
 *
 * This function is called `html` so that it can be easily used with HTML
 * syntax-highlighting extensions for various popular code editors.
 *
 * See also [templateFrom.html](template#html), which returns a similar result but
 * as an HTMLTemplateElement.
 *
 * @param {TemplateStringsArray} strings - the strings passed to the JavaScript template
 * literal
 * @param {string[]} substitutions - the variable values passed to the
 * JavaScript template literal
 * @returns {DocumentFragment}
 */
const fragmentFrom = {
  html(strings, ...substitutions) {
    return templateFrom.html(strings, ...substitutions).content;
  },
};

/**
 * A JavaScript template string literal that returns an HTML template.
 *
 * Example:
 *
 *     const myTemplate = templateFrom.html`Hello, <em>world</em>.`
 *
 * returns an `HTMLTemplateElement` whose `innerHTML` is `Hello, <em>world</em>.`
 *
 * This function is called `html` so that it can be easily used with HTML
 * syntax-highlighting extensions for various popular code editors.
 *
 * See also [html](html), a helper which returns a similar result but as an
 * DocumentFragment.
 *
 * @param {TemplateStringsArray} strings - the strings passed to the JavaScript template
 * literal
 * @param {string[]} substitutions - the variable values passed to the
 * JavaScript template literal
 * @returns {HTMLTemplateElement}
 */
const templateFrom = {
  html(strings, ...substitutions) {
    const template = document.createElement("template");
    template.innerHTML = String.raw(strings, ...substitutions);
    return template;
  },
};

/**
 * Collection of shared Symbol objects for internal component communication.
 *
 * The shared `Symbol` objects in this module let mixins and a component
 * internally communicate without exposing these internal properties and methods
 * in the component's public API. They also help avoid unintentional name
 * collisions, as a component developer must specifically import the `internal`
 * module and reference one of its symbols.
 *
 * To use these `Symbol` objects in your own component, include this module and
 * then create a property or method whose key is the desired Symbol. E.g.,
 * [ShadowTemplateMixin](ShadowTemplateMixin) expects a component to define
 * a property called [template](#template):
 *
 *     import { template } from 'elix/src/core/internal.js';
 *     import { templateFrom } from 'elix/src/core/htmlLiterals.js'
 *     import ShadowTemplateMixin from 'elix/src/core/ShadowTemplateMixin.js';
 *
 *     class MyElement extends ShadowTemplateMixin(HTMLElement) {
 *       [template]() {
 *         return templateFrom.html`Hello, <em>world</em>.`;
 *       }
 *     }
 *
 * The above use of the internal `template` member lets the mixin find the
 * component's template in a way that will not pollute the component's public
 * API or interfere with other component logic. For example, if for some reason
 * the component wants to define a separate property with the plain string name,
 * "template", it can do so without affecting the above property setter.
 *
 * @module internal
 */

/**
 * Symbol for the default state for this element.
 */
const defaultState$1 = Symbol("defaultState");

/**
 * Symbol for the `delegatesFocus` property.
 *
 * [DelegatesFocusMixin](DelegatesFocusMixin) defines this property, returning
 * true to indicate that the focus is being delegated, even in browsers that
 * don't support that natively. Mixins like [KeyboardMixin](KeyboardMixin) use
 * this to accommodate focus delegation.
 */
const delegatesFocus$1 = Symbol("delegatesFocus");

/**
 * Symbol for the `firstRender` property.
 *
 * [ReactiveMixin](ReactiveMixin) sets the property to `true` during the
 * element's first `render` and `rendered` callback, then `false` in subsequent
 * callbacks.
 *
 * You can inspect this property in your own `rendered` callback handler to do
 * work like wiring up events that should only happen once.
 */
const firstRender$1 = Symbol("firstRender");

/**
 * Symbol for the `focusTarget` property.
 *
 * [DelegatesFocusMixin](DelegatesFocusMixin) defines this property as either:
 * 1) the element itself, in browsers that support native focus delegation or,
 * 2) the shadow root's first focusable element.
 */
const focusTarget$1 = Symbol("focusTarget");

/**
 * Symbol for the `hasDynamicTemplate` property.
 *
 * If your component class does not always use the same template, define a
 * static class property getter with this symbol and have it return `true`.
 * This will disable template caching for your component.
 */
const hasDynamicTemplate$1 = Symbol("hasDynamicTemplate");

/**
 * Symbol for the `ids` property.
 *
 * [ShadowTemplateMixin](ShadowTemplateMixin) defines a shorthand function
 * `internal.ids` that can be used to obtain a reference to a shadow element with
 * a given ID.
 *
 * Example: if component's template contains a shadow element
 * `<button id="foo">`, you can use the reference `this[ids].foo` to obtain
 * the corresponding button in the component instance's shadow tree.
 * The `ids` function is simply a shorthand for `getElementById`, so
 * `this[ids].foo` is the same as `this.shadowRoot.getElementById('foo')`.
 */
const ids$1 = Symbol("ids");

/**
 * Symbol for access to native HTML element internals.
 */
const nativeInternals$1 = Symbol("nativeInternals");

/**
 * Symbol for the `raiseChangeEvents` property.
 *
 * This property is used by mixins to determine whether they should raise
 * property change events. The standard HTML pattern is to only raise such
 * events in response to direct user interactions. For a detailed discussion
 * of this point, see the Gold Standard checklist item for
 * [Propery Change Events](https://github.com/webcomponents/gold-standard/wiki/Property%20Change%20Events).
 *
 * The above article describes a pattern for using a flag to track whether
 * work is being performed in response to internal component activity, and
 * whether the component should therefore raise property change events.
 * This `raiseChangeEvents` symbol is a shared flag used for that purpose by
 * all Elix mixins and components. Sharing this flag ensures that internal
 * activity (e.g., a UI event listener) in one mixin can signal other mixins
 * handling affected properties to raise change events.
 *
 * All UI event listeners (and other forms of internal handlers, such as
 * timeouts and async network handlers) should set `raiseChangeEvents` to
 * `true` at the start of the event handler, then `false` at the end:
 *
 *     this.addEventListener('click', event => {
 *       this[raiseChangeEvents] = true;
 *       // Do work here, possibly setting properties, like:
 *       this.foo = 'Hello';
 *       this[raiseChangeEvents] = false;
 *     });
 *
 * Elsewhere, property setters that raise change events should only do so it
 * this property is `true`:
 *
 *     set foo(value) {
 *       // Save foo value here, do any other work.
 *       if (this[raiseChangeEvents]) {
 *         export const event = new CustomEvent('foochange');
 *         this.dispatchEvent(event);
 *       }
 *     }
 *
 * In this way, programmatic attempts to set the `foo` property will not trigger
 * the `foochange` event, but UI interactions that update that property will
 * cause those events to be raised.
 */
const raiseChangeEvents$1 = Symbol("raiseChangeEvents");

/**
 * Symbol for the `render` method.
 *
 * [ReactiveMixin](ReactiveMixin) invokes this `internal.render` method to give
 * the component a chance to render recent changes in component state.
 */
const render$1 = Symbol("render");

/**
 * Symbol for the `renderChanges` method.
 *
 * [ReactiveMixin](ReactiveMixin) invokes this method in response to a
 * `setState` call; you should generally not invoke this method yourself.
 */
const renderChanges$1 = Symbol("renderChanges");

/**
 * Symbol for the `rendered` method.
 *
 * [ReactiveMixin](ReactiveMixin) will invoke this method after your
 * element has completely finished rendering.
 *
 * If you only want to do work the first time rendering happens (for example, if
 * you want to wire up event handlers), your `internal.rendered` implementation
 * can inspect the `internal.firstRender` flag.
 */
const rendered$1 = Symbol("rendered");

/**
 * Symbol for the `rendering` property.
 *
 * [ReactiveMixin](ReactiveMixin) sets this property to true during rendering,
 * at other times it will be false.
 */
const rendering$1 = Symbol("rendering");

/**
 * Symbol for the `setState` method.
 *
 * A component using [ReactiveMixin](ReactiveMixin) can invoke this method to
 * apply changes to the element's current state.
 */
const setState$1 = Symbol("setState");

/**
 * Symbol for the `shadowRoot` property.
 *
 * This property holds a reference to an element's shadow root, like
 * `this.shadowRoot`. This propery exists because `this.shadowRoot` is not
 * available for components with closed shadow roots.
 * [ShadowTemplateMixin](ShadowTemplateMixin) creates open shadow roots by
 * default, but you can opt into creating closed shadow roots; see
 * [shadowRootMode](internal#internal.shadowRootMode).
 */
const shadowRoot$1 = Symbol("shadowRoot");

/**
 * Symbol for the `shadowRootMode` property.
 *
 * If true (the default), then [ShadowTemplateMixin](ShadowTemplateMixin) will
 * create an open shadow root when the component is instantiated. Set this to
 * false if you want to programmatically hide component internals in a closed
 * shadow root.
 */
const shadowRootMode$1 = Symbol("shadowRootMode");

/**
 * Symbol for the element's current state.
 *
 * This is managed by [ReactiveMixin](ReactiveMixin).
 */
const state$1 = Symbol("state");

/**
 * Symbol for the `stateEffects` method.
 *
 * See [stateEffects](ReactiveMixin#stateEffects).
 */
const stateEffects$1 = Symbol("stateEffects");

/**
 * Symbol for the `template` method.
 *
 * [ShadowTemplateMixin](ShadowTemplateMixin) uses this property to obtain a
 * component's template, which it will clone into a component's shadow root.
 */
const template$1 = Symbol("template");

/**
 * Collection of shared Symbol objects for internal component communication.
 *
 * The shared `Symbol` objects in this module let mixins and a component
 * internally communicate without exposing these internal properties and methods
 * in the component's public API. They also help avoid unintentional name
 * collisions, as a component developer must specifically import the `internal`
 * module and reference one of its symbols.
 *
 * To use these `Symbol` objects in your own component, include this module and
 * then create a property or method whose key is the desired Symbol. E.g.,
 * [ShadowTemplateMixin](ShadowTemplateMixin) expects a component to define
 * a property called [template](#template):
 *
 *     import { template } from 'elix/src/core/internal.js';
 *     import { templateFrom } from 'elix/src/core/htmlLiterals.js'
 *     import ShadowTemplateMixin from 'elix/src/core/ShadowTemplateMixin.js';
 *
 *     class MyElement extends ShadowTemplateMixin(HTMLElement) {
 *       [template]() {
 *         return templateFrom.html`Hello, <em>world</em>.`;
 *       }
 *     }
 *
 * The above use of the internal `template` member lets the mixin find the
 * component's template in a way that will not pollute the component's public
 * API or interfere with other component logic. For example, if for some reason
 * the component wants to define a separate property with the plain string name,
 * "template", it can do so without affecting the above property setter.
 *
 * @module internal
 */

/**
 * Symbol for the `checkSize` method.
 *
 * If defined, this method will be invoked by [ResizeMixin](ResizeMixin)
 * when an element's size may have changed. The default implementation of
 * this method compares the element's current `clientHeight` and `clientWidth`
 * properties against the last known values of those properties (saved in
 * `state.clienHeight` and `state.clientWidth`).
 *
 * Components should override this method if they contain elements that may need
 * to know about size changes as well. For example, when an [Overlay](Overlay)
 * mixin opens, it invokes this method on any content elements that define it.
 * This gives the contents a chance to resize in response to being displayed.
 */
const checkSize = Symbol("checkSize");

/**
 * Symbol for the `closestAvailableItemIndex` method.
 *
 * This method is defined by [ItemsCursorMixin](ItemsCursorMixin). You can call
 * this if you want to find an item at a particular location, but may need to
 * account for the fact that the item at that position is not available, and
 * would like to find the closest item that is available.
 */
const closestAvailableItemIndex = Symbol("closestAvailableItemIndex");

/**
 * Symbol for the `contentSlot` property.
 *
 * [SlotContentMixin](SlotContentMixin) uses this to identify which slot
 * element in the component's shadow tree that holds the component's content.
 * By default, this is the first slot element with no "name" attribute. You
 * can override this to return a different slot.
 */
const contentSlot = Symbol("contentSlot");

/**
 * The default state for this element.
 */
const defaultState = defaultState$1;

/**
 * Symbol for the `defaultTabIndex` property.
 *
 * [KeyboardMixin](KeyboardMixin) uses this if it is unable to successfully
 * parse a string tabindex attribute.
 */
const defaultTabIndex = Symbol("defaultTabIndex");

/**
 * Symbol for the `delegatesFocus` property.
 *
 * [DelegatesFocusMixin](DelegatesFocusMixin) defines this property, returning
 * true to indicate that the focus is being delegated, even in browsers that
 * don't support that natively. Mixins like [KeyboardMixin](KeyboardMixin) use
 * this to accommodate focus delegation.
 */
const delegatesFocus = delegatesFocus$1;

/**
 * Symbol for the `effectEndTarget` property.
 *
 * [TransitionEffectMixin](TransitionEffectMixin) inspects this property to
 * determine which element's `transitionend` event will signal the end of a
 * transition effect.
 */
const effectEndTarget = Symbol("effectEndTarget");

/**
 * Symbol for the `firstRender` property.
 *
 * [ReactiveMixin](ReactiveMixin) sets the property to `true` during the
 * element's first `connectedCallback`, then `false` in subsequent callbacks.
 *
 * You can inspect this property in your own `connectedCallback` handler
 * to do work like wiring up events that should only happen once.
 */
const firstRender = firstRender$1;

/**
 * Symbol for the `focusTarget` property.
 *
 * [DelegatesFocusMixin](DelegatesFocusMixin) defines this property as either:
 * 1) the element itself, in browsers that support native focus delegation or,
 * 2) the shadow root's first focusable element.
 */
const focusTarget = focusTarget$1;

/**
 * Symbol for the `getItemText` method.
 *
 * This method can be applied to an item to return its text.
 * [KeyboardPrefixCursorMixin](KeyboardPrefixCursorMixin) uses this to
 * obtain the text for each item in a list, then matches keypresses again that
 * text.
 *
 * This method takes a single parameter: the `HTMLElement` of the item from
 * which text should be extracted.
 */
const getItemText = Symbol("getItemText");

/**
 * Symbol for the `goDown` method.
 *
 * This method is invoked when the user wants to go/navigate down.
 */
const goDown = Symbol("goDown");

/**
 * Symbol for the `goEnd` method.
 *
 * This method is invoked when the user wants to go/navigate to the end (e.g.,
 * of a list).
 */
const goEnd = Symbol("goEnd");

/**
 * Symbol for the `goFirst` method.
 *
 * This method is invoked when the user wants to go to the first item in a list.
 */
const goFirst = Symbol("goFirst");

/**
 * Symbol for the `goLast` method.
 *
 * This method is invoked when the user wants to go to the last item in a list.
 */
const goLast = Symbol("goLast");

/**
 * Symbol for the `goLeft` method.
 *
 * This method is invoked when the user wants to go/navigate left. Mixins that
 * make use of this method include
 * [KeyboardDirectionMixin](KeyboardDirectionMixin) and
 * [SwipeDirectionMixin](SwipeDirectionMixin).
 */
const goLeft = Symbol("goLeft");

/**
 * Symbol for the `goNext` method.
 *
 * This method is invoked when the user wants to go/navigate to the next item.
 */
const goNext = Symbol("goNext");

/**
 * Symbol for the `goPrevious` method.
 *
 * This method is invoked when the user wants to go/navigate to the previous item.
 */
const goPrevious = Symbol("goPrevious");

/**
 * Symbol for the `goRight` method.
 *
 * This method is invoked when the user wants to go/navigate right. Mixins
 * that make use of this method include
 * [KeyboardDirectionMixin](KeyboardDirectionMixin) and
 * [SwipeDirectionMixin](SwipeDirectionMixin).
 */
const goRight = Symbol("goRight");

/**
 * Symbol for the `goStart` method.
 *
 * This method is invoked when the user wants to go/navigate to the start
 * (e.g., of a list).
 */
const goStart = Symbol("goStart");

/**
 * Symbol for the `goToItemWithPrefix` method.
 *
 * This method is invoked by
 * [KeyboardPrefixCursorMixin](KeyboardPrefixCursorMixin) when the user types
 * text characters.
 */
const goToItemWithPrefix = Symbol("goToItemWithPrefix");

/**
 * Symbol for the `goUp` method.
 *
 * This method is invoked when the user wants to go/navigate up.
 */
const goUp = Symbol("goUp");

/**
 * Symbol for the `hasDynamicTemplate` property.
 *
 * If your component class does not always use the same template, define a
 * static class property getter with this symbol and have it return `true`.
 * This will disable template caching for your component.
 */
const hasDynamicTemplate = hasDynamicTemplate$1;

/**
 * Symbol for the `ids` property.
 *
 * [ShadowTemplateMixin](ShadowTemplateMixin) defines a shorthand function
 * `internal.ids` that can be used to obtain a reference to a shadow element with
 * a given ID.
 *
 * Example: if component's template contains a shadow element
 * `<button id="foo">`, you can use the reference `this[ids].foo` to obtain
 * the corresponding button in the component instance's shadow tree.
 * The `ids` function is simply a shorthand for `getElementById`, so
 * `this[ids].foo` is the same as `this.shadowRoot.getElementById('foo')`.
 */
const ids = ids$1;

/**
 * Symbol for the `inputDelegate` property.
 *
 * [DelegateInputSelectionMixin](DelegateInputSelectionMixin) uses this property
 * to indicate which shadow element is the input-type element to which text
 * selection methods and properties should be delegated.
 */
const inputDelegate = Symbol("inputDelegate");

/**
 * Symbol for the `itemsDelegate` property.
 *
 * A component using [DelegateItemsMixin](DelegateItemsMixin) uses this property
 * to indicate which one of its shadow elements is the one whose `items`
 * property will be treated as the component's own `items`.
 */
const itemsDelegate = Symbol("itemsDelegate");

/**
 * Symbol for the `keydown` method.
 *
 * This method is invoked when an element receives a `keydown` event.
 *
 * An implementation of `internal.keydown` should return `true` if it handled
 * the event, and `false` otherwise. If `true` is returned (the event was
 * handled), `KeyboardMixin` invokes the event's `preventDefault` and
 * `stopPropagation` methods to let the browser know the event was handled.
 *
 * The convention for handling `internal.keydown` is that the last mixin
 * applied wins. That is, if an implementation of `internal.keydown` *did*
 * handle the event, it can return immediately. If it did not, it should
 * invoke `super` to let implementations further up the prototype chain have
 * their chance.
 *
 * This method takes a `KeyboardEvent` parameter that contains the event being
 * processed.
 */
const keydown = Symbol("keydown");

/**
 * Symbol for the `mouseenter` method.
 *
 * [HoverMixin](HoverMixin) invokes this method when the user moves the
 * mouse over a component. That mixin provides a base implementation of this
 * method, but you can extend it to do additional work on `mouseenter`.
 *
 * This method takes a `MouseEvent` parameter that contains the event being
 * processed.
 */
const mouseenter = Symbol("mouseenter");

/**
 * Symbol for the `mouseleave` method.
 *
 * [HoverMixin](HoverMixin) invokes this method when the user moves off a
 * component. That mixin provides a base implementation of this method, but
 * you can extend it to do additional work on `mouseleave`.
 *
 * This method takes a `MouseEvent` parameter that contains the event being
 * processed.
 */
const mouseleave = Symbol("mouseleave");

/**
 * Symbol for access to native HTML element internals.
 */
const nativeInternals = nativeInternals$1;

/**
 * Symbol for the `raiseChangeEvents` property.
 *
 * This property is used by mixins to determine whether they should raise
 * property change events. The standard HTML pattern is to only raise such
 * events in response to direct user interactions. For a detailed discussion
 * of this point, see the Gold Standard checklist item for
 * [Propery Change Events](https://github.com/webcomponents/gold-standard/wiki/Property%20Change%20Events).
 *
 * The above article describes a pattern for using a flag to track whether
 * work is being performed in response to internal component activity, and
 * whether the component should therefore raise property change events.
 * This `raiseChangeEvents` symbol is a shared flag used for that purpose by
 * all Elix mixins and components. Sharing this flag ensures that internal
 * activity (e.g., a UI event listener) in one mixin can signal other mixins
 * handling affected properties to raise change events.
 *
 * All UI event listeners (and other forms of internal handlers, such as
 * timeouts and async network handlers) should set `raiseChangeEvents` to
 * `true` at the start of the event handler, then `false` at the end:
 *
 *     this.addEventListener('click', event => {
 *       this[raiseChangeEvents] = true;
 *       // Do work here, possibly setting properties, like:
 *       this.foo = 'Hello';
 *       this[raiseChangeEvents] = false;
 *     });
 *
 * Elsewhere, property setters that raise change events should only do so it
 * this property is `true`:
 *
 *     set foo(value) {
 *       // Save foo value here, do any other work.
 *       if (this[raiseChangeEvents]) {
 *         export const event = new CustomEvent('foochange');
 *         this.dispatchEvent(event);
 *       }
 *     }
 *
 * In this way, programmatic attempts to set the `foo` property will not trigger
 * the `foochange` event, but UI interactions that update that property will
 * cause those events to be raised.
 */
const raiseChangeEvents = raiseChangeEvents$1;

/**
 * Symbol for the `render` method.
 *
 * [ReactiveMixin](ReactiveMixin) invokes this `internal.render` method to give
 * the component a chance to render recent changes in component state.
 */
const render = render$1;

/**
 * Symbol for the `renderChanges` method.
 *
 * [ReactiveMixin](ReactiveMixin) invokes this method in response to a
 * `setState` call; you should generally not invoke this method yourself.
 */
const renderChanges = renderChanges$1;

/**
 * Symbol for the `renderDataToElement` method.
 *
 * [DataItemsMixin](DataItemsMixin) invokes this method to render data to an
 * element being used as an item in a list.
 */
const renderDataToElement = Symbol("renderDataToElement");

/**
 * Symbol for the `rendered` method.
 *
 * [ReactiveMixin](ReactiveMixin) will invoke this method after your
 * element has completely finished rendering.
 */
const rendered = rendered$1;

/**
 * Symbol for the `rendering` property.
 *
 * [ReactiveMixin](ReactiveMixin) sets this property to true during rendering,
 * at other times it will be false.
 */
const rendering = rendering$1;

/**
 * Symbol for the `scrollTarget` property.
 *
 * This property indicates which element in a component's shadow subtree
 * should be scrolled. [CursorInViewMixin](CursorInViewMixin) can use
 * this property to determine which element should be scrolled to keep the
 * selected item in view.
 */
const scrollTarget = Symbol("scrollTarget");

/**
 * Symbol for the `setState` method.
 *
 * A component using [ReactiveMixin](ReactiveMixin) can invoke this method to
 * apply changes to the element's current state.
 */
const setState = setState$1;

/**
 * Symbol for the `shadowRoot` property.
 *
 * This property holds a reference to an element's shadow root, like
 * `this.shadowRoot`. This propery exists because `this.shadowRoot` is not
 * available for components with closed shadow roots.
 * [ShadowTemplateMixin](ShadowTemplateMixin) creates open shadow roots by
 * default, but you can opt into creating closed shadow roots; see
 * [shadowRootMode](internal#internal.shadowRootMode).
 */
const shadowRoot = shadowRoot$1;

/**
 * Symbol for the `shadowRootMode` property.
 *
 * If true (the default), then [ShadowTemplateMixin](ShadowTemplateMixin) will
 * create an open shadow root when the component is instantiated. Set this to
 * false if you want to programmatically hide component internals in a closed
 * shadow root.
 */
const shadowRootMode = shadowRootMode$1;

/**
 * Symbol for the `startEffect` method.
 *
 * A component using [TransitionEffectMixin](TransitionEffectMixin) can invoke
 * this method to trigger the application of a named, asynchronous CSS
 * transition effect.
 *
 * This method takes a single `string` parameter giving the name of the effect
 * to start.
 */
const startEffect = Symbol("startEffect");

/**
 * The element's current state.
 *
 * This is managed by [ReactiveMixin](ReactiveMixin).
 */
const state = state$1;

const stateEffects = stateEffects$1;

/**
 * Symbol for the `swipeDown` method.
 *
 * The swipe mixin [TouchSwipeMixin](TouchSwipeMixin) invokes this method when
 * the user finishes a gesture to swipe down.
 */
const swipeDown = Symbol("swipeDown");

/**
 * Symbol for the `swipeDownComplete` method.
 *
 * [SwipeCommandsMixin](SwipeCommandsMixin) invokes this method after any
 * animated transition associated with a swipe down has completed.
 */
const swipeDownComplete = Symbol("swipeDownComplete");

/**
 * Symbol for the `swipeLeft` method.
 *
 * The swipe mixins [TouchSwipeMixin](TouchSwipeMixin) and
 * [TrackpadSwipeMixin](TrackpadSwipeMixin) invoke this method when the user
 * finishes a gesture to swipe left.
 */
const swipeLeft = Symbol("swipeLeft");

/**
 * Symbol for the `swipeLeftTransitionEnd` method.
 *
 * [SwipeCommandsMixin](SwipeCommandsMixin) invokes this method after any
 * animated transition associated with a swipe left has completed.
 */
const swipeLeftTransitionEnd = Symbol("swipeLeftTransitionEnd");

/**
 * Symbol for the `swipeRight` method.
 *
 * The swipe mixins [TouchSwipeMixin](TouchSwipeMixin) and
 * [TrackpadSwipeMixin](TrackpadSwipeMixin) invoke this method when the user
 * finishes a gesture to swipe right.
 */
const swipeRight = Symbol("swipeRight");

/**
 * Symbol for the `swipeRightTransitionEnd` method.
 *
 * [SwipeCommandsMixin](SwipeCommandsMixin) invokes this method after any
 * animated transition associated with a swipe right has completed.
 */
const swipeRightTransitionEnd = Symbol("swipeRightTransitionEnd");

/**
 * Symbol for the `swipeUp` method.
 *
 * The swipe mixin [TouchSwipeMixin](TouchSwipeMixin) invokes this method when
 * the user finishes a gesture to swipe up.
 */
const swipeUp = Symbol("swipeUp");

/**
 * Symbol for the `swipeUpComplete` method.
 *
 * [SwipeCommandsMixin](SwipeCommandsMixin) invokes this method after any
 * animated transition associated with a swipe up has completed.
 */
const swipeUpComplete = Symbol("swipeUpComplete");

/**
 * Symbol for the `swipeStart` method.
 *
 * [TouchSwipeMixin](TouchSwipeMixin) and
 * [TrackpadSwipeMixin](TrackpadSwipeMixin) invoke this method when a swipe
 * is starting, passing in the starting (x, y) client coordinate.
 */
const swipeStart = Symbol("swipeStart");

/**
 * Symbol for the `swipeTarget` property.
 *
 * By default, the swipe mixins [TouchSwipeMixin](TouchSwipeMixin) and
 * [TrackpadSwipeMixin](TrackpadSwipeMixin) assume that the element the user
 * is swiping the top-level element. In some cases (e.g., [Drawer](Drawer)),
 * the component wants to let the user swipe a shadow element. In such cases,
 * this property should return the element that should be swiped.
 *
 * The swipe target's `offsetWidth` is used by the mixin to calculate the
 * `state.swipeFraction` member when the user drags their finger. The
 * `swipeFraction` is the distance the user has dragged in the current drag
 * operation over that `offsetWidth`.
 */
const swipeTarget = Symbol("swipeTarget");

/**
 * Symbol for the `tap` method.
 *
 * This method is invoked when an element receives an operation that should
 * be interpreted as a tap. [TapCursorMixin](TapCursorMixin)
 * invokes this when the element receives a `mousedown` event, for example.
 */
const tap = Symbol("tap");

/**
 * Symbol for the `template` method.
 *
 * [ShadowTemplateMixin](ShadowTemplateMixin) uses this property to obtain a
 * component's template, which it will clone into a component's shadow root.
 */
const template = template$1;

/**
 * Symbol for the `toggleSelectedFlag` method.
 *
 * [ItemsMultiSelectMixin](ItemsMultiSelectMixin) exposes this method to let
 * other mixins like [MultiSelectAPIMixin](MultiSelectAPIMixin) toggle the
 * selected state of an individual item.
 */
const toggleSelectedFlag = Symbol("toggleSelectedFlag");

// Expose internals as a global when debugging.
const elixdebug = new URLSearchParams(location.search).get("elixdebug");
if (elixdebug === "true") {
  /** @type {any} */ (window).elix = {
    internal: {
      checkSize,
      closestAvailableItemIndex,
      contentSlot,
      defaultState,
      defaultTabIndex,
      delegatesFocus,
      effectEndTarget,
      firstRender,
      focusTarget,
      getItemText,
      goDown,
      goEnd,
      goFirst,
      goLast,
      goLeft,
      goNext,
      goPrevious,
      goRight,
      goStart,
      goToItemWithPrefix,
      goUp,
      hasDynamicTemplate,
      ids,
      inputDelegate,
      itemsDelegate,
      keydown,
      mouseenter,
      mouseleave,
      nativeInternals,
      event,
      raiseChangeEvents,
      render,
      renderChanges,
      renderDataToElement,
      rendered,
      rendering,
      scrollTarget,
      setState,
      shadowRoot,
      shadowRootMode,
      startEffect,
      state,
      stateEffects,
      swipeDown,
      swipeDownComplete,
      swipeLeft,
      swipeLeftTransitionEnd,
      swipeRight,
      swipeRightTransitionEnd,
      swipeUp,
      swipeUpComplete,
      swipeStart,
      swipeTarget,
      tap,
      template,
      toggleSelectedFlag,
    },
  };
}

// Memoized maps of attribute to property names and vice versa.
// We initialize this with the special case of the tabindex (lowercase "i")
// attribute, which is mapped to the tabIndex (capital "I") property.
/** @type {IndexedObject<string>} */
const attributeToPropertyNames = {
  tabindex: "tabIndex",
};
/** @type {IndexedObject<string>} */
const propertyNamesToAttributes = {
  tabIndex: "tabindex",
};

/**
 * Sets properties when the corresponding attributes change
 *
 * If your component exposes a setter for a property, it's generally a good
 * idea to let devs using your component be able to set that property in HTML
 * via an element attribute. You can code that yourself by writing an
 * `attributeChangedCallback`, or you can use this mixin to get a degree of
 * automatic support.
 *
 * This mixin implements an `attributeChangedCallback` that will attempt to
 * convert a change in an element attribute into a call to the corresponding
 * property setter. Attributes typically follow hyphenated names ("foo-bar"),
 * whereas properties typically use camelCase names ("fooBar"). This mixin
 * respects that convention, automatically mapping the hyphenated attribute
 * name to the corresponding camelCase property name.
 *
 * Example: You define a component using this mixin:
 *
 *     class MyElement extends AttributeMarshallingMixin(HTMLElement) {
 *       get fooBar() { return this._fooBar; }
 *       set fooBar(value) { this._fooBar = value; }
 *     }
 *
 * If someone then instantiates your component in HTML:
 *
 *     <my-element foo-bar="Hello"></my-element>
 *
 * Then, after the element has been upgraded, the `fooBar` setter will
 * automatically be invoked with the initial value "Hello".
 *
 * Attributes can only have string values. If you'd like to convert string
 * attributes to other types (numbers, booleans), you must implement parsing
 * yourself.
 *
 * @module AttributeMarshallingMixin
 * @param {Constructor<CustomElement>} Base
 */
function AttributeMarshallingMixin(Base) {
  // The class prototype added by the mixin.
  class AttributeMarshalling extends Base {
    /**
     * Handle a change to the attribute with the given name.
     *
     * @ignore
     * @param {string} attributeName
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(attributeName, oldValue, newValue) {
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(attributeName, oldValue, newValue);
      }

      // Sometimes this callback is invoked when there's not actually any
      // change, in which we skip invoking the property setter.
      //
      // We also skip setting properties if we're rendering. A component may
      // want to reflect property values to attributes during rendering, but
      // such attribute changes shouldn't trigger property updates.
      if (newValue !== oldValue && !this[rendering$1]) {
        const propertyName = attributeToPropertyName(attributeName);
        // If the attribute name corresponds to a property name, set the property.
        if (propertyName in this) {
          // Parse standard boolean attributes.
          const parsed = standardBooleanAttributes[attributeName]
            ? booleanAttributeValue(attributeName, newValue)
            : newValue;
          this[propertyName] = parsed;
        }
      }
    }

    // Because maintaining the mapping of attributes to properties is tedious,
    // this provides a default implementation for `observedAttributes` that
    // assumes that your component will want to expose all public properties in
    // your component's API as properties.
    //
    // You can override this default implementation of `observedAttributes`. For
    // example, if you have a system that can statically analyze which
    // properties are available to your component, you could hand-author or
    // programmatically generate a definition for `observedAttributes` that
    // avoids the minor run-time performance cost of inspecting the component
    // prototype to determine your component's public properties.
    static get observedAttributes() {
      return attributesForClass(this);
    }
  }

  return AttributeMarshalling;
}

/**
 * Return the custom attributes for the given class.
 *
 * E.g., if the supplied class defines a `fooBar` property, then the resulting
 * array of attribute names will include the "foo-bar" attribute.
 *
 * @private
 * @param {Constructor<HTMLElement>} classFn
 * @returns {string[]}
 */
function attributesForClass(classFn) {
  // We treat the HTMLElement base class as if it has no attributes, since we
  // don't want to receive attributeChangedCallback for it (or anything further
  // up the protoype chain).
  if (classFn === HTMLElement) {
    return [];
  }

  // Get attributes for parent class.
  const baseClass = Object.getPrototypeOf(classFn.prototype).constructor;

  // See if parent class defines observedAttributes manually.
  let baseAttributes = baseClass.observedAttributes;
  if (!baseAttributes) {
    // Calculate parent class attributes ourselves.
    baseAttributes = attributesForClass(baseClass);
  }

  // Get the properties for this particular class.
  const propertyNames = Object.getOwnPropertyNames(classFn.prototype);
  const setterNames = propertyNames.filter((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      classFn.prototype,
      propertyName
    );
    return descriptor && typeof descriptor.set === "function";
  });

  // Map the property names to attribute names.
  const attributes = setterNames.map((setterName) =>
    propertyNameToAttribute(setterName)
  );

  // Merge the attribute for this class and its base class.
  const diff = attributes.filter(
    (attribute) => baseAttributes.indexOf(attribute) < 0
  );
  const result = baseAttributes.concat(diff);

  return result;
}

/**
 * Convert hyphenated foo-bar attribute name to camel case fooBar property name.
 *
 * @private
 * @param {string} attributeName
 */
function attributeToPropertyName(attributeName) {
  let propertyName = attributeToPropertyNames[attributeName];
  if (!propertyName) {
    // Convert and memoize.
    const hyphenRegEx = /-([a-z])/g;
    propertyName = attributeName.replace(hyphenRegEx, (match) =>
      match[1].toUpperCase()
    );
    attributeToPropertyNames[attributeName] = propertyName;
  }
  return propertyName;
}

/**
 * Given a string value for a named boolean attribute, return `true` if the
 * value is either: a) the empty string, or b) a case-insensitive match for the
 * name.
 *
 * This is native HTML behavior; see the MDN documentation on [boolean
 * attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Boolean_Attributes)
 * for the reasoning.
 *
 * Given a null value, this return `false`.
 * Given a boolean value, this return the value as is.
 *
 * @param {string} name
 * @param {string|boolean|null} value
 */
function booleanAttributeValue(name, value) {
  return typeof value === "boolean"
    ? value
    : typeof value === "string"
    ? value === "" || name.toLowerCase() === value.toLowerCase()
    : false;
}

/**
 * Convert a camel case fooBar property name to a hyphenated foo-bar attribute.
 *
 * @private
 * @param {string} propertyName
 */
function propertyNameToAttribute(propertyName) {
  let attribute = propertyNamesToAttributes[propertyName];
  if (!attribute) {
    // Convert and memoize.
    const uppercaseRegEx = /([A-Z])/g;
    attribute = propertyName.replace(uppercaseRegEx, "-$1").toLowerCase();
    propertyNamesToAttributes[propertyName] = attribute;
  }
  return attribute;
}

/** @type {IndexedObject<boolean>} */
const standardBooleanAttributes = {
  checked: true,
  defer: true,
  disabled: true,
  hidden: true,
  ismap: true,
  multiple: true,
  noresize: true,
  readonly: true,
  selected: true,
};

/** @type {any} */
const stateKey = Symbol("state");
/** @type {any} */
const raiseChangeEventsInNextRenderKey = Symbol(
  "raiseChangeEventsInNextRender"
);
// Tracks total set of changes made to elements since their last render.
/** @type {any} */
const changedSinceLastRenderKey = Symbol("changedSinceLastRender");

/**
 * Manages component state and renders changes in state
 *
 * This is modeled after React/Preact's state management, and is adapted for
 * use with web components. Applying this mixin to a component will give it
 * FRP behavior comparable to React's.
 *
 * This model is very basic. It's key aspects are:
 * * an immutable `state` property updated via `setState` calls.
 * * a `render` method that will be invoked asynchronously when state changes.
 *
 * @module ReactiveMixin
 * @param {Constructor<CustomElement>} Base
 */
function ReactiveMixin(Base) {
  class Reactive extends Base {
    constructor() {
      super();

      // Components can inspect `firstRender` during rendering to do special
      // work the first time (like wire up event handlers). Until the first
      // render actually happens, we set that flag to be undefined so we have a
      // way of distinguishing between a component that has never rendered and
      // one that is being rendered for the nth time.
      this[firstRender$1] = undefined;

      // We want to support the standard HTML pattern of only raising events in
      // response to direct user interactions. For a detailed discussion of this
      // point, see the Gold Standard checklist item for [Propery Change
      // Events](https://github.com/webcomponents/gold-standard/wiki/Property%20Change%20Events).
      //
      // To support this pattern, we define a flag indicating whether change
      // events should be raised. By default, we want the flag to be false. In
      // UI event handlers, a component can temporarily set the flag to true. If
      // a setState call is made while the flag is true, then that fact will be
      // remembered and passed the subsequent render/rendered methods. That will
      // let the methods know whether they should raise property change events.
      this[raiseChangeEvents$1] = false;

      // Maintain a change log of all fields which have changed since the
      // component was last rendered.
      this[changedSinceLastRenderKey] = null;

      // Set the initial state from the default state defined by the component
      // and its mixins/base classes.
      this[setState$1](this[defaultState$1]);
    }

    // When the component is attached to the document (or upgraded), we will
    // generally render the component for the first time. That operation will
    // include rendering of the default state and any state changes that
    // happened between constructor time and this connectedCallback.
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      // Render the component.
      //
      // If the component was forced to render before this point, and the state
      // hasn't changed, this call will be a no-op.
      this[renderChanges$1]();
    }

    /**
     * The default state for the component. This can be extended by mixins and
     * classes to provide additional default state.
     *
     * @type {PlainObject}
     */
    // @ts-ignore
    get [defaultState$1]() {
      // Defer to base implementation if defined.
      return super[defaultState$1] || {};
    }

    /**
     * Render the indicated changes in state to the DOM.
     *
     * The default implementation of this method does nothing. Override this
     * method in your component to update your component's host element and
     * any shadow elements to reflect the component's new state. See the
     * [rendering example](ReactiveMixin#rendering).
     *
     * Be sure to call `super` in your method implementation so that your
     * component's base classes and mixins have a chance to perform their own
     * render work.
     *
     * @param {ChangedFlags} changed - dictionary of flags indicating which state
     * members have changed since the last render
     */
    [render$1](changed) {
      if (super[render$1]) {
        super[render$1](changed);
      }
    }

    /**
     * Render any pending component changes to the DOM.
     *
     * This method does nothing if the state has not changed since the last
     * render call.
     *
     * ReactiveMixin will invoke this method following a `setState` call;
     * you should not need to invoke this method yourself.
     *
     * This method invokes the internal `render` method, then invokes the
     * `rendered` method.
     */
    [renderChanges$1]() {
      if (this[firstRender$1] === undefined) {
        // First render.
        this[firstRender$1] = true;
      }

      // Get the log of which fields have changed since the last render.
      const changed = this[changedSinceLastRenderKey];

      // We only render if this is the first render, or state has changed since
      // the last render.
      if (this[firstRender$1] || changed) {
        // If at least one of the[setState] calls was made in response
        // to user interaction or some other component-internal event, set the
        // raiseChangeEvents flag so that render/rendered methods know whether
        // to raise property change events. See the comments in the component
        // constructor where we initialize this flag for details.
        const saveRaiseChangeEvents = this[raiseChangeEvents$1];
        this[raiseChangeEvents$1] = this[raiseChangeEventsInNextRenderKey];

        // From this point on, we'll assume we won't need to raise events in the
        // next render. If raiseChangeEvents is true right now, however, and the
        // rendered method calls setState, then this flag will be set to true
        // for the next render. That's apporopriate because the second-order
        // setState call in rendered still counts as a user-initiated effect
        // that should raise change events.
        this[raiseChangeEventsInNextRenderKey] = false;

        // We set a flag to indicate that rendering is happening. The component
        // may use this to avoid triggering other updates during the render.
        this[rendering$1] = true;

        // Invoke any internal render implementations.
        this[render$1](changed);

        this[rendering$1] = false;

        // Since we've now rendered all changes, clear the change log. If other
        // async render calls are queued up behind this call, they'll see an
        // empty change log, and so skip unnecessary render work.
        this[changedSinceLastRenderKey] = null;

        // Let the component know it was rendered.
        this[rendered$1](changed);

        // We've now rendered for the first time.
        this[firstRender$1] = false;

        // Restore state of event flag.
        this[raiseChangeEvents$1] = saveRaiseChangeEvents;
      }
    }

    /**
     * Perform any work that must happen after state changes have been rendered
     * to the DOM.
     *
     * The default implementation of this method does nothing. Override this
     * method in your component to perform work that requires the component to
     * be fully rendered, such as setting focus on a shadow element or
     * inspecting the computed style of an element. If such work should result
     * in a change in component state, you can safely call `setState` during the
     * `rendered` method.
     *
     * Be sure to call `super` in your method implementation so that your
     * component's base classes and mixins have a chance to perform their own
     * post-render work.
     *
     * @param {ChangedFlags} changed
     */
    [rendered$1](changed) {
      if (super[rendered$1]) {
        super[rendered$1](changed);
      }
    }

    /**
     * Update the component's state by merging the specified changes on
     * top of the existing state. If the component is connected to the document,
     * and the new state has changed, this returns a promise to asynchronously
     * render the component. Otherwise, this returns a resolved promise.
     *
     * @param {PlainObject} changes - the changes to apply to the element's state
     * @returns {Promise} - resolves when the new state has been rendered
     */
    async [setState$1](changes) {
      // There's no good reason to have a render method update state.
      if (this[rendering$1]) {
        /* eslint-disable no-console */
        console.warn(
          `${this.constructor.name} called [setState] during rendering, which you should avoid.\nSee https://elix.org/documentation/ReactiveMixin.`
        );
      }

      // Apply the changes to a copy of the component's current state to produce
      // a new, updated state and a dictionary of flags indicating which fields
      // actually changed.
      const { state, changed } = copyStateWithChanges(this, changes);

      // We only need to apply the changes to the component state if: a) the
      // current state is undefined (this is the first time setState has been
      // called), or b) the supplied changes parameter actually contains
      // substantive changes.
      if (this[stateKey] && Object.keys(changed).length === 0) {
        // No need to update state.
        return;
      }

      // Freeze the new state so it's immutable. This prevents accidental
      // attempts to set state without going through setState.
      Object.freeze(state);

      // Set this as the component's new state.
      this[stateKey] = state;

      // If setState was called with the raiseChangeEvents flag set, record that
      // fact for use in rendering. See the comments in the component
      // constructor for details.
      if (this[raiseChangeEvents$1]) {
        this[raiseChangeEventsInNextRenderKey] = true;
      }

      // Look to see whether the component is already set up to render.
      const willRender =
        this[firstRender$1] === undefined ||
        this[changedSinceLastRenderKey] !== null;

      // Add this round of changed fields to the complete log of fields that
      // have changed since the component was last rendered.
      this[changedSinceLastRenderKey] = Object.assign(
        this[changedSinceLastRenderKey] || {},
        changed
      );

      // We only need to queue a render if we're in the document and a render
      // operation hasn't already been queued for this component. If we're not
      // in the document yet, when the component is eventually added to the
      // document, the connectedCallback will ensure we render at that point.
      const needsRender = this.isConnected && !willRender;
      if (needsRender) {
        // Yield with promise timing. This lets any *synchronous* setState calls
        // that happen after this current setState call complete first. Their
        // effects on the state will be batched up, and accumulate in the change
        // log stored under this[changedSinceLastRenderKey].
        await Promise.resolve();

        // Now that the above promise has resolved, render the component. By the
        // time this line is reached, the complete log of batched changes can be
        // applied in a single render call.
        this[renderChanges$1]();
      }
    }

    /**
     * The component's current state.
     *
     * The returned state object is immutable. To update it, invoke
     * `internal.setState`.
     *
     * It's extremely useful to be able to inspect component state while
     * debugging. If you append `?elixdebug=true` to a page's URL, then
     * ReactiveMixin will conditionally expose a public `state` property that
     * returns the component's state. You can then access the state in your
     * browser's debug console.
     *
     * @type {PlainObject}
     */
    get [state$1]() {
      return this[stateKey];
    }

    /**
     * Ask the component whether a state with a set of recently-changed fields
     * implies that additional second-order changes should be applied to that
     * state to make it consistent.
     *
     * This method is invoked during a call to `internal.setState` to give all
     * of a component's mixins and classes a chance to respond to changes in
     * state. If one mixin/class updates state that it controls, another
     * mixin/class may want to respond by updating some other state member that
     * *it* controls.
     *
     * This method should return a dictionary of changes that should be applied
     * to the state. If the dictionary object is not empty, the
     * `internal.setState` method will apply the changes to the state, and
     * invoke this `stateEffects` method again to determine whether there are
     * any third-order effects that should be applied. This process repeats
     * until all mixins/classes report that they have no additional changes to
     * make.
     *
     * See an example of how `ReactiveMixin` invokes the `stateEffects` to
     * [ensure state consistency](ReactiveMixin#ensuring-state-consistency).
     *
     * @param {PlainObject} state - a proposal for a new state
     * @param {ChangedFlags} changed - the set of fields changed in this
     * latest proposal for the new state
     * @returns {PlainObject}
     */
    [stateEffects$1](state, changed) {
      return super[stateEffects$1] ? super[stateEffects$1](state, changed) : {};
    }
  }

  // Expose state when debugging; see note for `[state]` getter.
  const elixdebug = new URLSearchParams(location.search).get("elixdebug");
  if (elixdebug === "true") {
    Object.defineProperty(Reactive.prototype, "state", {
      get() {
        return this[state$1];
      },
    });
  }

  return Reactive;
}

/**
 * Create a copy of the component's state with the indicated changes applied.
 * Ask the component whether the new state implies any second-order effects. If
 * so, apply those and loop again until the state has stabilized. Return the new
 * state and a dictionary of flags indicating which fields were actually
 * changed.
 *
 * @private
 * @param {Element} element
 * @param {PlainObject} changes
 */
function copyStateWithChanges(element, changes) {
  // Start with a copy of the current state.
  /** @type {PlainObject} */
  const state = Object.assign({}, element[stateKey]);
  /** @type {ChangedFlags} */
  const changed = {};
  // Take the supplied changes as the first round of effects.
  let effects = changes;
  // Loop until there are no effects to apply.
  /* eslint-disable no-constant-condition */
  while (true) {
    // See whether the effects actually changed anything in state.
    const changedByEffects = fieldsChanged(state, effects);
    if (Object.keys(changedByEffects).length === 0) {
      // No more effects to apply; we're done.
      break;
    }
    // Apply the effects.
    Object.assign(state, effects);
    Object.assign(changed, changedByEffects);
    // Ask the component if there are any second- (or third-, etc.) order
    // effects that should be applied.
    effects = element[stateEffects$1](state, changedByEffects);
  }
  return { state, changed };
}

/**
 * Return true if the two values are equal.
 *
 * @private
 * @param {any} value1
 * @param {any} value2
 * @returns {boolean}
 */
function equal(value1, value2) {
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime();
  }
  return value1 === value2;
}

/**
 * Return a dictionary of flags indicating which of the indicated changes to the
 * state are actually substantive changes.
 *
 * @private
 * @param {PlainObject} state
 * @param {PlainObject} changes
 */
function fieldsChanged(state, changes) {
  /** @type {ChangedFlags} */
  const changed = {};
  for (const field in changes) {
    if (!equal(changes[field], state[field])) {
      changed[field] = true;
    }
  }
  return changed;
}

// A cache of processed templates, indexed by element class.
const classTemplateMap = new Map();

// A Proxy that maps shadow element IDs to shadow elements.
// This will be return as the element's `this[ids]` property;
// see comments in that property below.
/** @type {any} */
const shadowIdProxyKey = Symbol("shadowIdProxy");

// A reference stored on the shadow element proxy target to get to the actual
// element. We use a Symbol here instead of a string name to avoid naming
// conflicts with the element's internal shadow element IDs.
const proxyElementKey = Symbol("proxyElement");

// A handler used for the shadow element ID proxy.
const shadowIdProxyHandler = {
  get(target, id) {
    // From this proxy, obtain a reference to the original component.
    const element = target[proxyElementKey];

    // Get a reference to the component's open or closed shadow root.
    const root = element[shadowRoot$1];

    // Look for a shadow element with the indicated ID.
    return root && typeof id === "string" ? root.getElementById(id) : null;
  },
};

/**
 * Stamps a template into a component's Shadow DOM when instantiated
 *
 * To use this mixin, define a `template` method that returns a string or HTML
 * `<template>` element:
 *
 *     import { createElement, replace, transmute } from 'elix/src/template.js';
 *
 *     class MyElement extends ShadowTemplateMixin(HTMLElement) {
 *       get [template]() {
 *         return templateFrom.html`Hello, <em>world</em>.`;
 *       }
 *     }
 *
 * When your component class is instantiated, a shadow root will be created on
 * the instance, and the contents of the template will be cloned into the
 * shadow root. If your component does not define a `template` method, this
 * mixin has no effect.
 *
 * This adds a member on the component called `this[ids]` that can be used to
 * reference shadow elements with IDs. E.g., if component's shadow contains an
 * element `<button id="foo">`, then this mixin will create a member
 * `this[ids].foo` that points to that button.
 *
 * @module ShadowTemplateMixin
 * @param {Constructor<HTMLElement>} Base
 */
function ShadowTemplateMixin(Base) {
  // The class prototype added by the mixin.
  class ShadowTemplate extends Base {
    /**
     * A convenient shortcut for looking up an element by ID in the component's
     * Shadow DOM subtree.
     *
     * Example: if component's template contains a shadow element `<button
     * id="foo">`, you can use the reference `this[ids].foo` to obtain
     * the corresponding button in the component instance's shadow tree. The
     * `ids` property is simply a shorthand for `getElementById`, so
     * `this[ids].foo` is the same as
     * `this[shadowRoot].getElementById('foo')`.
     *
     * @type {object} - a dictionary mapping shadow element IDs to elements
     */
    get [ids$1]() {
      if (!this[shadowIdProxyKey]) {
        // Construct a proxy that maps to getElementById.
        const target = {
          // Give the proxy a means of refering to this element via the target.
          [proxyElementKey]: this,
        };
        this[shadowIdProxyKey] = new Proxy(target, shadowIdProxyHandler);
      }
      return this[shadowIdProxyKey];
    }

    /*
     * If the component defines a template, a shadow root will be created on the
     * component instance, and the template stamped into it.
     */
    [render$1](/** @type {ChangedFlags} */ changed) {
      if (super[render$1]) {
        super[render$1](changed);
      }

      // We populate the shadow root if the component doesn't have a shadow;
      // i.e., the first time the component is rendered. For this check, we use
      // an internal reference we maintain for the shadow root; see below.
      if (!this[shadowRoot$1]) {
        // If this type of element defines a template, prepare it for use.
        const template = getTemplate(this);

        if (template) {
          // Stamp the template into a new shadow root.
          const root = this.attachShadow({
            delegatesFocus: this[delegatesFocus$1],
            mode: this[shadowRootMode$1],
          });
          const clone = document.importNode(template.content, true);
          root.append(clone);

          // After this call, we won't be able to rely on being able to access
          // the shadow root via `this.shadowRoot`, because the component may
          // have asked for a closed shadow root. We save a reference to the
          // shadow root now so that the component always has a consistent means
          // to reference its own shadow root.
          this[shadowRoot$1] = root;
        } else {
          // No template. Set shadow root to null (instead of undefined) so we
          // won't try to render shadow on next render.
          this[shadowRoot$1] = null;
        }
      }
    }

    /**
     * @type {ShadowRootMode}
     * @default "open"
     */
    get [shadowRootMode$1]() {
      return "open";
    }
  }

  return ShadowTemplate;
}

/**
 * Return the template for the element being instantiated.
 *
 * If this is the first time we're creating this type of element, or the
 * component has indicated that its template is dynamic (and should be retrieved
 * each time), ask the component class for the template and cache the result.
 * Otherwise, immediately return the cached template.
 *
 * @private
 * @param {HTMLElement} element
 * @returns {HTMLTemplateElement}
 */
function getTemplate(element) {
  let t = element[hasDynamicTemplate$1]
    ? undefined // Always retrieve template
    : classTemplateMap.get(element.constructor); // See if we've cached it
  if (t === undefined) {
    // Ask the component for its template.
    t = element[template$1];
    // A component using this mixin isn't required to supply a template --
    // if they don't, they simply won't end up with a shadow root.
    if (t) {
      // But if the component does supply a template, it needs to be an
      // HTMLTemplateElement instance.
      if (!(t instanceof HTMLTemplateElement)) {
        throw `Warning: the [template] property for ${element.constructor.name} must return an HTMLTemplateElement.`;
      }
    }
    if (!element[hasDynamicTemplate$1]) {
      // Store prepared template for next creation of same type of element.
      // If the component didn't define a template, store null so that we skip
      // the template retrieval next time.
      classTemplateMap.set(element.constructor, t || null);
    }
  }
  return t;
}

/**
 * General-purpose base for writing components in functional-reactive style
 *
 * This base class lets you create web components in a functional-reactive
 * programming (FRP) style. It simply bundles a small set of mixins:
 *
 *     const ReactiveElement =
 *       AttributeMarshallingMixin(
 *       ReactiveMixin(
 *       ShadowTemplateMixin(
 *         HTMLElement
 *       )))));
 *
 * `ReactiveElement` is provided as a convenience. You can achieve the same
 * result by applying the mixins yourself to `HTMLElement`.
 *
 * @inherits HTMLElement
 * @mixes AttributeMarshallingMixin
 * @mixes ReactiveMixin
 * @mixes ShadowTemplateMixin
 */
const ReactiveElement = AttributeMarshallingMixin(
  ReactiveMixin(ShadowTemplateMixin(HTMLElement))
);

/**
 * Defines a component's content as the flattened set of nodes assigned to a
 * slot.
 *
 * This mixin defines a component's `content` state member as the flattened
 * set of nodes assigned to a slot, typically the default slot.
 *
 * If the set of assigned nodes changes, the `content` state will be updated.
 * This helps a component satisfy the Gold Standard checklist item for
 * monitoring
 * [Content Changes](https://github.com/webcomponents/gold-standard/wiki/Content-Changes).
 *
 * By default, the mixin looks in the component's shadow subtree for a default
 * (unnamed) `slot` element. You can specify that a different slot should be
 * used by overriding the `internal.contentSlot` property.
 *
 * Most Elix [elements](elements) use `SlotContentMixin`, including
 * [ListBox](ListBox), [Modes](Modes), and [Tabs](Tabs).
 *
 * @module SlotContentMixin
 * @param {Constructor<ReactiveElement>} Base
 */
function SlotContentMixin(Base) {
  // The class prototype added by the mixin.
  class SlotContent extends Base {
    /**
     * See [contentSlot](internal#internal.contentSlot).
     */
    get [contentSlot]() {
      /** @type {HTMLSlotElement|null} */ const slot =
        this[shadowRoot] && this[shadowRoot].querySelector("slot:not([name])");
      if (!this[shadowRoot] || !slot) {
        /* eslint-disable no-console */
        console.warn(
          `SlotContentMixin expects ${this.constructor.name} to define a shadow tree that includes a default (unnamed) slot.\nSee https://elix.org/documentation/SlotContentMixin.`
        );
      }
      return slot;
    }

    // @ts-ignore
    get [defaultState]() {
      return Object.assign(super[defaultState] || {}, {
        content: null,
      });
    }

    [rendered](/** @type {ChangedFlags} */ changed) {
      if (super[rendered]) {
        super[rendered](changed);
      }

      if (this[firstRender]) {
        // Listen to changes on the default slot.
        const slot = this[contentSlot];
        if (slot) {
          slot.addEventListener("slotchange", async () => {
            // Although slotchange isn't generally a user-driven event, it's
            // impossible for us to know whether a change in slot content is going
            // to result in effects that the host of this element can predict.
            // To be on the safe side, we raise any change events that come up
            // during the processing of this event.
            this[raiseChangeEvents] = true;

            // The nodes assigned to the given component have changed.
            // Update the component's state to reflect the new content.
            const content = slot.assignedNodes({ flatten: true });
            Object.freeze(content);
            this[setState]({ content });

            await Promise.resolve();
            this[raiseChangeEvents] = false;
          });
        }
      }
    }
  }

  return SlotContent;
}

/**
 * Tracks whether the mouse is over the component as component state.
 *
 * By tracking the hover condition as component state, the component can perform
 * arbitrary operations when the mouse enters or leaves the component. This goes
 * beyond what's possible with the CSS `:hover` pseudo-class.
 *
 * @module HoverMixin
 * @param {Constructor<ReactiveElement>} Base
 */
function HoverMixin(Base) {
  // The class prototype added by the mixin.
  return class Hover extends Base {
    constructor() {
      // @ts-ignore
      super();
      this.addEventListener("mouseenter", async (event) => {
        this[raiseChangeEvents] = true;
        this[mouseenter](event);
        await Promise.resolve();
        this[raiseChangeEvents] = false;
      });
      this.addEventListener("mouseleave", async (event) => {
        this[raiseChangeEvents] = true;
        this[mouseleave](event);
        await Promise.resolve();
        this[raiseChangeEvents] = false;
      });
    }

    // @ts-ignore
    get [defaultState]() {
      return Object.assign(super[defaultState] || {}, {
        hover: false,
      });
    }

    /**
     * See [mouseenter](internal#internal.mouseenter).
     */
    [mouseenter](/** @type {MouseEvent} */ event) {
      if (super[mouseenter]) {
        super[mouseenter](event);
      }
      this[setState]({
        hover: true,
      });
    }

    /**
     * See [mouseenter](internal#internal.mouseenter).
     */
    [mouseleave](/** @type {MouseEvent} */ event) {
      if (super[mouseleave]) {
        super[mouseleave](event);
      }
      this[setState]({
        hover: false,
      });
    }
  };
}

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css$2 = "/***************************************\n * This file is automatically generated.\n * Please do not edit this file. Source file is common.css\n ***************************************/\n\n/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved\nLicensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */\n\n/* Document\n * --------------------- */\n\n/**\n * Normalize box sizing to border box for all browsers.\n */\n\n*,\n::before,\n::after {\n  box-sizing: border-box;\n}\n\n/* Grouping Content\n * --------------------- */\n\n/**\n * Add the correct display in IE.\n */\n\nmain {\n  display: block;\n}\n\n/**\n * 1. Remove the margin in all browsers.\n * 2. Remove the padding in all browsers.\n * 3. Normalize font sizes in all browsers.\n * 4. Normalize font weight in all browsers.\n */\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: 0.875rem; /* 3 */\n  font-weight: normal; /* 4 */\n  margin: 0; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Remove the margin in all browsers.\n */\n\np {\n  margin: 0;\n}\n\n/**\n * 1. Remove the margin in all browsers.\n * 2. Normalize border styles in all browsers.\n */\n\nhr {\n  margin: 0; /* 1 */\n  border: 0; /* 2 */\n  border-top-width: 1px; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: inherit; /* 2 */\n}\n\n/**\n * 1. Remove the margin in all browsers.\n * 2. Remove the padding in all browsers.\n * 3. Remove the list-style in all browsers, sub-system dependant.\n */\n\nol,\nul {\n  list-style: none; /* 3 */\n  padding: 0; /* 2 */\n  margin: 0; /* 1 */\n}\n\n/**\n * Remove the margin in all browsers.\n */\n\ndl,\ndt,\ndd {\n  margin: 0;\n}\n\n/* Form Controls\n * --------------------- */\n\n/**\n * Remove the margin in all browsers.\n */\n\nform {\n  margin: 0;\n}\n\n/**\n * 1. Correct font properties not being inherited.\n * 2. Remove the margin in Firefox and Safari.\n * 3. Fix correct color not being inherited.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font: inherit; /* 1 */\n  margin: 0; /* 2 */\n  color: inherit; /* 3 */\n}\n\n/**\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\n */\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/**\n * 1. Correct inability to style clickable `input` types in iOS.\n * 2. Normalizes cursor indicator on clickable elements.\n */\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button; /* 1 */\n  appearance: button; /* 1 */\n  cursor: pointer; /* 2 */\n}\n\n/**\n * Prevent option or optgroup to increase the width of a select.\n */\n\nselect {\n  max-width: 100%;\n}\n\n/**\n * Correct the outline style in Safari.\n */\n\ninput:focus,\nbutton:focus,\nselect:focus,\ntextarea:focus {\n  outline-offset: 0;\n}\n\n/**\n * Remove the inner border and padding in Firefox.\n */\n\n::-moz-focus-inner {\n  border-style: none;\n  padding: 0;\n}\n\n/**\n * 1. Correct the text wrapping in Edge 18- and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out 'fieldset' elements in all browsers.\n */\n\nlegend {\n  color: inherit; /* 2 */\n  display: table; /* 1 */\n  max-width: 100%; /* 1 */\n  white-space: normal; /* 1 */\n  padding: 0; /* 3 */\n}\n\n/**\n * Add the correct vertical alignment in Chrome and Firefox.\n */\n\nprogress {\n  vertical-align: baseline;\n}\n\n/**\n * Correct the cursor style of increment and decrement buttons in Safari.\n */\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/**\n * Remove the inner padding in Chrome and Safari on macOS.\n */\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to 'inherit' in Safari.\n */\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/**\n * Restore the focus styles unset by the previous rule.\n */\n\n:-moz-focusring {\n  outline: 1px dotted ButtonText;\n}\n\n/**\n * Remove the additional ':invalid' styles in Firefox.\n * See: https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737\n */\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/* Text-level semantics\n * --------------------- */\n\n/**\n * Normalizes cursor indicator on clickable elements.\n */\n\na {\n  cursor: pointer;\n}\n\n/**\n * Add the correct text decoration in Chrome, Edge, and Safari.\n */\n\nabbr[title] {\n  text-decoration: underline dotted;\n  cursor: help;\n}\n\n/**\n * Add the correct font weight in Edge and Safari.\n */\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/**\n * 1. Improve consistency of default fonts in all browsers. (https://github.com/sindresorhus/modern-normalize/issues/3)\n * 2. Correct the odd 'em' font sizing in all browsers.\n * 3. Remove the margin in all browsers.\n */\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n  margin: 0; /* 3 */\n}\n\n/**\n * Prevent overflow of the container in all browsers\n */\n\npre {\n  overflow: auto;\n  -ms-overflow-style: scrollbar;\n}\n\n/**\n * Add the correct font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent 'sub' and 'sup' elements from affecting the line height in all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/* Embedded content\n * --------------------- */\n\n/**\n * Change the alignment on media elements in all browsers.\n */\n\naudio,\ncanvas,\niframe,\nimg,\nsvg,\nvideo {\n  vertical-align: middle;\n}\n\n/**\n * Make images responsive by default.\n */\n\nimg,\n[type='image'] {\n  max-width: 100%;\n  height: auto;\n}\n\n/**\n * Remove the border on iframes in all browsers.\n */\n\niframe {\n  border-style: none;\n}\n\n/**\n * Change the fill color to match the text color in all browsers.\n */\n\nsvg:not([fill]) {\n  fill: currentColor;\n}\n\n/* Tabular data\n * --------------------- */\n\n/**\n * 1. Remove text indentation from table contents in Chrome and Safari. [Chromium Bug 999088](https://bugs.chromium.org/p/chromium/issues/detail?id=999088), [Webkit Bug 201297](https://bugs.webkit.org/show_bug.cgi?id=201297)\n * 2. Correct table border color inheritance in all Chrome and Safari. [Chromium Bug 935729](https://bugs.chromium.org/p/chromium/issues/detail?id=935729), [Webkit Bug 195016](https://bugs.webkit.org/show_bug.cgi?id=195016)\n * 3. Collapse border spacing in all browsers\n */\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/* Shadow host\n * --------------------- */\n\n/**\n * 1. Change the line height in all browsers\n * 2. Change the base font size in all browsers, inherit 100% from `html`\n * 3. Prevent adjustments of font size after orientation changes in IE on Windows Phone and in iOS\n * 4. Remove the grey highlight on links in iOS\n * 5. Font Stack:\n *   a. Safari for OS X and iOS (San Francisco)\n *   b. Chrome < 56 for OS X (San Francisco)\n *   c. Windows\n *   d. Android\n *   e. Web Fallback\n *   f. Emoji font stack [Mac, Windows, Linux]\n */\n\n:host {\n  line-height: 1.5;\n  font-size: 0.875rem;\n  -webkit-tap-highlight-color: transparent;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%;\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif,\n    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';\n}\n";
n(css$2,{});

var css$1 = "/***************************************\n * This file is automatically generated.\n * Please do not edit this file. Source file is button.css\n ***************************************/\n\n/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved\nLicensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */\n\n:host(:focus) {\n  outline: 0;\n}\n\n[part~='button'] {\n  display: var(--sds-c-button-display, inline-flex);\n  position: relative;\n  background: none;\n  background-color: var(--sds-c-button-color-background, var(--sds-s-button-color-background, transparent));\n  background-clip: border-box;\n  color: var(--sds-c-button-text-color, var(--sds-s-button-text-color, inherit));\n  padding-left: var(\n    --sds-c-button-spacing-inline-start,\n    var(--sds-c-button-spacing-inline, var(--sds-s-button-spacing-inline))\n  );\n  padding-right: var(\n    --sds-c-button-spacing-inline-end,\n    var(--sds-c-button-spacing-inline, var(--sds-s-button-spacing-inline))\n  );\n  padding-top: var(\n    --sds-c-button-spacing-block-start,\n    var(--sds-c-button-spacing-block, var(--sds-s-button-spacing-block))\n  );\n  padding-bottom: var(\n    --sds-c-button-spacing-block-start,\n    var(--sds-c-button-spacing-block, var(--sds-s-button-spacing-block))\n  );\n  border-width: var(--sds-c-button-sizing-border, var(--sds-s-button-sizing-border, 1px));\n  border-style: solid;\n  border-color: var(--sds-c-button-color-border, var(--sds-s-button-color-border, transparent));\n  border-radius: var(--sds-c-button-radius-border, var(--sds-c-button-radius-border, 0.25rem));\n  box-shadow: var(--sds-c-button-shadow, var(--sds-s-button-shadow));\n  width: var(--sds-c-button-width);\n  line-height: var(--sds-c-button-line-height);\n  white-space: normal;\n  user-select: none;\n  align-items: center;\n  text-decoration: var(--sds-c-button-text-decoration, none);\n  appearance: none;\n}\n\n[part~='button']:hover,\n[part~='button']:focus {\n  --sds-c-button-text-color: var(\n    --sds-c-button-text-color-hover,\n    var(--sds-s-button-text-color-hover, #0176d3)\n  );\n  --sds-c-button-color-background: var(\n    --sds-c-button-color-background-hover,\n    var(--sds-s-button-color-background-hover)\n  );\n  --sds-c-button-color-border: var(--sds-c-button-color-border-hover, var(--sds-s-button-color-border-hover));\n\n  cursor: pointer;\n}\n\n[part~='button']:focus {\n  --sds-c-button-color-background: var(\n    --sds-c-button-color-background-focus,\n    var(--sds-s-button-color-background-focus)\n  );\n  --sds-c-button-color-border: var(\n    --sds-c-button-color-border-focus,\n    var(--sds-s-button-color-border-focus, #0176d3)\n  );\n  --sds-c-button-shadow: var(--sds-c-button-shadow-focus, var(--sds-s-button-shadow-focus, #0176d3 0 0 3px));\n\n  outline: 0;\n}\n\n[part~='button']:active {\n  --sds-c-button-text-color: var(\n    --sds-c-button-text-color-active,\n    var(--sds-s-button-text-color-active, currentColor)\n  );\n  --sds-c-button-color-background: var(\n    --sds-c-button-color-background-active,\n    var(--sds-s-button-color-background-active)\n  );\n  --sds-c-button-color-border: var(\n    --sds-c-button-color-border-active,\n    var(--sds-s-button-color-border-active, #0176d3)\n  );\n}\n\n[part~='button']:disabled {\n  --sds-c-button-text-color: var(--sds-c-button-text-color-disabled, #939393);\n  --sds-c-button-color-background: var(--sds-c-button-color-background-disabled);\n  --sds-c-button-color-border: var(--sds-c-button-color-border-disabled);\n}\n\n[part~='button']:disabled * {\n  pointer-events: none;\n}\n";
n(css$1,{});

var html = "\n<button part=\"button\">\n  <slot name=\"start\" part=\"start\"></slot>\n  <slot></slot>\n  <slot name=\"end\" part=\"end\"></slot>\n</button>\n";

/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */

class SdsButton extends HoverMixin(ReactiveElement) {
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      ariaLabel: null,
      ariaControls: null,
      ariaExpanded: null,
      ariaHaspopup: null,
      ariaLive: null,
      ariaPressed: false,
      variant: null,
      role: null,
      id: '',
      name: '',
      value: null,
      type: null,
      disabled: false,
    });
  }

  /**
   * Change the appearance of the button.
   */
  get variant() {
    return this[state].variant;
  }

  set variant(variant) {
    this[setState]({
      variant: variant,
    });
  }

  /**
   * Indicates whether the button is disabled and cannot be interacted with.
   */
  get disabled() {
    return this[state].disabled;
  }

  set disabled(disabled) {
    this[setState]({
      disabled: disabled,
    });
  }

  /**
   * Indicates the current "pressed" state of toggle buttons.
   */
  get ariaPressed() {
    return this[state].ariaPressed;
  }

  set ariaPressed(ariaPressed) {
    this[setState]({
      ariaPressed: ariaPressed,
    });
  }

  /**
   * Defines a string value that labels the current element.
   * Should only be used if text describing the button is not visible in the DOM.
   */
  get ariaLabel() {
    return this[state].ariaLabel;
  }

  set ariaLabel(ariaLabel) {
    this[setState]({
      ariaLabel: ariaLabel,
    });
  }

  /**
   * Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region.
   */
  get ariaLive() {
    return this[state].ariaLive;
  }

  set ariaLive(ariaLive) {
    this[setState]({
      ariaLive: ariaLive,
    });
  }

  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  get ariaControls() {
    return this[state].ariaControls;
  }

  set ariaControls(ariaControls) {
    this[setState]({
      ariaControls: ariaControls,
    });
  }

  /**
   * Indicates whether a grouping element owned or controlled by this element is expanded or collapsed.
   */
  get ariaExpanded() {
    return this[state].ariaExpanded;
  }

  set ariaExpanded(ariaExpanded) {
    this[setState]({
      ariaExpanded: ariaExpanded,
    });
  }

  /**
   * Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element.
   */
  get ariaHaspopup() {
    return this[state].ariaHaspopup;
  }

  set ariaHaspopup(ariaHaspopup) {
    this[setState]({
      ariaHaspopup: ariaHaspopup,
    });
  }

  /**
   * Unique identifier of the button.
   */
  get id() {
    return this[state].id;
  }

  set id(id) {
    this[setState]({
      id: id,
    });
  }

  /**
   * Name of the element to use for form submission and in the `form.elements` API
   */
  get name() {
    return this[state].name;
  }

  set name(name) {
    this[setState]({
      name: name,
    });
  }

  /**
   * Value to be used for form submission.
   */
  get value() {
    return this[state].value;
  }

  set value(value) {
    this[setState]({
      value: value,
    });
  }

  /**
   * Defines ARIA semantics.
   */
  get role() {
    return this[state].role;
  }

  set role(role) {
    this[setState]({
      role: role,
    });
  }

  /**
   * Respond to a simulated click.
   */
  [tap]() {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(clickEvent);
  }

  [render](changed) {
    super[render](changed);

    const button = this.shadowRoot.querySelector('[part="button"]');

    if (changed.disabled) {
      const { disabled } = this[state];
      if (disabled) {
        delegateAttribute$1(this, button, 'disabled', disabled);
      }
    }

    if (changed.id) {
      const { id } = this[state];
      reflectAttribute$1(button, 'id', id);
    }

    if (changed.ariaLabel) {
      const { ariaLabel } = this[state];
      if (ariaLabel) {
        delegateAttribute$1(this, button, 'aria-label', ariaLabel);
      }
    }

    if (changed.ariaPressed) {
      const { ariaPressed } = this[state];
      if (ariaPressed) {
        delegateAttribute$1(this, button, 'aria-pressed', ariaPressed);
      }
    }

    if (changed.ariaControls) {
      const { ariaControls } = this[state];
      if (ariaControls) {
        delegateAttribute$1(this, button, 'aria-controls', ariaControls);
      }
    }

    if (changed.ariaExpanded) {
      const { ariaExpanded } = this[state];
      if (ariaExpanded) {
        delegateAttribute$1(this, button, 'aria-expanded', ariaExpanded);
      }
    }

    if (changed.ariaLive) {
      const { ariaLive } = this[state];
      if (ariaLive) {
        delegateAttribute$1(this, button, 'aria-live', ariaLive);
      }
    }

    if (changed.ariaHaspopup) {
      const { ariaHaspopup } = this[state];
      if (ariaHaspopup) {
        delegateAttribute$1(this, button, 'aria-haspopup', ariaHaspopup);
      }
    }

    if (changed.value) {
      const { value } = this[state];
      if (value) {
        delegateAttribute$1(this, button, 'value', value);
      }
    }

    if (changed.name) {
      const { name } = this[state];
      if (name) {
        delegateAttribute$1(this, button, 'name', name);
      }
    }

    if (changed.role) {
      const { role } = this[state];
      if (role) {
        delegateAttribute$1(this, button, 'role', role);
      }
    }
  }

  get [template]() {
    const result = templateFrom.html`
      <style>
        ${css$2}
        ${css$1}
      </style>
      ${html}
    `;

    return result;
  }
}

function reflectAttribute$1(element, name, value) {
  if (value || typeof value === 'boolean') {
    element.setAttribute(name, value);
  } else {
    element.removeAttribute(name);
  }
}

function delegateAttribute$1(from, to, name, value) {
  if (value || typeof value === 'boolean') {
    to.setAttribute(name, value);
    from.removeAttribute(name);
  } else {
    to.removeAttribute(name);
  }
}

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

const reflectAttribute = (element, name, value) => {
  if (value) {
    element.setAttribute(name, typeof value === 'boolean' ? '' : value);
  } else {
    element.removeAttribute(name);
  }
};

const delegateAttribute = (from, to, name, value) => {
  if (value) {
    to.setAttribute(name, typeof value === 'boolean' ? '' : value);
    from.removeAttribute(name);
  } else {
    to.removeAttribute(name);
  }
};

const replaceDefaultSlot = (root, content) => {
  const slot = root.querySelector(`slot:not([name])`);
  if (slot) {
    slot.replaceWith(content);
  }
};

const removeSlot = (root, slotName) => {
  const slot = root.querySelector(`slot[name="${slotName}"]`);
  if (slot) {
    slot.remove();
  }
};

/**
 * Dispatches a custom event that namespaces the event name to the
 * component's namespace.
 * @param {object} element
 * @param {string} name
 * @param {object} options
 */
const dispatchCustomEvent = (element, name, options) => {
  const namespace = element.tagName.split('-')[0].toLowerCase();
  const namespaceName = namespace + '-' + name;
  const customEvent = new CustomEvent(namespaceName, options);
  element.dispatchEvent(customEvent);
  return customEvent;
};

var helpers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  reflectAttribute: reflectAttribute,
  delegateAttribute: delegateAttribute,
  replaceDefaultSlot: replaceDefaultSlot,
  removeSlot: removeSlot,
  dispatchCustomEvent: dispatchCustomEvent
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(helpers);

/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */

var utils = require$$0;

/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */

var sdsUtils = utils;

var css = "/***************************************\n * This file is automatically generated.\n * Please do not edit this file. Source file is button.css\n ***************************************/\n\n:host {\n  font-size: var(--c360-g-font-size-3);\n  font-family: var(--c360-g-font-family-sans);\n  font-weight: var(--c360-g-font-weight-bold);\n  --sds-c-button-spacing-block: var(--c360-g-spacing-2);\n  --sds-c-button-spacing-inline: var(--c360-g-spacing-5);\n  --sds-c-button-radius-border: var(--c360-g-radius-border-2);\n  --sds-c-button-text-color-disabled: var(--c360-g-color-brand-inverse-contrast-4);\n  --sds-c-button-color-background-disabled: var(--c360-g-color-palette-neutral-65);\n  --sds-c-button-color-border-disabled: var(--c360-g-color-palette-neutral-65);\n  --sds-c-button-sizing-border: var(--c360-g-radius-border-1);\n  --sds-c-icon-sizing-width: 1rem;\n  --sds-c-icon-sizing-border: 0;\n\n  /* ---- global kinetics values ---- */\n\n  /* for some reason `:root{}` doesn't work in this file */\n\n  /*\n    Speed Multiplier\n  */\n  --c360-g-kx-speed-multiplier-value: 1;\n\n  /*\n    Reduced Motion Multipliers\n  */\n  --c360-g-kx-reduced-motion-multiplier-os: 1;\n  --c360-g-kx-reduced-motion-multiplier-simulation: 1;\n  --c360-g-kx-reduced-motion-multiplier: calc(\n    var(--c360-g-kx-reduced-motion-multiplier-os) * var(--c360-g-kx-reduced-motion-multiplier-simulation)\n  );\n\n  /*\n    Duration Tokens\n  */\n\n  /* // These initial values are used for the reset functionality in JS.\n  /* // The user cannot manipulate these values using the global config panel. */\n  --c360-g-kx-duration-x-long-init: 600ms; /* // was 1200 */\n  --c360-g-kx-duration-long-init: 400ms; /* // was 600 */\n  --c360-g-kx-duration-normal-init: 250ms; /* // was 300 */\n  --c360-g-kx-duration-short-init: 150ms;\n  --c360-g-kx-duration-x-short-init: 75ms;\n\n  /* // These values are used to calculate the final, multiplier-modified values for durations. */\n\n  /* // The user can manipulate these values using the global config panel. */\n  --c360-g-kx-duration-x-long-base: var(--c360-g-kx-duration-x-long-init);\n  --c360-g-kx-duration-long-base: var(--c360-g-kx-duration-long-init);\n  --c360-g-kx-duration-normal-base: var(--c360-g-kx-duration-normal-init);\n  --c360-g-kx-duration-short-base: var(--c360-g-kx-duration-short-init);\n  --c360-g-kx-duration-x-short-base: var(--c360-g-kx-duration-x-short-init);\n\n  /* // These are the multiplier-modified values for durations. */\n\n  /* // Use these (e.g. --c360-g-kx-duration-normal when you want to access a “final” duration value. */\n  --c360-g-kx-duration-x-long: calc(\n    var(--c360-g-kx-reduced-motion-multiplier) * var(--c360-g-kx-duration-x-long-base) /\n      var(--c360-g-kx-speed-multiplier-value)\n  );\n  --c360-g-kx-duration-long: calc(\n    var(--c360-g-kx-reduced-motion-multiplier) * var(--c360-g-kx-duration-long-base) /\n      var(--c360-g-kx-speed-multiplier-value)\n  );\n  --c360-g-kx-duration-normal: calc(\n    var(--c360-g-kx-reduced-motion-multiplier) * var(--c360-g-kx-duration-normal-base) /\n      var(--c360-g-kx-speed-multiplier-value)\n  );\n  --c360-g-kx-duration-short: calc(\n    var(--c360-g-kx-reduced-motion-multiplier) * var(--c360-g-kx-duration-short-base) /\n      var(--c360-g-kx-speed-multiplier-value)\n  );\n  --c360-g-kx-duration-x-short: calc(\n    var(--c360-g-kx-reduced-motion-multiplier) * var(--c360-g-kx-duration-x-short-base) /\n      var(--c360-g-kx-speed-multiplier-value)\n  );\n\n  /*\n    Easing Tokens\n  */\n\n  /* // These initial values are used for the reset functionality in JS. */\n\n  /* // The user cannot manipulate these values using the global config panel. */\n  --c360-g-kx-ease-none-init: cubic-bezier(0, 0, 1, 1);\n  --c360-g-kx-ease-in-init: cubic-bezier(0.3, 0, 1, 0.3); /* // was (0.5, 0, 1, 0.5) */\n  --c360-g-kx-ease-out-init: cubic-bezier(0, 0.3, 0.15, 1); /* // was (0, 0.5, 0.5, 1) */\n  --c360-g-kx-ease-in-out-init: cubic-bezier(0.3, 0, 0.15, 1); /* // was (0.5, 0, 0.5, 1) */\n  --c360-g-kx-ease-under-init: cubic-bezier(0.7, 0, 0.7, -0.75); /* // was (0.5, -0.5, 0.25, 1) */\n  --c360-g-kx-ease-over-init: cubic-bezier(0.3, 1.75, 0.3, 1); /* // was (0.25, 0, 0.5, 1.5) */\n\n  /* // These are the multiplier-modified values for durations. */\n\n  /* // Use these (e.g. --c360-g-kx-duration-normal when you want to access a “final” duration value. */\n  --c360-g-kx-ease-none: var(--c360-g-kx-ease-none-init);\n  --c360-g-kx-ease-in: var(--c360-g-kx-ease-in-init);\n  --c360-g-kx-ease-out: var(--c360-g-kx-ease-out-init);\n  --c360-g-kx-ease-in-out: var(--c360-g-kx-ease-in-out-init);\n  --c360-g-kx-ease-under: var(--c360-g-kx-ease-under-init);\n  --c360-g-kx-ease-over: var(--c360-g-kx-ease-over-init);\n}\n\n:host([variant='primary']) {\n  --sds-c-button-color-background: var(--c360-g-color-palette-blue-50);\n  --sds-c-button-color-border: var(--c360-g-color-palette-blue-50);\n  --sds-c-button-text-color: var(--c360-g-color-brand-inverse-contrast-4);\n  --sds-c-button-color-background-hover: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-color-border-hover: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-text-color-hover: var(--c360-g-color-brand-inverse-contrast-4);\n  --sds-c-button-color-background-active: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-color-border-active: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-text-color-active: var(--c360-g-color-brand-inverse-contrast-4);\n  --sds-c-button-color-background-focus: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-color-border-focus: var(--c360-g-color-palette-cloud-blue-20);\n}\n\n:host [part~='button']:focus {\n  outline: 5px solid var(--c360-g-color-brand-base-contrast-1);\n}\n\n:host([variant='secondary']) {\n  --sds-c-button-color-background: transparent;\n  --sds-c-button-color-border: var(--c360-g-color-palette-blue-50);\n  --sds-c-button-text-color: var(--c360-g-color-palette-blue-50);\n  --sds-c-button-color-background-hover: var(--c360-g-color-palette-cloud-blue-95);\n  --sds-c-button-color-border-hover: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-text-color-hover: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-color-background-active: var(--c360-g-color-palette-cloud-blue-95);\n  --sds-c-button-color-border-active: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-text-color-active: var(--c360-g-color-palette-cloud-blue-20);\n  --sds-c-button-color-background-focus: var(--c360-g-color-palette-cloud-blue-95);\n  --sds-c-button-color-border-focus: var(--c360-g-color-palette-cloud-blue-20);\n}\n\n:host([variant='tertiary']) {\n  --sds-c-button-text-color: var(--c360-g-color-palette-blue-50);\n  --sds-c-button-color-background-hover: var(--c360-g-color-palette-cloud-blue-95);\n  --sds-c-button-color-border-hover: transparent;\n  --sds-c-button-text-color-hover: var(--c360-g-color-palette-blue-30);\n  --sds-c-button-color-background-active: var(--c360-g-color-palette-cloud-blue-95);\n  --sds-c-button-color-border-active: transparent;\n  --sds-c-button-text-color-active: var(--c360-g-color-palette-blue-30);\n  --sds-c-button-color-background-focus: var(--c360-g-color-palette-cloud-blue-95);\n  --sds-c-button-color-border-focus: transparent;\n}\n\n:host([size='hero']) {\n  font-size: var(--c360-g-font-size-3);\n  --sds-c-button-spacing-block: var(--c360-g-spacing-3);\n  --sds-c-button-spacing-inline: var(--c360-g-spacing-6);\n}\n\n:host([size='small']) {\n  font-size: var(--c360-g-font-size-2);\n  --sds-c-button-spacing-block: var(--c360-g-spacing-1);\n  --sds-c-button-spacing-inline: var(--c360-g-spacing-3);\n  --sds-c-icon-sizing-width: 0.75rem;\n  --sds-c-button-line-height: 1.15;\n}\n\n:host([size='small']) [icon-only] {\n  --sds-c-button-spacing-block: var(--c360-g-spacing-2);\n  --sds-c-button-spacing-inline: var(--c360-g-spacing-2);\n}\n\n:host([size='default']) [icon-only] {\n  --sds-c-button-spacing-block: var(--c360-g-spacing-3);\n  --sds-c-button-spacing-inline: var(--c360-g-spacing-3);\n}\n\n:host([size='hero']) [icon-only] {\n  --sds-c-button-spacing-block: var(--c360-g-spacing-4);\n  --sds-c-button-spacing-inline: var(--c360-g-spacing-4);\n}\n\n[part~='button'] {\n  max-width: 100%;\n}\n\n::slotted([slot='end']) {\n  margin-inline-start: var(--c360-g-spacing-2);\n}\n\n[icon-only] ::slotted([slot='end']) {\n  margin-inline-start: 0;\n}\n\n::slotted([slot='start']) {\n  margin-inline-end: var(--c360-g-spacing-2);\n}\n\n[icon-only] ::slotted([slot='start']) {\n  margin-inline-end: 0;\n}\n\n/* ---- Button Kinetics ---- */\n:host([kx-type='ripple']) {\n  /* Kinetics vars */\n  --c360-c-button-kx-ripple-size: 20px;\n  --c360-c-button-kx-pointer-position: 50%;\n}\n\n:host([kx-type='ripple']) [part='button'] {\n  transition: 0.08s all ease-out;\n}\n\n:host([kx-type='ripple']) [part='button']:active {\n  transform: scale(0.95);\n}\n\n:host([variant='tertiary'][kx-type='ripple']) [part='button']::before,\n:host([kx-type='ripple']) [part='button'] [part='kx-ripple'] {\n  position: absolute;\n  border-radius: var(--sds-c-button-radius-border);\n  top: calc(-1 * var(--sds-c-button-sizing-border));\n  left: calc(-1 * var(--sds-c-button-sizing-border));\n  width: calc(100% + var(--sds-c-button-sizing-border) * 2);\n  height: calc(100% + var(--sds-c-button-sizing-border) * 2);\n}\n\n:host([kx-type='ripple']) [part='kx-ripple']::after {\n  content: '';\n  position: absolute;\n  width: var(--c360-c-button-kx-ripple-size);\n  height: var(--c360-c-button-kx-ripple-size);\n  top: 0;\n  left: 0;\n  border-radius: 50%;\n  opacity: 0;\n  background-color: var(--c360-g-color-brand-inverse-contrast-4);\n}\n\n:host([kx-type='ripple']) [part='kx-ripple'] {\n  overflow: hidden;\n}\n\n:host([variant='secondary'][kx-type='ripple']) [part='kx-ripple']::after,\n:host([variant='tertiary'][kx-type='ripple']) [part='kx-ripple']::after {\n  background-color: var(--c360-g-color-palette-cloud-blue-50);\n}\n\n:host([variant='tertiary'][kx-type='ripple']) [part='button']::before {\n  content: '';\n  z-index: -1;\n  transform: scale(0.9);\n  transition: 0.1s transform ease-out;\n}\n\n:host([variant='tertiary'][kx-type='ripple']) [part='button']:hover::before {\n  background-color: var(--c360-g-color-brand-base-3);\n  transform: scale(1);\n}\n\n/*\n   In order to hide the border when the ripple is in animating,\n   will need to change the border color to the same color as the\n   focus outline, Reduce the border stroke with by half, and\n   position the border outside the button bounding box.\n*/\n\n:host([kx-type='ripple']) [part='button'].sds-kx-is-animating-from-click [part='kx-ripple']::after {\n  top: calc(\n    var(--c360-c-button-kx-pointer-position-y, var(--c360-c-button-kx-pointer-position)) -\n      var(--c360-c-button-kx-ripple-size, var(--c360-c-button-kx-ripple-size)) / 2\n  );\n  left: calc(\n    var(--c360-c-button-kx-pointer-position-x, var(--c360-c-button-kx-pointer-position)) -\n      var(--c360-c-button-kx-ripple-size, var(--c360-c-button-kx-ripple-size)) / 2\n  );\n  animation: c360-kx-button_ripple var(--c360-g-kx-duration-normal) cubic-bezier(0.35, 0.01, 0.62, 0.99); /* custom easing for ripple */\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :host([kx-type='ripple']) [part='button'].sds-kx-is-animating-from-click [part='kx-ripple']::after {\n    animation: none;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  [kx-scope^='button-'][kx-type='ripple']:focus {\n    transition: none;\n  }\n}\n\n@media (hover: none) {\n  :host([kx-type='ripple']) [part='button']:active {\n    transform: scale(0.97);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :host([kx-type='ripple']) [part='button']:active {\n    transform: none;\n  }\n}\n\n@media (hover: hover) and (pointer: fine) {\n  :host([kx-type='ripple']) [part='button']:hover {\n    transform: scale(1);\n  }\n\n  :host([kx-type='ripple']) [part='button']:active {\n    transform: scale(0.97);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :host([kx-type='ripple']) [part='button']:hover {\n    transform: none;\n  }\n}\n\n@keyframes c360-kx-button_ripple {\n  0% {\n    opacity: 0.35;\n    transform: scale(1);\n  }\n\n  100% {\n    opacity: 0;\n    transform: scale(7);\n  }\n}\n";
n(css,{});

class C360Button extends SlotContentMixin(SdsButton) {
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
      sdsUtils.reflectAttribute(this, 'size', size);
    }

    if (changed.variant) {
      const { variant } = this[state];
      sdsUtils.reflectAttribute(this, 'variant', variant);
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
      sdsUtils.reflectAttribute(this, 'kx-type', kinetics ? kxType : false);
    }

    if (changed.size) {
      const { size } = this[state];
      sdsUtils.reflectAttribute(this, 'size', size);
    }

    if (changed.variant) {
      const { variant } = this[state];
      sdsUtils.reflectAttribute(this, 'variant', variant);
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

export { C360Button as default };
