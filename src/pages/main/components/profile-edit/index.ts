import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import EditIcon from '../../../../assets/icons/edit-icon.svg';

import './index.scss';

const renderProfileEdit = Handlebars.compile(template);

const RenderProfileEdit = () => {
    return renderProfileEdit({ editIcon: EditIcon });
};

export default RenderProfileEdit;
