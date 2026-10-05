import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import RenderButton from '../../components/ui/button';
import RenderInput from '../../components/ui/input';

import './index.scss';

const renderContent = Handlebars.compile(template);

const RenderLoginContent = () => {
    return renderContent({
        loginInput: RenderInput({
            type: 'text',
            id: 'login',
            name: 'login',
            label: 'Login',
            placeholder: 'Enter your login'
        }),
        passwordInput: RenderInput({
            type: 'password',
            id: 'password',
            name: 'password',
            label: 'Password',
            placeholder: 'Enter your password'
        }),
        submitButton: RenderButton({
            text: 'Login',
            className: 'login__button'
        })
    });
};

export default RenderLoginContent;
