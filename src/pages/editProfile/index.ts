import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Avatar from '../../assets/images/avatar.png';

import Form from '../../components/form';
import Page from '../../components/page';
import { profileModel } from '../../models/profile';

import './index.scss';
import { editProfileFormSubmit } from './helper';

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
    value: 'Name'
  },
  {
    type: 'text',
    id: 'second_name',
    name: 'second_name',
    label: 'Second Name',
    placeholder: 'Enter your second name',
    value: 'Surname'
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

export default class EditProfilePage extends Page {
  protected render(): string {
    return renderContent({
        avatar: Avatar,
        form: '<div id="form-host"></div>'
    });
  }

  protected componentDidMount(): void {
    const values = new Map(Object.entries(profileModel.getProfile()));
    const fields = formFields.map((field) => ({
        ...field,
        value: values.get(field.name) ?? field.value,
    }));
    const form = new Form({ fields, button: formButton, setup: editProfileFormSubmit });
    this.mountChild(form, '#form-host');
  }
}
