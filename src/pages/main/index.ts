import template from './index.hbs?raw';

import './components/profile-bar';
import './components/profile-edit';
import './components/chat-card';
import './components/dialog';
import { renderPage, type RenderContent } from '../render';
import './components/dialog/components/dialog-header';

import './index.scss';

export default function RenderMainContent(renderToHtml: RenderContent) {
    return renderPage(template, {}, renderToHtml);
}
