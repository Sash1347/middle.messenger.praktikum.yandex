import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import RenderProfileBar from './components/profile-bar';
import RenderProfileEdit from './components/profile-edit';
import RenderChatCard from './components/chat-card';
import RenderDialog, { setupDialog } from './components/dialog';
import RenderDialogHeader from './components/dialog/components/dialog-header';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default function RenderMainContent(renderToHtml: (html: string) => void) {
    renderToHtml(renderContent({
        profileBar: RenderProfileBar(),
        profileEdit: RenderProfileEdit(),
        chatCard: RenderChatCard(),
        dialog: RenderDialog(),
        dialogHeader: RenderDialogHeader(),
    }));
    return setupDialog();
}
