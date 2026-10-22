import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

const renderContent = Handlebars.compile(template);

export interface ButtonProps {
  enabled?: boolean;
  disabled?: boolean;
  text: string;
  className?: string;
}

export default function Button(props: ButtonProps): string {
    const { enabled, disabled, text, className } = props;
    return renderContent({
      disabled: disabled ?? enabled === false,
      text,
      className,
    });
}
