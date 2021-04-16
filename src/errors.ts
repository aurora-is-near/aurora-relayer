
export function unsupported(method: string): void {
    throw new UnsupportedMethod(method);
}

export function unimplemented(method: string): void {
    throw new UnimplementedMethod(method);
}

export function expectArgs(args: any[] | undefined, min: number, max: number, minMsg?: string): void {
    if (args && args.length < min) throw new MissingArgument(min - 1, minMsg);
    if (args && args.length > max) throw new TooManyArguments(max);
    //if (args.length > max) throw new InvalidArguments();
}

export abstract class CodedError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message);
        Object.setPrototypeOf(this, CodedError.prototype);
    }
}

export class UnsupportedMethod extends CodedError {
    constructor(method: string) {
        super(-32601, `Unsupported method: ${method}`);
        Object.setPrototypeOf(this, UnsupportedMethod.prototype);
    }
}

export class UnimplementedMethod extends CodedError {
    constructor(method: string) {
        super(-32601, `Unimplemented method: ${method}`);
        Object.setPrototypeOf(this, UnimplementedMethod.prototype);
    }
}

export class MissingArgument extends CodedError {
    constructor(index: number, message?: string) {
        super(-32602, message || `missing value for required argument ${index}`);
        Object.setPrototypeOf(this, MissingArgument.prototype);
    }
}

export class TooManyArguments extends CodedError {
    constructor(maxCount: number) {
        super(-32602, `too many arguments, want at most ${maxCount}`);
        Object.setPrototypeOf(this, TooManyArguments.prototype);
    }
}

export class InvalidArguments extends CodedError {
    constructor() {
        super(-32602, `Invalid method parameter(s).`);
        Object.setPrototypeOf(this, InvalidArguments.prototype);
    }
}
