import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import RenderButton from '../../components/ui/button';
import RenderInput from '../../components/ui/input';

import './index.scss';

const renderContent = Handlebars.compile(template);

const RenderRegistrationContent = () => {
    return renderContent({
        inputFirstName: RenderInput({
            type: 'text',
            id: 'first_name',
            name: 'first_name',
            label: 'First name',
            placeholder: 'Enter your first name'
        }),
        inputSecondName: RenderInput({
            type: 'text',
            id: 'second_name',
            name: 'second_name',
            label: 'Second name',
            placeholder: 'Enter your second name'
        }),
        inputLogin: RenderInput({
            type: 'text',
            id: 'login',
            name: 'login',
            label: 'Login',
            placeholder: 'Enter your login'
        }),
        inputEmail: RenderInput({
            type: 'email',
            id: 'email',
            name: 'email',
            label: 'Email',
            placeholder: 'Enter your email'
        }),
        inputPassword: RenderInput({
            type: 'password',
            id: 'password',
            name: 'password',
            label: 'Password',
            placeholder: 'Enter your password'
        }),
        inputPhone: RenderInput({
            type: 'tel',
            id: 'phone',
            name: 'phone',
            label: 'Phone',
            placeholder: 'Enter your phone number'
        }),
        submitButton: RenderButton({
            text: 'Register',
        })
    });
};

export default RenderRegistrationContent;