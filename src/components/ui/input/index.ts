import template from './index.hbs?raw';
import Block from '../../Block';

import './index.scss';

export interface InputProps {
  type: string;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  errorText?: string;
}

export default class Input extends Block<InputProps> {
  protected template = template;

  constructor(props: InputProps) {
    super(props);
  }
}
