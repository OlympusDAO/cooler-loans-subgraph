// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class Activate extends ethereum.Event {
  get params(): Activate__Params {
    return new Activate__Params(this);
  }
}

export class Activate__Params {
  _event: Activate;

  constructor(event: Activate) {
    this._event = event;
  }
}

export class Deactivate extends ethereum.Event {
  get params(): Deactivate__Params {
    return new Deactivate__Params(this);
  }
}

export class Deactivate__Params {
  _event: Deactivate;

  constructor(event: Deactivate) {
    this._event = event;
  }
}

export class Defund extends ethereum.Event {
  get params(): Defund__Params {
    return new Defund__Params(this);
  }
}

export class Defund__Params {
  _event: Defund;

  constructor(event: Defund) {
    this._event = event;
  }

  get token(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Rebalance extends ethereum.Event {
  get params(): Rebalance__Params {
    return new Rebalance__Params(this);
  }
}

export class Rebalance__Params {
  _event: Rebalance;

  constructor(event: Rebalance) {
    this._event = event;
  }

  get defund(): boolean {
    return this._event.parameters[0].value.toBoolean();
  }

  get reserveAmount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Clearinghouse_V1_2__VERSIONResult {
  value0: i32;
  value1: i32;

  constructor(value0: i32, value1: i32) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set(
      "value0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value0)),
    );
    map.set(
      "value1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value1)),
    );
    return map;
  }

  getMajor(): i32 {
    return this.value0;
  }

  getMinor(): i32 {
    return this.value1;
  }
}

export class Clearinghouse_V1_2__getLoanForCollateralResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getValue0(): BigInt {
    return this.value0;
  }

  getValue1(): BigInt {
    return this.value1;
  }
}

export class Clearinghouse_V1_2__requestPermissionsResultRequestsStruct extends ethereum.Tuple {
  get keycode(): Bytes {
    return this[0].toBytes();
  }

  get funcSelector(): Bytes {
    return this[1].toBytes();
  }
}

export class Clearinghouse_V1_2 extends ethereum.SmartContract {
  static bind(address: Address): Clearinghouse_V1_2 {
    return new Clearinghouse_V1_2("Clearinghouse_V1_2", address);
  }

  CHREG(): Address {
    let result = super.call("CHREG", "CHREG():(address)", []);

    return result[0].toAddress();
  }

  try_CHREG(): ethereum.CallResult<Address> {
    let result = super.tryCall("CHREG", "CHREG():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  DURATION(): BigInt {
    let result = super.call("DURATION", "DURATION():(uint256)", []);

    return result[0].toBigInt();
  }

  try_DURATION(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("DURATION", "DURATION():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  FUND_AMOUNT(): BigInt {
    let result = super.call("FUND_AMOUNT", "FUND_AMOUNT():(uint256)", []);

    return result[0].toBigInt();
  }

  try_FUND_AMOUNT(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("FUND_AMOUNT", "FUND_AMOUNT():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  FUND_CADENCE(): BigInt {
    let result = super.call("FUND_CADENCE", "FUND_CADENCE():(uint256)", []);

    return result[0].toBigInt();
  }

  try_FUND_CADENCE(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("FUND_CADENCE", "FUND_CADENCE():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  INTEREST_RATE(): BigInt {
    let result = super.call("INTEREST_RATE", "INTEREST_RATE():(uint256)", []);

    return result[0].toBigInt();
  }

  try_INTEREST_RATE(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "INTEREST_RATE",
      "INTEREST_RATE():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  LOAN_TO_COLLATERAL(): BigInt {
    let result = super.call(
      "LOAN_TO_COLLATERAL",
      "LOAN_TO_COLLATERAL():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_LOAN_TO_COLLATERAL(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "LOAN_TO_COLLATERAL",
      "LOAN_TO_COLLATERAL():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  MAX_REWARD(): BigInt {
    let result = super.call("MAX_REWARD", "MAX_REWARD():(uint256)", []);

    return result[0].toBigInt();
  }

  try_MAX_REWARD(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("MAX_REWARD", "MAX_REWARD():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  MINTR(): Address {
    let result = super.call("MINTR", "MINTR():(address)", []);

    return result[0].toAddress();
  }

  try_MINTR(): ethereum.CallResult<Address> {
    let result = super.tryCall("MINTR", "MINTR():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  ROLES(): Address {
    let result = super.call("ROLES", "ROLES():(address)", []);

    return result[0].toAddress();
  }

  try_ROLES(): ethereum.CallResult<Address> {
    let result = super.tryCall("ROLES", "ROLES():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  TRSRY(): Address {
    let result = super.call("TRSRY", "TRSRY():(address)", []);

    return result[0].toAddress();
  }

  try_TRSRY(): ethereum.CallResult<Address> {
    let result = super.tryCall("TRSRY", "TRSRY():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  VERSION(): Clearinghouse_V1_2__VERSIONResult {
    let result = super.call("VERSION", "VERSION():(uint8,uint8)", []);

    return new Clearinghouse_V1_2__VERSIONResult(
      result[0].toI32(),
      result[1].toI32(),
    );
  }

  try_VERSION(): ethereum.CallResult<Clearinghouse_V1_2__VERSIONResult> {
    let result = super.tryCall("VERSION", "VERSION():(uint8,uint8)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Clearinghouse_V1_2__VERSIONResult(value[0].toI32(), value[1].toI32()),
    );
  }

  active(): boolean {
    let result = super.call("active", "active():(bool)", []);

    return result[0].toBoolean();
  }

  try_active(): ethereum.CallResult<boolean> {
    let result = super.tryCall("active", "active():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  configureDependencies(): Array<Bytes> {
    let result = super.call(
      "configureDependencies",
      "configureDependencies():(bytes5[])",
      [],
    );

    return result[0].toBytesArray();
  }

  try_configureDependencies(): ethereum.CallResult<Array<Bytes>> {
    let result = super.tryCall(
      "configureDependencies",
      "configureDependencies():(bytes5[])",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytesArray());
  }

  factory(): Address {
    let result = super.call("factory", "factory():(address)", []);

    return result[0].toAddress();
  }

  try_factory(): ethereum.CallResult<Address> {
    let result = super.tryCall("factory", "factory():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  fundTime(): BigInt {
    let result = super.call("fundTime", "fundTime():(uint256)", []);

    return result[0].toBigInt();
  }

  try_fundTime(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("fundTime", "fundTime():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getCollateralForLoan(principal_: BigInt): BigInt {
    let result = super.call(
      "getCollateralForLoan",
      "getCollateralForLoan(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(principal_)],
    );

    return result[0].toBigInt();
  }

  try_getCollateralForLoan(principal_: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getCollateralForLoan",
      "getCollateralForLoan(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(principal_)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getLoanForCollateral(
    collateral_: BigInt,
  ): Clearinghouse_V1_2__getLoanForCollateralResult {
    let result = super.call(
      "getLoanForCollateral",
      "getLoanForCollateral(uint256):(uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(collateral_)],
    );

    return new Clearinghouse_V1_2__getLoanForCollateralResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
    );
  }

  try_getLoanForCollateral(
    collateral_: BigInt,
  ): ethereum.CallResult<Clearinghouse_V1_2__getLoanForCollateralResult> {
    let result = super.tryCall(
      "getLoanForCollateral",
      "getLoanForCollateral(uint256):(uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(collateral_)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Clearinghouse_V1_2__getLoanForCollateralResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
      ),
    );
  }

  getTotalReceivables(): BigInt {
    let result = super.call(
      "getTotalReceivables",
      "getTotalReceivables():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_getTotalReceivables(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getTotalReceivables",
      "getTotalReceivables():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  gohm(): Address {
    let result = super.call("gohm", "gohm():(address)", []);

    return result[0].toAddress();
  }

  try_gohm(): ethereum.CallResult<Address> {
    let result = super.tryCall("gohm", "gohm():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  interestForLoan(principal_: BigInt, duration_: BigInt): BigInt {
    let result = super.call(
      "interestForLoan",
      "interestForLoan(uint256,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(principal_),
        ethereum.Value.fromUnsignedBigInt(duration_),
      ],
    );

    return result[0].toBigInt();
  }

  try_interestForLoan(
    principal_: BigInt,
    duration_: BigInt,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "interestForLoan",
      "interestForLoan(uint256,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(principal_),
        ethereum.Value.fromUnsignedBigInt(duration_),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  interestReceivables(): BigInt {
    let result = super.call(
      "interestReceivables",
      "interestReceivables():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_interestReceivables(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "interestReceivables",
      "interestReceivables():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isActive(): boolean {
    let result = super.call("isActive", "isActive():(bool)", []);

    return result[0].toBoolean();
  }

  try_isActive(): ethereum.CallResult<boolean> {
    let result = super.tryCall("isActive", "isActive():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  isCoolerCallback(): boolean {
    let result = super.call(
      "isCoolerCallback",
      "isCoolerCallback():(bool)",
      [],
    );

    return result[0].toBoolean();
  }

  try_isCoolerCallback(): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isCoolerCallback",
      "isCoolerCallback():(bool)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  kernel(): Address {
    let result = super.call("kernel", "kernel():(address)", []);

    return result[0].toAddress();
  }

  try_kernel(): ethereum.CallResult<Address> {
    let result = super.tryCall("kernel", "kernel():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  lendToCooler(cooler_: Address, amount_: BigInt): BigInt {
    let result = super.call(
      "lendToCooler",
      "lendToCooler(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(cooler_),
        ethereum.Value.fromUnsignedBigInt(amount_),
      ],
    );

    return result[0].toBigInt();
  }

  try_lendToCooler(
    cooler_: Address,
    amount_: BigInt,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "lendToCooler",
      "lendToCooler(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(cooler_),
        ethereum.Value.fromUnsignedBigInt(amount_),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  ohm(): Address {
    let result = super.call("ohm", "ohm():(address)", []);

    return result[0].toAddress();
  }

  try_ohm(): ethereum.CallResult<Address> {
    let result = super.tryCall("ohm", "ohm():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  principalReceivables(): BigInt {
    let result = super.call(
      "principalReceivables",
      "principalReceivables():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_principalReceivables(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "principalReceivables",
      "principalReceivables():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  rebalance(): boolean {
    let result = super.call("rebalance", "rebalance():(bool)", []);

    return result[0].toBoolean();
  }

  try_rebalance(): ethereum.CallResult<boolean> {
    let result = super.tryCall("rebalance", "rebalance():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  requestPermissions(): Array<Clearinghouse_V1_2__requestPermissionsResultRequestsStruct> {
    let result = super.call(
      "requestPermissions",
      "requestPermissions():((bytes5,bytes4)[])",
      [],
    );

    return result[0].toTupleArray<Clearinghouse_V1_2__requestPermissionsResultRequestsStruct>();
  }

  try_requestPermissions(): ethereum.CallResult<
    Array<Clearinghouse_V1_2__requestPermissionsResultRequestsStruct>
  > {
    let result = super.tryCall(
      "requestPermissions",
      "requestPermissions():((bytes5,bytes4)[])",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      value[0].toTupleArray<Clearinghouse_V1_2__requestPermissionsResultRequestsStruct>(),
    );
  }

  reserve(): Address {
    let result = super.call("reserve", "reserve():(address)", []);

    return result[0].toAddress();
  }

  try_reserve(): ethereum.CallResult<Address> {
    let result = super.tryCall("reserve", "reserve():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  sReserve(): Address {
    let result = super.call("sReserve", "sReserve():(address)", []);

    return result[0].toAddress();
  }

  try_sReserve(): ethereum.CallResult<Address> {
    let result = super.tryCall("sReserve", "sReserve():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  staking(): Address {
    let result = super.call("staking", "staking():(address)", []);

    return result[0].toAddress();
  }

  try_staking(): ethereum.CallResult<Address> {
    let result = super.tryCall("staking", "staking():(address)", []);
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

  get ohm_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get gohm_(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get staking_(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get sReserve_(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get coolerFactory_(): Address {
    return this._call.inputValues[4].value.toAddress();
  }

  get kernel_(): Address {
    return this._call.inputValues[5].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ActivateCall extends ethereum.Call {
  get inputs(): ActivateCall__Inputs {
    return new ActivateCall__Inputs(this);
  }

  get outputs(): ActivateCall__Outputs {
    return new ActivateCall__Outputs(this);
  }
}

export class ActivateCall__Inputs {
  _call: ActivateCall;

  constructor(call: ActivateCall) {
    this._call = call;
  }
}

export class ActivateCall__Outputs {
  _call: ActivateCall;

  constructor(call: ActivateCall) {
    this._call = call;
  }
}

export class BurnCall extends ethereum.Call {
  get inputs(): BurnCall__Inputs {
    return new BurnCall__Inputs(this);
  }

  get outputs(): BurnCall__Outputs {
    return new BurnCall__Outputs(this);
  }
}

export class BurnCall__Inputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }
}

export class BurnCall__Outputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }
}

export class ChangeKernelCall extends ethereum.Call {
  get inputs(): ChangeKernelCall__Inputs {
    return new ChangeKernelCall__Inputs(this);
  }

  get outputs(): ChangeKernelCall__Outputs {
    return new ChangeKernelCall__Outputs(this);
  }
}

export class ChangeKernelCall__Inputs {
  _call: ChangeKernelCall;

  constructor(call: ChangeKernelCall) {
    this._call = call;
  }

  get newKernel_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ChangeKernelCall__Outputs {
  _call: ChangeKernelCall;

  constructor(call: ChangeKernelCall) {
    this._call = call;
  }
}

export class ClaimDefaultedCall extends ethereum.Call {
  get inputs(): ClaimDefaultedCall__Inputs {
    return new ClaimDefaultedCall__Inputs(this);
  }

  get outputs(): ClaimDefaultedCall__Outputs {
    return new ClaimDefaultedCall__Outputs(this);
  }
}

export class ClaimDefaultedCall__Inputs {
  _call: ClaimDefaultedCall;

  constructor(call: ClaimDefaultedCall) {
    this._call = call;
  }

  get coolers_(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }

  get loans_(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }
}

export class ClaimDefaultedCall__Outputs {
  _call: ClaimDefaultedCall;

  constructor(call: ClaimDefaultedCall) {
    this._call = call;
  }
}

export class ConfigureDependenciesCall extends ethereum.Call {
  get inputs(): ConfigureDependenciesCall__Inputs {
    return new ConfigureDependenciesCall__Inputs(this);
  }

  get outputs(): ConfigureDependenciesCall__Outputs {
    return new ConfigureDependenciesCall__Outputs(this);
  }
}

export class ConfigureDependenciesCall__Inputs {
  _call: ConfigureDependenciesCall;

  constructor(call: ConfigureDependenciesCall) {
    this._call = call;
  }
}

export class ConfigureDependenciesCall__Outputs {
  _call: ConfigureDependenciesCall;

  constructor(call: ConfigureDependenciesCall) {
    this._call = call;
  }

  get dependencies(): Array<Bytes> {
    return this._call.outputValues[0].value.toBytesArray();
  }
}

export class DefundCall extends ethereum.Call {
  get inputs(): DefundCall__Inputs {
    return new DefundCall__Inputs(this);
  }

  get outputs(): DefundCall__Outputs {
    return new DefundCall__Outputs(this);
  }
}

export class DefundCall__Inputs {
  _call: DefundCall;

  constructor(call: DefundCall) {
    this._call = call;
  }

  get token_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class DefundCall__Outputs {
  _call: DefundCall;

  constructor(call: DefundCall) {
    this._call = call;
  }
}

export class EmergencyShutdownCall extends ethereum.Call {
  get inputs(): EmergencyShutdownCall__Inputs {
    return new EmergencyShutdownCall__Inputs(this);
  }

  get outputs(): EmergencyShutdownCall__Outputs {
    return new EmergencyShutdownCall__Outputs(this);
  }
}

export class EmergencyShutdownCall__Inputs {
  _call: EmergencyShutdownCall;

  constructor(call: EmergencyShutdownCall) {
    this._call = call;
  }
}

export class EmergencyShutdownCall__Outputs {
  _call: EmergencyShutdownCall;

  constructor(call: EmergencyShutdownCall) {
    this._call = call;
  }
}

export class ExtendLoanCall extends ethereum.Call {
  get inputs(): ExtendLoanCall__Inputs {
    return new ExtendLoanCall__Inputs(this);
  }

  get outputs(): ExtendLoanCall__Outputs {
    return new ExtendLoanCall__Outputs(this);
  }
}

export class ExtendLoanCall__Inputs {
  _call: ExtendLoanCall;

  constructor(call: ExtendLoanCall) {
    this._call = call;
  }

  get cooler_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get loanID_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get times_(): i32 {
    return this._call.inputValues[2].value.toI32();
  }
}

export class ExtendLoanCall__Outputs {
  _call: ExtendLoanCall;

  constructor(call: ExtendLoanCall) {
    this._call = call;
  }
}

export class LendToCoolerCall extends ethereum.Call {
  get inputs(): LendToCoolerCall__Inputs {
    return new LendToCoolerCall__Inputs(this);
  }

  get outputs(): LendToCoolerCall__Outputs {
    return new LendToCoolerCall__Outputs(this);
  }
}

export class LendToCoolerCall__Inputs {
  _call: LendToCoolerCall;

  constructor(call: LendToCoolerCall) {
    this._call = call;
  }

  get cooler_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class LendToCoolerCall__Outputs {
  _call: LendToCoolerCall;

  constructor(call: LendToCoolerCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class OnDefaultCall extends ethereum.Call {
  get inputs(): OnDefaultCall__Inputs {
    return new OnDefaultCall__Inputs(this);
  }

  get outputs(): OnDefaultCall__Outputs {
    return new OnDefaultCall__Outputs(this);
  }
}

export class OnDefaultCall__Inputs {
  _call: OnDefaultCall;

  constructor(call: OnDefaultCall) {
    this._call = call;
  }

  get loanID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get principle(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get interest(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get collateral(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class OnDefaultCall__Outputs {
  _call: OnDefaultCall;

  constructor(call: OnDefaultCall) {
    this._call = call;
  }
}

export class OnRepayCall extends ethereum.Call {
  get inputs(): OnRepayCall__Inputs {
    return new OnRepayCall__Inputs(this);
  }

  get outputs(): OnRepayCall__Outputs {
    return new OnRepayCall__Outputs(this);
  }
}

export class OnRepayCall__Inputs {
  _call: OnRepayCall;

  constructor(call: OnRepayCall) {
    this._call = call;
  }

  get loanID_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get principlePaid_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get interestPaid_(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class OnRepayCall__Outputs {
  _call: OnRepayCall;

  constructor(call: OnRepayCall) {
    this._call = call;
  }
}

export class RebalanceCall extends ethereum.Call {
  get inputs(): RebalanceCall__Inputs {
    return new RebalanceCall__Inputs(this);
  }

  get outputs(): RebalanceCall__Outputs {
    return new RebalanceCall__Outputs(this);
  }
}

export class RebalanceCall__Inputs {
  _call: RebalanceCall;

  constructor(call: RebalanceCall) {
    this._call = call;
  }
}

export class RebalanceCall__Outputs {
  _call: RebalanceCall;

  constructor(call: RebalanceCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class SweepIntoSavingsVaultCall extends ethereum.Call {
  get inputs(): SweepIntoSavingsVaultCall__Inputs {
    return new SweepIntoSavingsVaultCall__Inputs(this);
  }

  get outputs(): SweepIntoSavingsVaultCall__Outputs {
    return new SweepIntoSavingsVaultCall__Outputs(this);
  }
}

export class SweepIntoSavingsVaultCall__Inputs {
  _call: SweepIntoSavingsVaultCall;

  constructor(call: SweepIntoSavingsVaultCall) {
    this._call = call;
  }
}

export class SweepIntoSavingsVaultCall__Outputs {
  _call: SweepIntoSavingsVaultCall;

  constructor(call: SweepIntoSavingsVaultCall) {
    this._call = call;
  }
}
