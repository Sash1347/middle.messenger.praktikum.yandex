import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import RenderInput from '../../../../components/ui/input';
import RenderMessage from './components/message';

import './index.scss';

const renderDialog = Handlebars.compile(template);

const messages = Array.from({ length: 25 }, (_, index) =>
    RenderMessage(`Message ${index + 1}`, index % 2 === 0 ? 'outgoing' : 'incoming')
);

const RenderDialog = () => {
    return renderDialog({
        input: RenderInput({
            type: 'text',
            name: 'message',
            placeholder: 'Type a message',
        }),
        messages,
    });
};

export default RenderDialog;
