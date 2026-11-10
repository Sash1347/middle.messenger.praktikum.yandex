import template from './index.hbs?raw';

import DefaultAvatar from '../../assets/images/avatar.png';

import '../../components/form';
import { renderPage, type RenderContent } from '../render';
import { profileModel } from '../../models/profile';
import { authService } from '../../utils/auth';

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
    type: 'text',
    id: 'first_name',
    name: 'first_name',
    label: 'First Name',
    placeholder: 'Enter your first name',
    value: ''
  },
  {
    type: 'text',
    id: 'second_name',
    name: 'second_name',
    label: 'Second Name',
    placeholder: 'Enter your second name',
    value: ''
  },
  {
    type: 'text',
    id: 'display_name',
    name: 'display_name',
    label: 'Display Name',
    placeholder: 'Enter your display name',
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
  enabled: true,
  text: 'Save'
};

export default function RenderEditProfileContent(renderToHtml: RenderContent) {
    const user = authService.getAuthUser();
    const profileData = user || profileModel.getProfile();
    const values = new Map(Object.entries(profileData));
    
    let avatarUrl = DefaultAvatar;
    if (profileData?.avatar) {
        avatarUrl = `https://ya-praktikum.tech/api/v2/resources${profileData.avatar}`;
    }
    
    const fields = formFields.map((field) => ({
        ...field,
        value: values.get(field.name) ?? field.value,
    }));
    return renderPage(template, {
        avatar: avatarUrl,
        fields, button: formButton, onSubmit: editProfileFormSubmit,
    }, renderToHtml);
}
