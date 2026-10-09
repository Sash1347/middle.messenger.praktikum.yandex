import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import FormLayout from '../../components/form';

import './index.scss';

const renderContent = Handlebars.compile(template);

const formFields = [
  {
    type: 'text',
    id: 'login',
    name: 'login',
    label: 'Login',
    placeholder: 'Enter your login',
    value: ''
  },
  {
    type: 'password',
    id: 'password',
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    value: ''
  }
]

const formButton = {
  enabled: true,
  text: 'Submit'
}; 


const RenderLoginContent = () => {
    return renderContent({
        form: FormLayout(formFields, formButton)
    });
};

export default RenderLoginContent;
