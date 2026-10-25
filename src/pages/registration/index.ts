import template from './index.hbs?raw';

import '../../components/form';
import { renderPage, type RenderContent } from '../render';

import { registrationFormSubmit } from './helper';

import './index.scss';


const formFields = [
    {
        type: 'text',
        id: 'first_name',
        name: 'first_name',
        label: 'First name',
        placeholder: 'Enter your first name',
        value: ''
    },
    {
        type: 'text',
        id: 'second_name',
        name: 'second_name',
        label: 'Second name',
        placeholder: 'Enter your second name',
        value: ''
    },
    {
        type: 'text',
        id: 'login',
        name: 'login',
        label: 'Login',
        placeholder: 'Enter your login',
        value: ''
    },
    {
        type: 'email',
        id: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        value: ''
    },
    {
        type: 'password',
        id: 'password',
        name: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        value: ''
    },

    {
        type: 'tel',
        id: 'phone',
        name: 'phone',
        label: 'Phone',
        placeholder: 'Enter your phone number',
        value: ''
    }

];

const formButton = {
    text: 'Sign up'
};

export default function RenderRegistrationContent(renderToHtml: RenderContent) {
    return renderPage(template, {
        fields: formFields, button: formButton, onSubmit: registrationFormSubmit,
    }, renderToHtml);
}
