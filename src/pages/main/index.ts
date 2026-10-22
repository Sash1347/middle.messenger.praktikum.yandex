import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Page from '../../components/page';

import RenderProfileBar from './components/profile-bar';
import RenderProfileEdit from './components/profile-edit';
import RenderChatCard from './components/chat-card';
import Dialog from './components/dialog';
import RenderDialogHeader from './components/dialog/components/dialog-header';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default class ChatsPage extends Page {
  protected render(): string {
    return renderContent({
        profileBar: RenderProfileBar(),
        profileEdit: RenderProfileEdit(),
        chatCard: RenderChatCard(),
        dialog: '',
        dialogHeader: RenderDialogHeader(),
    });
  }

  protected componentDidMount(): void {
    this.mountChild(new Dialog(), '.chat-layout__dialog');
  }
}
