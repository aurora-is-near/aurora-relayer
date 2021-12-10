/* This is free and unencumbered software released into the public domain. */
export function unsupported(method) {
    throw new UnsupportedMethod(method);
}
export function unimplemented(method) {
    throw new UnimplementedMethod(method);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function expectArgs(args, min, max, minMsg) {
    if (args && args.length < min)
        throw new MissingArgument(min - 1, minMsg);
    if (args && args.length > max)
        throw new TooManyArguments(max);
    //if (args.length > max) throw new InvalidArguments();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return args;
}
export class CodedError extends Error {
    constructor(code, message, data) {
        super(message);
        this.code = code;
        this.data = data;
        Object.setPrototypeOf(this, CodedError.prototype);
    }
}
export class UnexpectedError extends CodedError {
    constructor(message) {
        super(-32603, message);
        Object.setPrototypeOf(this, UnexpectedError.prototype);
    }
}
export class ExpectedError extends CodedError {
    constructor(code, message, data) {
        super(code, message, data);
        Object.setPrototypeOf(this, ExpectedError.prototype);
    }
}
export class UnsupportedMethod extends ExpectedError {
    constructor(method) {
        super(-32601, `Unsupported method: ${method}`);
        Object.setPrototypeOf(this, UnsupportedMethod.prototype);
    }
}
export class UnimplementedMethod extends ExpectedError {
    constructor(method) {
        super(-32601, `Unimplemented method: ${method}`);
        Object.setPrototypeOf(this, UnimplementedMethod.prototype);
    }
}
export class MissingArgument extends ExpectedError {
    constructor(index, message) {
        super(-32602, message || `missing value for required argument ${index}`);
        Object.setPrototypeOf(this, MissingArgument.prototype);
    }
}
export class TooManyArguments extends ExpectedError {
    constructor(maxCount) {
        super(-32602, `too many arguments, want at most ${maxCount}`);
        Object.setPrototypeOf(this, TooManyArguments.prototype);
    }
}
export class InvalidArguments extends ExpectedError {
    constructor(message) {
        super(-32602, message || `Invalid method parameter(s).`);
        Object.setPrototypeOf(this, InvalidArguments.prototype);
    }
}
export class InvalidAddress extends ExpectedError {
    constructor(message) {
        super(-32602, message || `Invalid address.`);
        Object.setPrototypeOf(this, InvalidAddress.prototype);
    }
}
export class UnknownFilter extends ExpectedError {
    constructor(_id) {
        super(-32000, `filter not found`);
        Object.setPrototypeOf(this, UnknownFilter.prototype);
    }
}
export class TransactionError extends ExpectedError {
    constructor(message) {
        super(-32000, message);
        Object.setPrototypeOf(this, TransactionError.prototype);
    }
}
export class RevertError extends ExpectedError {
    constructor(reason) {
        super(3, `execution reverted: ${reason}`);
        Object.setPrototypeOf(this, RevertError.prototype);
    }
}
