import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { Clearinghouse } from "../generated/Clearinghouse_V1/Clearinghouse";
import { ERC20 } from "../generated/Clearinghouse_V1/ERC20";
import { ERC4626 } from "../generated/Clearinghouse_v1/ERC4626";
import { getTRSRY } from "./bophades";
import { COOLER_LOANS_CLEARINGHOUSE_V1, COOLER_LOANS_CLEARINGHOUSE_V1_1 } from "./constants";
import { toDecimal } from "./numberHelper";

export function getClearinghouseBalances(clearinghouseAddress: Address): BigDecimal[] {
  const clearinghouseContract = Clearinghouse.bind(clearinghouseAddress);

  const daiContract = ERC20.bind(clearinghouseContract.dai());
  const daiDecimals = daiContract.decimals();
  const sDaiContract = ERC4626.bind(clearinghouseContract.sdai());
  const sDaiDecimals = sDaiContract.decimals();

  const daiBalance: BigDecimal = toDecimal(daiContract.balanceOf(clearinghouseAddress), daiDecimals);
  const sDaiBalanceInt = sDaiContract.balanceOf(clearinghouseAddress);
  const sDaiBalance: BigDecimal = toDecimal(sDaiBalanceInt, sDaiDecimals);
  const sDaiInDaiBalance: BigDecimal = toDecimal(sDaiContract.previewRedeem(sDaiBalanceInt), sDaiDecimals);

  return [daiBalance, sDaiBalance, sDaiInDaiBalance];
}

export function getTreasuryBalances(clearinghouseAddress: Address): BigDecimal[] {
  const clearinghouseContract = Clearinghouse.bind(clearinghouseAddress);

  const daiAddress = clearinghouseContract.dai();
  const daiContract = ERC20.bind(daiAddress);
  const daiDecimals = daiContract.decimals();
  const sDaiAddress = clearinghouseContract.sdai();
  const sDaiContract = ERC4626.bind(clearinghouseContract.sdai());
  const sDaiDecimals = sDaiContract.decimals();

  // Calling getReserveBalance returns the raw balance of the token, plus the debt.
  // This is important, as DAI deposited in the DSR is recorded as a debt.
  // However, for each, we need to subtract the clearinghouse debt, otherwise it will be double-counted.
  const treasuryContract = getTRSRY();
  const treasuryDaiReserveBalance = toDecimal(treasuryContract.getReserveBalance(daiAddress), daiDecimals);
  log.debug("treasuryDaiReserveBalance: {}", [treasuryDaiReserveBalance.toString()]);
  const clearinghouseV1DaiDebt = toDecimal(treasuryContract.reserveDebt(daiAddress, Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1)), daiDecimals);
  log.debug("clearinghouseV1DaiDebt: {}", [clearinghouseV1DaiDebt.toString()]);
  const clearinghouseV1_1DaiDebt = toDecimal(treasuryContract.reserveDebt(daiAddress, Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1_1)), daiDecimals);
  log.debug("clearinghouseV1_1DaiDebt: {}", [clearinghouseV1_1DaiDebt.toString()]);
  const treasuryDaiBalance = treasuryDaiReserveBalance.minus(clearinghouseV1DaiDebt).minus(clearinghouseV1_1DaiDebt);
  log.debug("treasuryDaiBalance: {}", [treasuryDaiBalance.toString()]);

  const treasurySDaiReserveBalanceInt: BigInt = treasuryContract.getReserveBalance(sDaiAddress);
  log.debug("treasurySDaiReserveBalance: {}", [toDecimal(treasurySDaiReserveBalanceInt, sDaiDecimals).toString()]);
  const clearinghouseV1SDaiDebtInt: BigInt = treasuryContract.reserveDebt(sDaiAddress, Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1));
  log.debug("clearinghouseV1SDaiDebt: {}", [toDecimal(clearinghouseV1SDaiDebtInt, sDaiDecimals).toString()]);
  const clearinghouseV1_1SDaiDebtInt: BigInt = treasuryContract.reserveDebt(sDaiAddress, Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1_1));
  log.debug("clearinghouseV1_1SDaiDebt: {}", [toDecimal(clearinghouseV1_1SDaiDebtInt, sDaiDecimals).toString()]);
  const treasurySDaiBalanceMinusClearinghouse = treasurySDaiReserveBalanceInt.minus(clearinghouseV1SDaiDebtInt).minus(clearinghouseV1_1SDaiDebtInt);
  const treasurySDaiBalance = toDecimal(treasurySDaiBalanceMinusClearinghouse, sDaiDecimals);
  log.debug("treasurySDaiBalance: {}", [treasurySDaiBalance.toString()]);
  const treasurySDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(treasurySDaiBalanceMinusClearinghouse), sDaiDecimals);
  log.debug("treasurySDaiInDaiBalance: {}", [treasurySDaiInDaiBalance.toString()]);

  return [treasuryDaiBalance, treasurySDaiBalance, treasurySDaiInDaiBalance];
}
