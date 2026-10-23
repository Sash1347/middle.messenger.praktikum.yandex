import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Input, { type InputProps } from '../ui/input';
import Button, { type ButtonProps } from '../ui/button';
import Block from '../Block';
import './index.scss';

const renderContent = Handlebars.compile(template);

export interface FormProps {
  fields: InputProps[];
  button?: ButtonProps;
}

export default class Form extends Block<FormProps> {
  constructor(props: FormProps) {
    super(props, renderContent);
  }

  protected getTemplateData(): object {
    const { fields, button } = this.props;
    return {
      inputs: fields.map((field) => new Input(field).render()),
      button: button ? new Button(button).render() : '',
    };
  }
}
