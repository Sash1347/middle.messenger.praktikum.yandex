import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Form from '../../components/form';

import { registrationFormSubmit } from './helper';

import './index.scss';


const renderContent = Handlebars.compile(template);

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

export default function RenderRegistrationContent(renderToHtml: (html: string) => void) {
    renderToHtml(renderContent({ form: new Form({ fields: formFields, button: formButton }).element()?.outerHTML ?? '' }));
    const form = document.querySelector('form');
    if (!form) throw new Error('Registration form not found');
    return registrationFormSubmit(form);
}
