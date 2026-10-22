import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Page from '../../components/page';

import Avatar from '../../assets/images/avatar.png';
import { profileModel } from '../../models/profile';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default class ProfilePage extends Page {
  protected render(): string {
    return renderContent({
        avatar: Avatar,
        ...profileModel.getProfile(),
    });
  }
}
