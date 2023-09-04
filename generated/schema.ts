// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class CoolerLoanRequest extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CoolerLoanRequest entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CoolerLoanRequest must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CoolerLoanRequest", id.toString(), this);
    }
  }

  static loadInBlock(id: string): CoolerLoanRequest | null {
    return changetype<CoolerLoanRequest | null>(
      store.get_in_block("CoolerLoanRequest", id)
    );
  }

  static load(id: string): CoolerLoanRequest | null {
    return changetype<CoolerLoanRequest | null>(
      store.get("CoolerLoanRequest", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get createdBlock(): BigInt {
    let value = this.get("createdBlock");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdBlock(value: BigInt) {
    this.set("createdBlock", Value.fromBigInt(value));
  }

  get createdTimestamp(): BigInt {
    let value = this.get("createdTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdTimestamp(value: BigInt) {
    this.set("createdTimestamp", Value.fromBigInt(value));
  }

  get createdTransaction(): Bytes {
    let value = this.get("createdTransaction");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set createdTransaction(value: Bytes) {
    this.set("createdTransaction", Value.fromBytes(value));
  }

  get cooler(): Bytes {
    let value = this.get("cooler");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set cooler(value: Bytes) {
    this.set("cooler", Value.fromBytes(value));
  }

  get requestId(): BigInt {
    let value = this.get("requestId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set requestId(value: BigInt) {
    this.set("requestId", Value.fromBigInt(value));
  }

  get borrower(): Bytes {
    let value = this.get("borrower");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set borrower(value: Bytes) {
    this.set("borrower", Value.fromBytes(value));
  }

  get collateralToken(): Bytes {
    let value = this.get("collateralToken");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set collateralToken(value: Bytes) {
    this.set("collateralToken", Value.fromBytes(value));
  }

  get debtToken(): Bytes {
    let value = this.get("debtToken");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set debtToken(value: Bytes) {
    this.set("debtToken", Value.fromBytes(value));
  }

  get amount(): BigDecimal {
    let value = this.get("amount");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set amount(value: BigDecimal) {
    this.set("amount", Value.fromBigDecimal(value));
  }

  get interestPercentage(): BigDecimal {
    let value = this.get("interestPercentage");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set interestPercentage(value: BigDecimal) {
    this.set("interestPercentage", Value.fromBigDecimal(value));
  }

  get loanToCollateralRatio(): BigDecimal {
    let value = this.get("loanToCollateralRatio");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set loanToCollateralRatio(value: BigDecimal) {
    this.set("loanToCollateralRatio", Value.fromBigDecimal(value));
  }

  get durationSeconds(): BigInt {
    let value = this.get("durationSeconds");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set durationSeconds(value: BigInt) {
    this.set("durationSeconds", Value.fromBigInt(value));
  }

  get isRescinded(): boolean {
    let value = this.get("isRescinded");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set isRescinded(value: boolean) {
    this.set("isRescinded", Value.fromBoolean(value));
  }

  get requestEvents(): RequestLoanEventLoader {
    return new RequestLoanEventLoader(
      "CoolerLoanRequest",
      this.get("id")!.toString(),
      "requestEvents"
    );
  }

  get rescindEvents(): RescindLoanRequestEventLoader {
    return new RescindLoanRequestEventLoader(
      "CoolerLoanRequest",
      this.get("id")!.toString(),
      "rescindEvents"
    );
  }

  get clearEvents(): ClearLoanRequestEventLoader {
    return new ClearLoanRequestEventLoader(
      "CoolerLoanRequest",
      this.get("id")!.toString(),
      "clearEvents"
    );
  }

  get loans(): CoolerLoanLoader {
    return new CoolerLoanLoader(
      "CoolerLoanRequest",
      this.get("id")!.toString(),
      "loans"
    );
  }
}

export class CoolerLoan extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CoolerLoan entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CoolerLoan must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CoolerLoan", id.toString(), this);
    }
  }

  static loadInBlock(id: string): CoolerLoan | null {
    return changetype<CoolerLoan | null>(store.get_in_block("CoolerLoan", id));
  }

  static load(id: string): CoolerLoan | null {
    return changetype<CoolerLoan | null>(store.get("CoolerLoan", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get createdBlock(): BigInt {
    let value = this.get("createdBlock");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdBlock(value: BigInt) {
    this.set("createdBlock", Value.fromBigInt(value));
  }

  get createdTimestamp(): BigInt {
    let value = this.get("createdTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdTimestamp(value: BigInt) {
    this.set("createdTimestamp", Value.fromBigInt(value));
  }

  get createdTransaction(): Bytes {
    let value = this.get("createdTransaction");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set createdTransaction(value: Bytes) {
    this.set("createdTransaction", Value.fromBytes(value));
  }

  get cooler(): Bytes {
    let value = this.get("cooler");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set cooler(value: Bytes) {
    this.set("cooler", Value.fromBytes(value));
  }

  get request(): string {
    let value = this.get("request");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set request(value: string) {
    this.set("request", Value.fromString(value));
  }

  get loanId(): BigInt {
    let value = this.get("loanId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set loanId(value: BigInt) {
    this.set("loanId", Value.fromBigInt(value));
  }

  get borrower(): Bytes {
    let value = this.get("borrower");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set borrower(value: Bytes) {
    this.set("borrower", Value.fromBytes(value));
  }

  get lender(): Bytes {
    let value = this.get("lender");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set lender(value: Bytes) {
    this.set("lender", Value.fromBytes(value));
  }

  get amount(): BigDecimal {
    let value = this.get("amount");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set amount(value: BigDecimal) {
    this.set("amount", Value.fromBigDecimal(value));
  }

  get interest(): BigDecimal {
    let value = this.get("interest");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set interest(value: BigDecimal) {
    this.set("interest", Value.fromBigDecimal(value));
  }

  get principal(): BigDecimal {
    let value = this.get("principal");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set principal(value: BigDecimal) {
    this.set("principal", Value.fromBigDecimal(value));
  }

  get unclaimed(): BigDecimal {
    let value = this.get("unclaimed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set unclaimed(value: BigDecimal) {
    this.set("unclaimed", Value.fromBigDecimal(value));
  }

  get collateral(): BigDecimal {
    let value = this.get("collateral");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateral(value: BigDecimal) {
    this.set("collateral", Value.fromBigDecimal(value));
  }

  get expiryTimestamp(): BigInt {
    let value = this.get("expiryTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set expiryTimestamp(value: BigInt) {
    this.set("expiryTimestamp", Value.fromBigInt(value));
  }

  get repayDirect(): boolean {
    let value = this.get("repayDirect");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set repayDirect(value: boolean) {
    this.set("repayDirect", Value.fromBoolean(value));
  }

  get hasCallback(): boolean {
    let value = this.get("hasCallback");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set hasCallback(value: boolean) {
    this.set("hasCallback", Value.fromBoolean(value));
  }

  get collateralToken(): Bytes {
    let value = this.get("collateralToken");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set collateralToken(value: Bytes) {
    this.set("collateralToken", Value.fromBytes(value));
  }

  get debtToken(): Bytes {
    let value = this.get("debtToken");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set debtToken(value: Bytes) {
    this.set("debtToken", Value.fromBytes(value));
  }

  get creationEvents(): ClearLoanRequestEventLoader {
    return new ClearLoanRequestEventLoader(
      "CoolerLoan",
      this.get("id")!.toString(),
      "creationEvents"
    );
  }

  get defaultedClaimEvents(): ClaimDefaultedLoanEventLoader {
    return new ClaimDefaultedLoanEventLoader(
      "CoolerLoan",
      this.get("id")!.toString(),
      "defaultedClaimEvents"
    );
  }

  get repaymentEvents(): RepayLoanEventLoader {
    return new RepayLoanEventLoader(
      "CoolerLoan",
      this.get("id")!.toString(),
      "repaymentEvents"
    );
  }

  get rolloverEvents(): RollLoanEventLoader {
    return new RollLoanEventLoader(
      "CoolerLoan",
      this.get("id")!.toString(),
      "rolloverEvents"
    );
  }
}

export class RequestLoanEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save RequestLoanEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type RequestLoanEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("RequestLoanEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): RequestLoanEvent | null {
    return changetype<RequestLoanEvent | null>(
      store.get_in_block("RequestLoanEvent", id)
    );
  }

  static load(id: string): RequestLoanEvent | null {
    return changetype<RequestLoanEvent | null>(
      store.get("RequestLoanEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get request(): string {
    let value = this.get("request");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set request(value: string) {
    this.set("request", Value.fromString(value));
  }
}

export class RescindLoanRequestEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save RescindLoanRequestEvent entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type RescindLoanRequestEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("RescindLoanRequestEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): RescindLoanRequestEvent | null {
    return changetype<RescindLoanRequestEvent | null>(
      store.get_in_block("RescindLoanRequestEvent", id)
    );
  }

  static load(id: string): RescindLoanRequestEvent | null {
    return changetype<RescindLoanRequestEvent | null>(
      store.get("RescindLoanRequestEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get request(): string {
    let value = this.get("request");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set request(value: string) {
    this.set("request", Value.fromString(value));
  }
}

export class ClearLoanRequestEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save ClearLoanRequestEvent entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ClearLoanRequestEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ClearLoanRequestEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): ClearLoanRequestEvent | null {
    return changetype<ClearLoanRequestEvent | null>(
      store.get_in_block("ClearLoanRequestEvent", id)
    );
  }

  static load(id: string): ClearLoanRequestEvent | null {
    return changetype<ClearLoanRequestEvent | null>(
      store.get("ClearLoanRequestEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get request(): string {
    let value = this.get("request");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set request(value: string) {
    this.set("request", Value.fromString(value));
  }

  get loan(): string {
    let value = this.get("loan");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set loan(value: string) {
    this.set("loan", Value.fromString(value));
  }
}

export class ClaimDefaultedLoanEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save ClaimDefaultedLoanEvent entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ClaimDefaultedLoanEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ClaimDefaultedLoanEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): ClaimDefaultedLoanEvent | null {
    return changetype<ClaimDefaultedLoanEvent | null>(
      store.get_in_block("ClaimDefaultedLoanEvent", id)
    );
  }

  static load(id: string): ClaimDefaultedLoanEvent | null {
    return changetype<ClaimDefaultedLoanEvent | null>(
      store.get("ClaimDefaultedLoanEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get loan(): string {
    let value = this.get("loan");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set loan(value: string) {
    this.set("loan", Value.fromString(value));
  }

  get secondsSinceExpiry(): BigInt {
    let value = this.get("secondsSinceExpiry");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set secondsSinceExpiry(value: BigInt) {
    this.set("secondsSinceExpiry", Value.fromBigInt(value));
  }

  get collateralQuantityClaimed(): BigDecimal {
    let value = this.get("collateralQuantityClaimed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralQuantityClaimed(value: BigDecimal) {
    this.set("collateralQuantityClaimed", Value.fromBigDecimal(value));
  }

  get collateralPrice(): BigDecimal {
    let value = this.get("collateralPrice");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralPrice(value: BigDecimal) {
    this.set("collateralPrice", Value.fromBigDecimal(value));
  }

  get collateralValueClaimed(): BigDecimal {
    let value = this.get("collateralValueClaimed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralValueClaimed(value: BigDecimal) {
    this.set("collateralValueClaimed", Value.fromBigDecimal(value));
  }

  get collateralIncome(): BigDecimal {
    let value = this.get("collateralIncome");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralIncome(value: BigDecimal) {
    this.set("collateralIncome", Value.fromBigDecimal(value));
  }
}

export class RepayLoanEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save RepayLoanEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type RepayLoanEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("RepayLoanEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): RepayLoanEvent | null {
    return changetype<RepayLoanEvent | null>(
      store.get_in_block("RepayLoanEvent", id)
    );
  }

  static load(id: string): RepayLoanEvent | null {
    return changetype<RepayLoanEvent | null>(store.get("RepayLoanEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get loan(): string {
    let value = this.get("loan");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set loan(value: string) {
    this.set("loan", Value.fromString(value));
  }

  get secondsToExpiry(): BigInt {
    let value = this.get("secondsToExpiry");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set secondsToExpiry(value: BigInt) {
    this.set("secondsToExpiry", Value.fromBigInt(value));
  }

  get loanPayable(): BigDecimal {
    let value = this.get("loanPayable");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set loanPayable(value: BigDecimal) {
    this.set("loanPayable", Value.fromBigDecimal(value));
  }

  get collateralDeposited(): BigDecimal {
    let value = this.get("collateralDeposited");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set collateralDeposited(value: BigDecimal) {
    this.set("collateralDeposited", Value.fromBigDecimal(value));
  }

  get repaidUnclaimed(): BigDecimal {
    let value = this.get("repaidUnclaimed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set repaidUnclaimed(value: BigDecimal) {
    this.set("repaidUnclaimed", Value.fromBigDecimal(value));
  }

  get amountPaid(): BigDecimal {
    let value = this.get("amountPaid");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set amountPaid(value: BigDecimal) {
    this.set("amountPaid", Value.fromBigDecimal(value));
  }

  get interestIncome(): BigDecimal {
    let value = this.get("interestIncome");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set interestIncome(value: BigDecimal) {
    this.set("interestIncome", Value.fromBigDecimal(value));
  }
}

export class RollLoanEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save RollLoanEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type RollLoanEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("RollLoanEvent", id.toString(), this);
    }
  }

  static loadInBlock(id: string): RollLoanEvent | null {
    return changetype<RollLoanEvent | null>(
      store.get_in_block("RollLoanEvent", id)
    );
  }

  static load(id: string): RollLoanEvent | null {
    return changetype<RollLoanEvent | null>(store.get("RollLoanEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get loan(): string {
    let value = this.get("loan");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set loan(value: string) {
    this.set("loan", Value.fromString(value));
  }

  get newDebtQuantity(): BigDecimal {
    let value = this.get("newDebtQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set newDebtQuantity(value: BigDecimal) {
    this.set("newDebtQuantity", Value.fromBigDecimal(value));
  }

  get newCollateralQuantity(): BigDecimal {
    let value = this.get("newCollateralQuantity");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set newCollateralQuantity(value: BigDecimal) {
    this.set("newCollateralQuantity", Value.fromBigDecimal(value));
  }

  get newExpiryTimestamp(): BigInt {
    let value = this.get("newExpiryTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set newExpiryTimestamp(value: BigInt) {
    this.set("newExpiryTimestamp", Value.fromBigInt(value));
  }
}

export class RequestLoanEventLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): RequestLoanEvent[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<RequestLoanEvent[]>(value);
  }
}

export class RescindLoanRequestEventLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): RescindLoanRequestEvent[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<RescindLoanRequestEvent[]>(value);
  }
}

export class ClearLoanRequestEventLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): ClearLoanRequestEvent[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<ClearLoanRequestEvent[]>(value);
  }
}

export class CoolerLoanLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): CoolerLoan[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<CoolerLoan[]>(value);
  }
}

export class ClaimDefaultedLoanEventLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): ClaimDefaultedLoanEvent[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<ClaimDefaultedLoanEvent[]>(value);
  }
}

export class RepayLoanEventLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): RepayLoanEvent[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<RepayLoanEvent[]>(value);
  }
}

export class RollLoanEventLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): RollLoanEvent[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<RollLoanEvent[]>(value);
  }
}
