/* This is free and unencumbered software released into the public domain. */

export function unsupported(method: string): void {
  throw new UnsupportedMethod(method);
}

export function unimplemented(method: string): void {
  throw new UnimplementedMethod(method);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function expectArgs(
  args: any[] | undefined,
  min: number,
  max: number,
  minMsg?: string
): any[] {
  if (args && args.length < min) throw new MissingArgument(min - 1, minMsg);
  if (args && args.length > max) throw new TooManyArguments(max);
  //if (args.length > max) throw new InvalidArguments();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return args as any[];
}

export abstract class CodedError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, CodedError.prototype);
  }
}

export class UnexpectedError extends CodedError {
  constructor(message: string) {
    super(-32603, message);
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }
}

export abstract class ExpectedError extends CodedError {
  constructor(code: number, message: string, data?: any) {
    super(code, message, data);
    Object.setPrototypeOf(this, ExpectedError.prototype);
  }
}

export class UnsupportedMethod extends ExpectedError {
  constructor(method: string) {
    super(-32601, `Unsupported method: ${method}`);
    Object.setPrototypeOf(this, UnsupportedMethod.prototype);
  }
}

export class UnimplementedMethod extends ExpectedError {
  constructor(method: string) {
    super(-32601, `Unimplemented method: ${method}`);
    Object.setPrototypeOf(this, UnimplementedMethod.prototype);
  }
}

export class MissingArgument extends ExpectedError {
  constructor(index: number, message?: string) {
    super(-32602, message || `missing value for required argument ${index}`);
    Object.setPrototypeOf(this, MissingArgument.prototype);
  }
}

export class TooManyArguments extends ExpectedError {
  constructor(maxCount: number) {
    super(-32602, `too many arguments, want at most ${maxCount}`);
    Object.setPrototypeOf(this, TooManyArguments.prototype);
  }
}

export class InvalidArguments extends ExpectedError {
  constructor(message?: string) {
    super(-32602, message || `Invalid method parameter(s).`);
    Object.setPrototypeOf(this, InvalidArguments.prototype);
  }
}

export class InvalidAddress extends ExpectedError {
  constructor(message?: string) {
    super(-32602, message || `Invalid address.`);
    Object.setPrototypeOf(this, InvalidAddress.prototype);
  }
}

export class UnknownFilter extends ExpectedError {
  constructor(_id: string) {
    super(-32000, `filter not found`);
    Object.setPrototypeOf(this, UnknownFilter.prototype);
  }
}

export class TransactionError extends ExpectedError {
  constructor(message: string) {
    super(-32000, message);
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}

export class RevertError extends ExpectedError {
  constructor(reason: Uint8Array) {
    const reason_str = Buffer.from(reason).toString();
    if (/[\x00-\x1F]/.test(reason_str)) {
      // Detect non-printable characters https://stackoverflow.com/a/1677660
      super(3, `execution reverted: ${reason}`);
    } else {
      super(3, `execution reverted: ${reason_str}`);
    }
    Object.setPrototypeOf(this, RevertError.prototype);
  }
}
