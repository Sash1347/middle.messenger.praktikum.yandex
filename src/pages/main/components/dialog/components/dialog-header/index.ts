import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../../../components/Block';
import { registerComponent } from '../../../../../../components/ComponentRegistry';

import DeleteIcon from '../../../../../../assets/icons/delete-icon.svg';

import './index.scss';

interface DialogHeaderProps extends BlockOwnProps {
    userName: string;
    deleteIcon: string;
}

export default class DialogHeader extends Block<DialogHeaderProps> {
    static componentName = 'DialogHeader';

    protected template = template;

    constructor() {
        super({ userName: 'Chat name', deleteIcon: DeleteIcon });
    }

}

registerComponent(DialogHeader);
