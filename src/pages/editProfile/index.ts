import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Avatar from '../../assets/images/avatar.png';

import FormLayout from '../../components/form';

import './index.scss';

const formFields = [
  {
    type: 'file',
    id: 'avatar',
    name: 'avatar',
    label: 'Avatar'
  },
  {
    type: 'email',
    id: 'email',
    name: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    value: 'email@example.com'
  },
  {
    type: 'text',
    id: 'login',
    name: 'login',
    label: 'Login',
    placeholder: 'Enter your login',
    value: 'login'
  },
  {
    type: 'text',
    id: 'first_name',
    name: 'first_name',
    label: 'First Name',
    placeholder: 'Enter your first name',
    value: 'name'
  },
  {
    type: 'text',
    id: 'second_name',
    name: 'second_name',
    label: 'Second Name',
    placeholder: 'Enter your second name',
    value: 'surname'
  },
  {
    type: 'text',
    id: 'display_name',
    name: 'display_name',
    label: 'Display Name',
    placeholder: 'Enter your display name',
    value: 'username'
  },
  {
    type: 'tel',
    id: 'phone',
    name: 'phone',
    label: 'Phone',
    placeholder: 'Enter your phone number',
    value: '+1234567890'
  }
];

const formButton = {
  enabled: true,
  text: 'Save'
};

const renderContent = Handlebars.compile(template);

const RenderEditProfileContent = () => {
    return renderContent({
        avatar: Avatar,
        form: FormLayout(formFields, formButton)
    });
};

export default RenderEditProfileContent;
