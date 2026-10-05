import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

const renderContent = Handlebars.compile(template);

interface ButtonProps {
  text: string;
  className?: string;
}

const RenderButton = (
    {
        text,
        className,
    } : ButtonProps
) => {
    return renderContent({ text, className }); 
};

export default RenderButton;
