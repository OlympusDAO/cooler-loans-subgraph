import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
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

  const daiContract = ERC20.bind(clearinghouseContract.dai());
  const daiDecimals = daiContract.decimals();
  const sDaiContract = ERC4626.bind(clearinghouseContract.sdai());
  const sDaiDecimals = sDaiContract.decimals();

  // Calling getReserveBalance returns the raw balance of the token, plus the debt.
  // This is important, as DAI deposited in the DSR is recorded as a debt.
  // However, for each, we need to subtract the clearinghouse debt, otherwise it will be double-counted.
  const treasuryContract = getTRSRY();
  const treasuryDaiBalanceTotal = toDecimal(treasuryContract.getReserveBalance(clearinghouseContract.dai()), daiDecimals);
  const clearinghouseDaiDebt = toDecimal(treasuryContract.reserveDebt(clearinghouseContract.dai(), Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1)), daiDecimals).plus(toDecimal(treasuryContract.reserveDebt(clearinghouseContract.dai(), Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1_1)), daiDecimals));
  const treasuryDaiBalance = treasuryDaiBalanceTotal.minus(clearinghouseDaiDebt);

  const treasurySDaiBalanceInt: BigInt = treasuryContract.getReserveBalance(clearinghouseContract.sdai());
  const clearinghouseSDaiDebtInt: BigInt = treasuryContract.reserveDebt(clearinghouseContract.sdai(), Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1)).plus(treasuryContract.reserveDebt(clearinghouseContract.sdai(), Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1_1)));
  const treasurySDaiBalanceMinusClearinghouse = treasurySDaiBalanceInt.minus(clearinghouseSDaiDebtInt);
  const treasurySDaiBalance = toDecimal(treasurySDaiBalanceMinusClearinghouse, sDaiDecimals);
  const treasurySDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(treasurySDaiBalanceMinusClearinghouse), sDaiDecimals);

  return [treasuryDaiBalance, treasurySDaiBalance, treasurySDaiInDaiBalance];
}
