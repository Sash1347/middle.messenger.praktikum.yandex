import template from './index.hbs?raw';
import Block from '../../../../components/Block';

import EditIcon from '../../../../assets/icons/edit-icon.svg';

import './index.scss';

interface ProfileEditProps {
    editIcon: string;
}

export default class ProfileEdit extends Block<ProfileEditProps> {
    protected template = template;

    constructor() {
        super({ editIcon: EditIcon });
    }
}
