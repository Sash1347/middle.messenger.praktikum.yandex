import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../Block';
import { registerComponent } from '../../ComponentRegistry';

import './index.scss';

export interface InputProps extends BlockOwnProps {
  type: string;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  errorText?: string;
}

export default class Input extends Block<InputProps> {
  static componentName = 'Input';

  protected template = template;

  constructor(props: InputProps) {
    super(props);
  }

}

registerComponent(Input);
