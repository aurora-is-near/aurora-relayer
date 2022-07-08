export declare function unsupported(method: string): void;
export declare function unimplemented(method: string): void;
export declare function expectArgs(args: any[] | undefined, min: number, max: number, minMsg?: string): any[];
export declare abstract class CodedError extends Error {
    readonly code: number;
    readonly data?: any;
    constructor(code: number, message: string, data?: any);
}
export declare class UnexpectedError extends CodedError {
    constructor(message: string);
}
export declare abstract class ExpectedError extends CodedError {
    constructor(code: number, message: string, data?: any);
}
export declare class UnsupportedMethod extends ExpectedError {
    constructor(method: string);
}
export declare class UnimplementedMethod extends ExpectedError {
    constructor(method: string);
}
export declare class MissingArgument extends ExpectedError {
    constructor(index: number, message?: string);
}
export declare class TooManyArguments extends ExpectedError {
    constructor(maxCount: number);
}
export declare class InvalidArguments extends ExpectedError {
    constructor(message?: string);
}
export declare class InvalidAddress extends ExpectedError {
    constructor(message?: string);
}
export declare class UnknownFilter extends ExpectedError {
    constructor(_id: string);
}
export declare class TransactionError extends ExpectedError {
    constructor(message: string);
}
export declare class RevertError extends ExpectedError {
    constructor(reason: Uint8Array);
}
export declare class GasPriceTooLow extends ExpectedError {
    constructor(message?: string);
}
export declare class LimitExceeded extends ExpectedError {
    constructor(limit: number, message?: string);
}
