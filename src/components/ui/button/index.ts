import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

const renderContent = Handlebars.compile(template);

interface ButtonProps {
  enabled: boolean;
  text: string;
  className?: string;
}

const RenderButton = (
    {
        enabled,
        text,
        className,
    } : ButtonProps
) => {
    return renderContent({ enabled, text, className });
};

export default RenderButton;
