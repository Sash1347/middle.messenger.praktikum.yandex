import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';

import './index.scss';

interface ChatCardProps extends BlockOwnProps {
    id: number;
    avatar: string;
    name: string;
    selected: boolean;
    onSelect: (id: number) => void;
}

export default class ChatCard extends Block<ChatCardProps> {
    static componentName = 'ChatCard';

    protected template = template;

    constructor(props: ChatCardProps) {
        super(props);
        this.events = {
            click: () => props.onSelect(props.id),
        };
    }
}

registerComponent(ChatCard);
