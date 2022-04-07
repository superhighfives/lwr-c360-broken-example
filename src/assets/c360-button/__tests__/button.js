/* eslint-env jest */
import C360Button from '../button';
import * as utils from '../../../../../.jest/utils';
// Register custom element for jest wrapper
customElements.define('c360-button', C360Button);

describe('c360-button', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });
  it('named part exists on button element', async () => {
    const element = utils.renderIntoBody(`<c360-button>Test</c360-button>`);
    const button = element.shadowRoot.querySelector('button');
    expect(button).toHaveAttribute('part', 'button');
  });
  it('size attribute exists on c360 element', async () => {
    const element = utils.renderIntoBody(`<c360-button size="hero">Test</c360-button>`);
    expect(element).toHaveAttribute('size', 'hero');
  });
  it('variant attribute exists on c360 element', async () => {
    const element = utils.renderIntoBody(`<c360-button variant="primary">Test</c360-button>`);
    expect(element).toHaveAttribute('variant', 'primary');
  });
  it('disabled attribute exists on button element', async () => {
    const element = utils.renderIntoBody(`<c360-button disabled>Test</c360-button>`);
    const button = element.shadowRoot.querySelector('button');
    expect(element).not.toHaveAttribute('disabled', 'true');
    expect(button).toHaveAttribute('disabled', 'true');
  });
  it('default attributes exists on c360 element', async () => {
    const element = utils.renderIntoBody(`<c360-button>Test</c360-button>`);
    const button = element.shadowRoot.querySelector('button');
    expect(button).not.toHaveAttribute('disabled', 'true');
    expect(element).toHaveAttribute('variant', 'primary');
    expect(element).toHaveAttribute('size', 'default');
  });
  it('is accessible', async () => {
    const element = utils.renderIntoBody(`<c360-button>Test</c360-button>`);
    return Promise.resolve().then(() => {
      expect(element).toBeAccessible();
    });
  });
});
