import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';

import EditIcon from '../../../../assets/icons/edit-icon.svg';

import './index.scss';

interface ProfileEditProps extends BlockOwnProps {
    editIcon: string;
}

export default class ProfileEdit extends Block<ProfileEditProps> {
    static componentName = 'ProfileEdit';

    protected template = template;

    constructor() {
        super({ editIcon: EditIcon });
    }

}

registerComponent(ProfileEdit);
