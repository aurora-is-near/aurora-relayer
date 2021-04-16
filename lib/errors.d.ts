export declare function unsupported(method: string): void;
export declare function unimplemented(method: string): void;
export declare function expectArgs(args: any[] | undefined, min: number, max: number, minMsg?: string): void;
export declare abstract class CodedError extends Error {
    readonly code: number;
    constructor(code: number, message: string);
}
export declare class UnsupportedMethod extends CodedError {
    constructor(method: string);
}
export declare class UnimplementedMethod extends CodedError {
    constructor(method: string);
}
export declare class MissingArgument extends CodedError {
    constructor(index: number, message?: string);
}
export declare class TooManyArguments extends CodedError {
    constructor(maxCount: number);
}
export declare class InvalidArguments extends CodedError {
    constructor();
}
