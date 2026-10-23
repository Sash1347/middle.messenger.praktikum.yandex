import template from './index.hbs?raw';
import Block from '../../Block';

import './index.scss';

export interface ButtonProps {
  enabled?: boolean;
  disabled?: boolean;
  text: string;
  className?: string;
}

interface ButtonTemplateProps {
  disabled: boolean;
  text: string;
  className?: string;
}

export default class Button extends Block<ButtonTemplateProps> {
  protected template = template;

  constructor({ enabled, disabled, text, className }: ButtonProps) {
    super({
      disabled: disabled ?? enabled === false,
      text,
      className,
    });
  }
}
