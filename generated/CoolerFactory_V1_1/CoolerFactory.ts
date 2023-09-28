// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class ClearRequest extends ethereum.Event {
  get params(): ClearRequest__Params {
    return new ClearRequest__Params(this);
  }
}

export class ClearRequest__Params {
  _event: ClearRequest;

  constructor(event: ClearRequest) {
    this._event = event;
  }

  get cooler(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get reqID(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get loanID(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class DefaultLoan extends ethereum.Event {
  get params(): DefaultLoan__Params {
    return new DefaultLoan__Params(this);
  }
}

export class DefaultLoan__Params {
  _event: DefaultLoan;

  constructor(event: DefaultLoan) {
    this._event = event;
  }

  get cooler(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get loanID(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class ExtendLoan extends ethereum.Event {
  get params(): ExtendLoan__Params {
    return new ExtendLoan__Params(this);
  }
}

export class ExtendLoan__Params {
  _event: ExtendLoan;

  constructor(event: ExtendLoan) {
    this._event = event;
  }

  get cooler(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get loanID(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get times(): i32 {
    return this._event.parameters[2].value.toI32();
  }
}

export class RepayLoan extends ethereum.Event {
  get params(): RepayLoan__Params {
    return new RepayLoan__Params(this);
  }
}

export class RepayLoan__Params {
  _event: RepayLoan;

  constructor(event: RepayLoan) {
    this._event = event;
  }

  get cooler(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get loanID(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class RequestLoan extends ethereum.Event {
  get params(): RequestLoan__Params {
    return new RequestLoan__Params(this);
  }
}

export class RequestLoan__Params {
  _event: RequestLoan;

  constructor(event: RequestLoan) {
    this._event = event;
  }

  get cooler(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get collateral(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get debt(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get reqID(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class RescindRequest extends ethereum.Event {
  get params(): RescindRequest__Params {
    return new RescindRequest__Params(this);
  }
}

export class RescindRequest__Params {
  _event: RescindRequest;

  constructor(event: RescindRequest) {
    this._event = event;
  }

  get cooler(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get reqID(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class CoolerFactory extends ethereum.SmartContract {
  static bind(address: Address): CoolerFactory {
    return new CoolerFactory("CoolerFactory", address);
  }

  coolerImplementation(): Address {
    let result = super.call(
      "coolerImplementation",
      "coolerImplementation():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_coolerImplementation(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "coolerImplementation",
      "coolerImplementation():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  coolersFor(param0: Address, param1: Address, param2: BigInt): Address {
    let result = super.call(
      "coolersFor",
      "coolersFor(address,address,uint256):(address)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(param1),
        ethereum.Value.fromUnsignedBigInt(param2)
      ]
    );

    return result[0].toAddress();
  }

  try_coolersFor(
    param0: Address,
    param1: Address,
    param2: BigInt
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "coolersFor",
      "coolersFor(address,address,uint256):(address)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(param1),
        ethereum.Value.fromUnsignedBigInt(param2)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  created(param0: Address): boolean {
    let result = super.call("created", "created(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBoolean();
  }

  try_created(param0: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("created", "created(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  generateCooler(collateral_: Address, debt_: Address): Address {
    let result = super.call(
      "generateCooler",
      "generateCooler(address,address):(address)",
      [
        ethereum.Value.fromAddress(collateral_),
        ethereum.Value.fromAddress(debt_)
      ]
    );

    return result[0].toAddress();
  }

  try_generateCooler(
    collateral_: Address,
    debt_: Address
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "generateCooler",
      "generateCooler(address,address):(address)",
      [
        ethereum.Value.fromAddress(collateral_),
        ethereum.Value.fromAddress(debt_)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class GenerateCoolerCall extends ethereum.Call {
  get inputs(): GenerateCoolerCall__Inputs {
    return new GenerateCoolerCall__Inputs(this);
  }

  get outputs(): GenerateCoolerCall__Outputs {
    return new GenerateCoolerCall__Outputs(this);
  }
}

export class GenerateCoolerCall__Inputs {
  _call: GenerateCoolerCall;

  constructor(call: GenerateCoolerCall) {
    this._call = call;
  }

  get collateral_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get debt_(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class GenerateCoolerCall__Outputs {
  _call: GenerateCoolerCall;

  constructor(call: GenerateCoolerCall) {
    this._call = call;
  }

  get cooler(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}

export class LogClearRequestCall extends ethereum.Call {
  get inputs(): LogClearRequestCall__Inputs {
    return new LogClearRequestCall__Inputs(this);
  }

  get outputs(): LogClearRequestCall__Outputs {
    return new LogClearRequestCall__Outputs(this);
  }
}

export class LogClearRequestCall__Inputs {
  _call: LogClearRequestCall;

  constructor(call: LogClearRequestCall) {
    this._call = call;
  }

  get reqID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get loanID_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class LogClearRequestCall__Outputs {
  _call: LogClearRequestCall;

  constructor(call: LogClearRequestCall) {
    this._call = call;
  }
}

export class LogDefaultLoanCall extends ethereum.Call {
  get inputs(): LogDefaultLoanCall__Inputs {
    return new LogDefaultLoanCall__Inputs(this);
  }

  get outputs(): LogDefaultLoanCall__Outputs {
    return new LogDefaultLoanCall__Outputs(this);
  }
}

export class LogDefaultLoanCall__Inputs {
  _call: LogDefaultLoanCall;

  constructor(call: LogDefaultLoanCall) {
    this._call = call;
  }

  get loanID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get collateral_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class LogDefaultLoanCall__Outputs {
  _call: LogDefaultLoanCall;

  constructor(call: LogDefaultLoanCall) {
    this._call = call;
  }
}

export class LogExtendLoanCall extends ethereum.Call {
  get inputs(): LogExtendLoanCall__Inputs {
    return new LogExtendLoanCall__Inputs(this);
  }

  get outputs(): LogExtendLoanCall__Outputs {
    return new LogExtendLoanCall__Outputs(this);
  }
}

export class LogExtendLoanCall__Inputs {
  _call: LogExtendLoanCall;

  constructor(call: LogExtendLoanCall) {
    this._call = call;
  }

  get loanID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get times_(): i32 {
    return this._call.inputValues[1].value.toI32();
  }
}

export class LogExtendLoanCall__Outputs {
  _call: LogExtendLoanCall;

  constructor(call: LogExtendLoanCall) {
    this._call = call;
  }
}

export class LogRepayLoanCall extends ethereum.Call {
  get inputs(): LogRepayLoanCall__Inputs {
    return new LogRepayLoanCall__Inputs(this);
  }

  get outputs(): LogRepayLoanCall__Outputs {
    return new LogRepayLoanCall__Outputs(this);
  }
}

export class LogRepayLoanCall__Inputs {
  _call: LogRepayLoanCall;

  constructor(call: LogRepayLoanCall) {
    this._call = call;
  }

  get loanID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get repayment_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class LogRepayLoanCall__Outputs {
  _call: LogRepayLoanCall;

  constructor(call: LogRepayLoanCall) {
    this._call = call;
  }
}

export class LogRequestLoanCall extends ethereum.Call {
  get inputs(): LogRequestLoanCall__Inputs {
    return new LogRequestLoanCall__Inputs(this);
  }

  get outputs(): LogRequestLoanCall__Outputs {
    return new LogRequestLoanCall__Outputs(this);
  }
}

export class LogRequestLoanCall__Inputs {
  _call: LogRequestLoanCall;

  constructor(call: LogRequestLoanCall) {
    this._call = call;
  }

  get reqID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class LogRequestLoanCall__Outputs {
  _call: LogRequestLoanCall;

  constructor(call: LogRequestLoanCall) {
    this._call = call;
  }
}

export class LogRescindRequestCall extends ethereum.Call {
  get inputs(): LogRescindRequestCall__Inputs {
    return new LogRescindRequestCall__Inputs(this);
  }

  get outputs(): LogRescindRequestCall__Outputs {
    return new LogRescindRequestCall__Outputs(this);
  }
}

export class LogRescindRequestCall__Inputs {
  _call: LogRescindRequestCall;

  constructor(call: LogRescindRequestCall) {
    this._call = call;
  }

  get reqID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class LogRescindRequestCall__Outputs {
  _call: LogRescindRequestCall;

  constructor(call: LogRescindRequestCall) {
    this._call = call;
  }
}
