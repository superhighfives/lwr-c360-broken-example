import C360Button from 'c360/button'

function registerComponents() {
  if (!customElements.get('c360-button')) {
    customElements.define('c360-button', C360Button);
  }
}

registerComponents()
