import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Page from '../../components/page';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default class HomePage extends Page {
  protected render(): string {
    return renderContent({});
  }
}
