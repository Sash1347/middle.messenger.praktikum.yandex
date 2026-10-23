import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../components/Block';

import EditIcon from '../../../../assets/icons/edit-icon.svg';

import './index.scss';

const renderProfileEdit = Handlebars.compile(template);

export default class ProfileEdit extends Block {
    constructor() {
        super({}, renderProfileEdit);
    }

    protected getTemplateData(): object {
        return { editIcon: EditIcon };
    }
}
