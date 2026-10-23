import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Avatar from '../../assets/images/avatar.png';
import { profileModel } from '../../models/profile';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default function RenderProfileContent(renderToHtml: (html: string) => void) {
    renderToHtml(renderContent({
        avatar: Avatar,
        ...profileModel.getProfile(),
    }));
}
