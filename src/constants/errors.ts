export const ErrorCode = {
    InternalServerError: '500',
    NotFound: '404',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
