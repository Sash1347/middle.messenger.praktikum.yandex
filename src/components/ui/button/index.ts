import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../Block';
import { registerComponent } from '../../ComponentRegistry';

import './index.scss';

export interface ButtonProps {
  enabled?: boolean;
  disabled?: boolean;
  text: string;
  className?: string;
}

interface ButtonTemplateProps extends BlockOwnProps {
  disabled: boolean;
  text: string;
  className?: string;
}

export default class Button extends Block<ButtonTemplateProps> {
  static componentName = 'Button';

  protected template = template;

  constructor({ enabled, disabled, text, className }: ButtonProps) {
    super({
      disabled: disabled ?? enabled === false,
      text,
      className,
    });
  }

}

registerComponent(Button);
