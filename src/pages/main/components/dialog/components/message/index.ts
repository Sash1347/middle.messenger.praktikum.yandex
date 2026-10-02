import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

type MessageDirection = 'outgoing' | 'incoming';

const renderMessage = Handlebars.compile(template);

const RenderMessage = (text: string, direction: MessageDirection) => {
    return renderMessage({ text, direction });
};

export default RenderMessage;