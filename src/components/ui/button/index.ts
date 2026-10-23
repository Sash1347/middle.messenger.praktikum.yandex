import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../Block';

import './index.scss';

const renderContent = Handlebars.compile(template);

export interface ButtonProps {
  enabled?: boolean;
  disabled?: boolean;
  text: string;
  className?: string;
}

export default class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props, renderContent);
  }

  protected getTemplateData(): object {
    const { enabled, disabled, text, className } = this.props;
    return {
      disabled: disabled ?? enabled === false,
      text,
      className,
    };
  }
}
