import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import { ErrorCode } from '../../constants/errors';

import './index.scss';

const renderContent = Handlebars.compile(template);

const ERROR_MESSAGES_PER_CODE: Record<ErrorCode, string> = {
    [ErrorCode.InternalServerError]: 'Something went wrong. Please try again later.',
    [ErrorCode.NotFound]: 'Page not found.'
}

export default function RenderErrorContent(renderToHtml: (html: string) => void) {
    const urlParams = new URLSearchParams(window.location.search);

    const code = urlParams.get('code');
    const errorCode = code === ErrorCode.NotFound ? ErrorCode.NotFound : ErrorCode.InternalServerError;
    renderToHtml(renderContent({ errorCode, errorMessage: ERROR_MESSAGES_PER_CODE[errorCode] }));
}
