import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../block';

import './index.scss';

const renderContent = Handlebars.compile(template);

export interface InputProps {
  type: string;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  errorText?: string;
}

export default class InputBlock extends Block<InputProps> {
  constructor(props: InputProps) {
    super(props);
  }

  protected render(): string {
    return renderContent(this.getProps());
  }
}
