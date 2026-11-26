import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default function RenderHomePageContent(renderToHtml: (html: string) => void) {
  renderToHtml(renderContent({}));
}
