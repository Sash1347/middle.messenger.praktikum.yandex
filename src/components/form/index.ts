import template from './index.hbs?raw';
import Input, { type InputProps } from '../ui/input';
import Button, { type ButtonProps } from '../ui/button';
import Block from '../Block';
import './index.scss';

export interface FormProps {
  fields: InputProps[];
  button?: ButtonProps;
}

interface FormTemplateProps {
  inputs: string[];
  button: string;
}

export default class Form extends Block<FormTemplateProps> {
  protected template = template;

  constructor({ fields, button }: FormProps) {
    super({
      inputs: fields.map((field) => new Input(field).element()?.outerHTML ?? ''),
      button: button ? new Button(button).element()?.outerHTML ?? '' : '',
    });
  }
}
