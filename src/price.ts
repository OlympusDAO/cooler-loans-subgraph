import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { toDecimal } from "./numberHelper";
import { gOHM } from "../generated/CoolerFactory_V1/gOHM"
import { getGOhmAddress } from "./token";
import { ChainlinkPriceFeed } from "../generated/CoolerFactory_V1/ChainlinkPriceFeed";

const OHM_ETH_FEED = "0x9a72298ae3886221820B1c878d12D872087D3a23";
const ETH_USD_FEED = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

export function getEthUsdPrice(): BigDecimal | null {
    const priceFeed = ChainlinkPriceFeed.bind(Address.fromString(ETH_USD_FEED));
    const decimalsResult = priceFeed.try_decimals();
    const answerResult = priceFeed.try_latestAnswer();

    if (decimalsResult.reverted || answerResult.reverted) {
        return null;
    }

    return toDecimal(answerResult.value, decimalsResult.value);
}

function getOhmEthPrice(): BigDecimal | null {
    const priceFeed = ChainlinkPriceFeed.bind(Address.fromString(OHM_ETH_FEED));
    const decimalsResult = priceFeed.try_decimals();
    const answerResult = priceFeed.try_latestAnswer();

    if (decimalsResult.reverted || answerResult.reverted) {
        return null;
    }

    return toDecimal(answerResult.value, decimalsResult.value);
}

export function getOhmUsdPrice(): BigDecimal {
    const ethUsdPrice = getEthUsdPrice();
    const ohmEthPrice = getOhmEthPrice();

    if (ethUsdPrice === null || ohmEthPrice === null) {
        throw new Error("Failed to fetch OHM price");
    }

    return ohmEthPrice.times(ethUsdPrice);
}

export function getGOhmPrice(): BigDecimal {
    // gOHM price is OHM price * index
    const ohmPrice: BigDecimal = getOhmUsdPrice();
    const gOHMContract: gOHM = gOHM.bind(getGOhmAddress());

    return ohmPrice.times(toDecimal(gOHMContract.index(), 9));
}
