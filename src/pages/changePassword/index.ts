import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import FormLayout from '../../components/form';

import './index.scss';

const formFields = [
    {
        type: 'password',
        id: 'old_password',
        name: 'old_password',
        label: 'Current Password',
        placeholder: 'Enter your current password',
        value: ''
    },
    {
        type: 'password',
        id: 'new_password',
        name: 'new_password',
        label: 'New Password',
        placeholder: 'Enter your new password',
        value: ''
    },
    {
        type: 'password',
        id: 'confirm_password',
        name: 'confirm_password',
        label: 'Confirm Password',
        placeholder: 'Confirm your new password',
        value: ''
    }
];

const formButton = {
    text: 'Change Password',
    className: 'change-password__button'
};

const renderContent = Handlebars.compile(template);

const RenderChangePasswordContent = () => {
    return renderContent({
        form: FormLayout(formFields, formButton)
    });
};

export default RenderChangePasswordContent;
