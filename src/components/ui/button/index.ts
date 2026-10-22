import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../block';

import './index.scss';

const renderContent = Handlebars.compile(template);

export interface ButtonProps {
  enabled?: boolean;
  disabled?: boolean;
  text: string;
  className?: string;
}

export default class ButtonBlock extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props);
  }

  protected render(): string {
    const { enabled, disabled, text, className } = this.getProps();
    return renderContent({
      disabled: disabled ?? enabled === false,
      text,
      className,
    });
  }
}
