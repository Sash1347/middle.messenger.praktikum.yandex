import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Input, { type InputProps } from '../ui/input';
import Button, { type ButtonProps } from '../ui/button';
import './index.scss';

const renderContent = Handlebars.compile(template);

export interface FormProps {
  fields: InputProps[];
  button?: ButtonProps;
}

export default function Form({ fields, button }: FormProps): string {
  return renderContent({
    inputs: fields.map((field) => Input(field)),
    button: button ? Button(button) : '',
  });
}
