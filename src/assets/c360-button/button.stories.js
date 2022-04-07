import Button from './button';
import ButtonDocs from './button.mdx';

export default {
  title: 'C360 Subsystem/Components/Button',
  component: Button,
  parameters: {
    docs: {
      page: ButtonDocs,
    },
  },
  argTypes: {
    defaultSlot: {
      name: 'default',
      control: {
        type: 'text',
      },
      defaultValue: 'Button',
      table: {
        category: 'slots',
      },
    },
    variant: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'tertiary'],
      },
      defaultValue: 'primary',
      table: {
        category: 'attributes',
      },
    },
    size: {
      control: { type: 'select', options: ['hero', 'default', 'small'] },
      defaultValue: 'default',
      table: {
        category: 'attributes',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'attributes',
      },
    },
    kinetics: {
      control: {
        type: 'boolean',
      },
      defaultValue: true,
      table: {
        category: 'attributes',
      },
    },
  },
};

const TextTemplate = (args) => `
  <c360-button variant=${args.variant} size=${args.size} ${args.disabled ? 'disabled' : ''} ${
  !args.kinetics ? 'kx-disabled' : ''
}>
      ${args.defaultSlot}
    </c360-button>
`;
export const Base = TextTemplate.bind({});

const TextAndIconTemplate = (args) => `
  <c360-button variant=${args.variant} size=${args.size} ${args.disabled ? 'disabled' : ''} ${
  !args.kinetics ? 'kx-disabled' : ''
}>
      ${args.defaultSlot}
      <c360-icon symbol="threedots" slot="end"></c360-icon>
    </c360-button>
`;
export const TextAndIcon = TextAndIconTemplate.bind({});

const IconAndTextTemplate = (args) => `
  <c360-button variant=${args.variant} size=${args.size} ${args.disabled ? 'disabled' : ''} ${
  !args.kinetics ? 'kx-disabled' : ''
}>
      ${args.defaultSlot}
      <c360-icon symbol="threedots" slot="start"></c360-icon>
    </c360-button>
`;
export const IconAndText = IconAndTextTemplate.bind({});

const IconTemplate = (args) => `
  <c360-button variant=${args.variant} size=${args.size} ${args.disabled ? 'disabled' : ''} ${
  !args.kinetics ? 'kx-disabled' : ''
}>
      <c360-icon slot="end" symbol="adduser"></c360-icon>
    </c360-button>
`;
export const Icon = IconTemplate.bind({});
