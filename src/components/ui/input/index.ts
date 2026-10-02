import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

const renderContent = Handlebars.compile(template);

interface InputProps {
  type: string;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
}

const RenderInput = (
    {
        type,
        id,
        name,
        label,
        placeholder,
    } : InputProps
) => {
    return renderContent({ type, id, name, label, placeholder });
};

export default RenderInput;