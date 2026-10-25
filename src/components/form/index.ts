import template from './index.hbs?raw';
import { type InputProps } from '../ui/input';
import { type ButtonProps } from '../ui/button';
import '../ui/input';
import '../ui/button';
import Block, { type BlockOwnProps } from '../Block';
import { registerComponent } from '../ComponentRegistry';
import { formData, validateInput, type FormValues } from './helper';
import './index.scss';

export interface FormProps extends BlockOwnProps {
  fields: InputProps[];
  button?: ButtonProps;
  onSubmit: (data: FormValues) => void;
}

export default class Form extends Block<FormProps> {
  static componentName = 'Form';

  protected template = template;

  constructor(props: FormProps) {
    super(props);
    this.events = {
      focusout: (event) => {
        const form = event.currentTarget;
        const input = event.target;
        if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) return;
        validateInput(form, input);
        if (input.name === 'new_password') {
          const confirmation = form.querySelector<HTMLInputElement>('[name="confirm_password"]');
          if (confirmation?.value) validateInput(form, confirmation);
        }
      },
      submit: (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!(form instanceof HTMLFormElement)) throw new Error('Form event target must be a form');
        const results = Array.from(form.querySelectorAll('input'), (input) => validateInput(form, input));
        if (results.every(Boolean)) this.props.onSubmit(formData(form));
      },
    };
  }

}

registerComponent(Form);
