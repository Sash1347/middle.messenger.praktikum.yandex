import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Block from '../block';
import Input, { type InputProps } from '../ui/input';
import Button from '../ui/button';
import type { ButtonProps } from '../ui/button';

import './index.scss';

const renderContent = Handlebars.compile(template);

export interface FormProps {
  fields: InputProps[];
  button?: ButtonProps;
  setup: (form: HTMLFormElement) => () => void;
}

export default class FormBlock extends Block<FormProps> {
  private cleanup: (() => void) | undefined;

  constructor(props: FormProps) {
    super(props);
  }

  protected componentDidMount(): void {
    const form = this.getHost().querySelector('form');
    if (!form) throw new Error('Form template must contain a form element');
    this.cleanup = this.getProps().setup(form);
  }

  protected componentWillUpdate(): void {
    this.cleanup?.();
  }

  protected componentDidUpdate(): void {
    if (this.cleanup) this.componentDidMount();
  }

  protected componentWillUnmount(): void {
    this.cleanup?.();
    this.cleanup = undefined;
  }

  protected render(): string {
    const { fields, button } = this.getProps();

    return renderContent({
      inputs: fields.map((field) => new Input(field).getContent()),
      button: button ? new Button(button).getContent() : '',
    });
  }
}
