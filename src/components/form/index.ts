import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Input from '../ui/input';
import Button from '../ui/button';

import './index.scss';

const renderContent = Handlebars.compile(template);

interface FormItem {
    id: string,
    name: string,
    label: string,
    placeholder: string,
    value: string,
    type: string
}

const FormLayout = (form: Array<FormItem>, ButtonInfo?: any) => {
    return renderContent({
        inputs: form.map(item => Input(item)),
        button: ButtonInfo ? Button(ButtonInfo) : ''
    });
};

export default FormLayout;
