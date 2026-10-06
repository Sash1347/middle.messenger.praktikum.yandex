import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import { ErrorCode } from '../../constants/errors';

import './index.scss';

const renderContent = Handlebars.compile(template);

const ERROR_MESSAGES_PER_CODE: Record<ErrorCode, string> = {
    [ErrorCode.InternalServerError]: 'Something went wrong. Please try again later.',
    [ErrorCode.NotFound]: 'Page not found.'
}

const RenderErrorContent = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const errorCode = (urlParams.get('code') as ErrorCode) || ErrorCode.InternalServerError;
    return renderContent({ errorCode: errorCode, errorMessage: ERROR_MESSAGES_PER_CODE[errorCode] || 'Something went wrong.' });
};

export default RenderErrorContent;
