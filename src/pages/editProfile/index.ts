import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Avatar from '../../assets/images/avatar.png';

import FormLayout from '../../components/form';

import './index.scss';

const formFields = [
  {
    type: 'text',
    id: 'first-name',
    name: 'first-name',
    label: 'First Name',
    placeholder: 'Enter your first name',
    value: 'name'
  },
  {
    type: 'text',
    id: 'last-name',
    name: 'last-name',
    label: 'Last Name',
    placeholder: 'Enter your last name',
    value: 'surname'
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
    id: 'username',
    name: 'username',
    label: 'Username',
    placeholder: 'Enter your username',
    value: 'username'
  },
  {
    type: 'tel',
    id: 'phone',
    name: 'phone',
    label: 'Phone',
    placeholder: 'Enter your phone number',
    value: '+1234567890'
  },
  {
    type: 'text',
    id: 'login',
    name: 'login',
    label: 'Login',
    placeholder: 'Enter your login',
    value: 'login'
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
