import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

const renderContent = Handlebars.compile(template);

const RenderHomePageContent = () => {
    return renderContent({});
};

export default RenderHomePageContent;