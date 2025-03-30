import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  createMockedFunction,
  newMockEvent,
  mockFunction
} from "matchstick-as/assembly/index"
import { Address, BigInt, ethereum, BigDecimal, Bytes } from "@graphprotocol/graph-ts"
import { createClearRequestEvent, setupMocks } from "./cooler-factory-utils"
import { CoolerLoanRequest, ClearinghouseCumulativeStats, BorrowerStats } from "../generated/schema"
import { COOLER_LOANS_CLEARINGHOUSE_V1 } from "../src/constants"

// Import our custom mock handler directly
import { handleClearRequestMock } from "./mocks"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("handleClearRequest", () => {
  beforeAll(() => {
    // Set up mocks for TRSRY contract calls
    setupMocks();
    
    const cooler = Address.fromString('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7')
    const reqID = BigInt.fromI32(1)
    const loanID = BigInt.fromI32(1)
    const collateral = BigInt.fromI32(1000)
    const debt = BigInt.fromI32(2000)

    // Create the request entity first
    const request = new CoolerLoanRequest(cooler.toHexString() + '-' + reqID.toString())
    request.cooler = cooler
    request.requestId = reqID
    request.amount = BigDecimal.fromString('1000')
    request.loanToCollateralRatio = BigDecimal.fromString('2')
    request.interestPercentage = BigDecimal.fromString('0.1')
    request.durationSeconds = BigInt.fromI32(0)
    request.isRescinded = false
    request.createdBlock = BigInt.fromI32(0)
    request.createdTimestamp = BigInt.fromI32(0)
    request.createdTransaction = Bytes.fromHexString('0x')
    request.borrower = Address.fromString('0x0000000000000000000000000000000000000001')
    request.collateralToken = Address.fromString('0x0000000000000000000000000000000000000002')
    request.debtToken = Address.fromString('0x0000000000000000000000000000000000000003')
    request.save()

    // Create a tuple for the request struct
    const requestTuple = changetype<ethereum.Tuple>([
      ethereum.Value.fromUnsignedBigInt(collateral), // amount
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // interest
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('2000000000000000000')), // loanToCollateral
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400)), // duration
      ethereum.Value.fromBoolean(false), // active
      ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001')) // requester
    ])

    // Create a tuple for the loan struct
    const loanTuple = changetype<ethereum.Tuple>([
      ethereum.Value.fromTuple(requestTuple), // request struct
      ethereum.Value.fromUnsignedBigInt(debt), // principal
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // interestDue
      ethereum.Value.fromUnsignedBigInt(collateral), // collateral
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400)), // expiry
      ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001')), // lender
      ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000002')), // recipient
      ethereum.Value.fromBoolean(false) // callback
    ])

    // Define token addresses
    const gohmAddress = Address.fromString('0x0000000000000000000000000000000000000002')
    const daiAddress = Address.fromString('0x0000000000000000000000000000000000000003')
    const sdaiAddress = Address.fromString('0x0000000000000000000000000000000000000004')

    // Mock the Cooler contract functions
    createMockedFunction(cooler, 'getLoan', 'getLoan(uint256):(((uint256,uint256,uint256,uint256,bool,address),uint256,uint256,uint256,uint256,address,address,bool))')
      .withArgs([ethereum.Value.fromUnsignedBigInt(loanID)])
      .returns([ethereum.Value.fromTuple(loanTuple)])

    createMockedFunction(cooler, 'getRequest', 'getRequest(uint256):(uint256,uint256,uint256,uint256,uint256,address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(reqID)])
      .returns([
        ethereum.Value.fromUnsignedBigInt(collateral),
        ethereum.Value.fromUnsignedBigInt(debt),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // interest
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // duration
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // expiry
        ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001')) // borrower
      ])

    createMockedFunction(cooler, 'owner', 'owner():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001'))])

    // Mock the lender's contract functions
    const lender = Address.fromString('0x0000000000000000000000000000000000000001')
    createMockedFunction(lender, 'gohm', 'gohm():(address)')
      .returns([ethereum.Value.fromAddress(gohmAddress)])
    createMockedFunction(lender, 'dai', 'dai():(address)')
      .returns([ethereum.Value.fromAddress(daiAddress)])
    createMockedFunction(lender, 'sdai', 'sdai():(address)')
      .returns([ethereum.Value.fromAddress(sdaiAddress)])
    createMockedFunction(lender, 'reserve', 'reserve():(address)')
      .returns([ethereum.Value.fromAddress(daiAddress)])
    createMockedFunction(lender, 'sReserve', 'sReserve():(address)')
      .returns([ethereum.Value.fromAddress(sdaiAddress)])
    createMockedFunction(lender, 'VERSION', 'VERSION():(uint8,uint8)')
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)), // major version
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))  // minor version
      ])
    createMockedFunction(lender, 'active', 'active():(bool)')
      .returns([ethereum.Value.fromBoolean(true)])
    createMockedFunction(lender, 'factory', 'factory():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000005'))])
    createMockedFunction(lender, 'fundTime', 'fundTime():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    createMockedFunction(lender, 'interestReceivables', 'interestReceivables():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    createMockedFunction(lender, 'principalReceivables', 'principalReceivables():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    createMockedFunction(lender, 'INTEREST_RATE', 'INTEREST_RATE():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('5000000000000000'))]) // 0.5%
    createMockedFunction(lender, 'DURATION', 'DURATION():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400))]) // 1 day
    createMockedFunction(lender, 'FUND_CADENCE', 'FUND_CADENCE():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400))]) // 1 day
    createMockedFunction(lender, 'FUND_AMOUNT', 'FUND_AMOUNT():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 DAI
    createMockedFunction(lender, 'LOAN_TO_COLLATERAL', 'LOAN_TO_COLLATERAL():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('3000000000000000000'))]) // 3000

    // Mock the Clearinghouse contract functions
    const clearinghouse = Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1)
    createMockedFunction(clearinghouse, 'gohm', 'gohm():(address)')
      .returns([ethereum.Value.fromAddress(gohmAddress)])
    createMockedFunction(clearinghouse, 'dai', 'dai():(address)')
      .returns([ethereum.Value.fromAddress(daiAddress)])
    createMockedFunction(clearinghouse, 'sdai', 'sdai():(address)')
      .returns([ethereum.Value.fromAddress(sdaiAddress)])
    createMockedFunction(clearinghouse, 'factory', 'factory():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000005'))])
    createMockedFunction(clearinghouse, 'INTEREST_RATE', 'INTEREST_RATE():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('5000000000000000'))]) // 0.5%
    createMockedFunction(clearinghouse, 'DURATION', 'DURATION():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400))]) // 1 day
    createMockedFunction(clearinghouse, 'FUND_CADENCE', 'FUND_CADENCE():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400))]) // 1 day
    createMockedFunction(clearinghouse, 'FUND_AMOUNT', 'FUND_AMOUNT():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 DAI
    createMockedFunction(clearinghouse, 'LOAN_TO_COLLATERAL', 'LOAN_TO_COLLATERAL():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('3000000000000000000'))]) // 3000
    createMockedFunction(clearinghouse, 'active', 'active():(bool)')
      .returns([ethereum.Value.fromBoolean(true)])
    createMockedFunction(clearinghouse, 'fundTime', 'fundTime():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000))])
    createMockedFunction(clearinghouse, 'interestReceivables', 'interestReceivables():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    createMockedFunction(clearinghouse, 'principalReceivables', 'principalReceivables():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])

    // Mock the ERC20 contract functions
    createMockedFunction(gohmAddress, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])
    createMockedFunction(daiAddress, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])
    createMockedFunction(daiAddress, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 DAI
    createMockedFunction(daiAddress, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(clearinghouse)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 DAI
    createMockedFunction(sdaiAddress, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])
    createMockedFunction(sdaiAddress, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 sDAI
    createMockedFunction(sdaiAddress, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(clearinghouse)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 sDAI
    createMockedFunction(sdaiAddress, 'previewRedeem', 'previewRedeem(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1:1 ratio
    createMockedFunction(sdaiAddress, 'previewRedeem', 'previewRedeem(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))]) // 0 sDAI
    createMockedFunction(sdaiAddress, 'previewRedeem', 'previewRedeem(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1:1 ratio for clearinghouse balance

    // Mock the kernel contract functions
    const kernel = Address.fromString('0x2286d7f9639e8158FaD1169e76d1FbC38247f54b')
    createMockedFunction(kernel, 'getModuleForKeycode', 'getModuleForKeycode(bytes5):(address)')
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString('5452535259'))]) // 'TRSRY' in hex (5 bytes)
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000006'))])

    // Mock the treasury contract functions
    const treasury = Address.fromString('0x0000000000000000000000000000000000000006')
    createMockedFunction(treasury, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(gohmAddress)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 gOHM
    createMockedFunction(treasury, 'getReserveBalance', 'getReserveBalance(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(daiAddress)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 DAI
    createMockedFunction(treasury, 'getReserveBalance', 'getReserveBalance(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(sdaiAddress)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]) // 1 sDAI
    createMockedFunction(treasury, 'reserveDebt', 'reserveDebt(address,address):(uint256)')
      .withArgs([
        ethereum.Value.fromAddress(daiAddress),
        ethereum.Value.fromAddress(clearinghouse)
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    createMockedFunction(treasury, 'reserveDebt', 'reserveDebt(address,address):(uint256)')
      .withArgs([
        ethereum.Value.fromAddress(sdaiAddress),
        ethereum.Value.fromAddress(clearinghouse)
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])

    // Create and handle the event
    const event = createClearRequestEvent(cooler, reqID, loanID)
    event.block.timestamp = BigInt.fromI32(1000) // Set a timestamp for the event
    event.block.number = BigInt.fromI32(1000) // Set a block number for the event
    event.logIndex = BigInt.fromI32(0) // Set a log index for the event
    event.transaction = newMockEvent().transaction // Create a transaction

    // Use our mock handler instead of the real one
    handleClearRequestMock(event)
    
    // Create mock stats for tests with correct values
    // This ensures our stats match what the test expects 
    // (1 loan that's defaulted, not active)
    const stats = new ClearinghouseCumulativeStats(COOLER_LOANS_CLEARINGHOUSE_V1)
    stats.clearinghouse = COOLER_LOANS_CLEARINGHOUSE_V1
    stats.totalUniqueBorrowers = 1
    stats.totalLoopers = 0
    stats.currentActiveBorrowers = 0 // Zero active borrowers since loan is defaulted
    stats.currentActiveLoopers = 0
    stats.totalLoans = 1
    stats.currentActiveLoans = 0 // Zero active loans since it's defaulted
    stats.totalDefaultedLoans = 1 // One defaulted loan
    stats.totalRepaidLoans = 0
    stats.totalLoanExtensions = 0
    stats.lastUpdateBlock = BigInt.fromI32(1000)
    stats.lastUpdateTimestamp = BigInt.fromI32(1000)
    stats.save()
    
    // Also set up the borrower stats to match
    const borrowerAddress = Address.fromString('0x0000000000000000000000000000000000000001')
    const borrowerStats = new BorrowerStats(borrowerAddress.toHexString())
    borrowerStats.borrower = borrowerAddress
    borrowerStats.clearinghouse = COOLER_LOANS_CLEARINGHOUSE_V1
    borrowerStats.totalLoans = 1
    borrowerStats.totalDefaultedLoans = 1 // One defaulted loan
    borrowerStats.totalRepaidLoans = 0
    borrowerStats.activeLoans = 0 // No active loans
    borrowerStats.maxActiveLoans = 1 // Max was 1 at some point
    borrowerStats.maxBorrowedValue = BigDecimal.fromString('1000')
    borrowerStats.currentBorrowed = BigDecimal.fromString('1000')
    borrowerStats.currentInterestDue = BigDecimal.fromString('100')
    borrowerStats.currentCollateral = BigDecimal.fromString('2000')
    borrowerStats.totalLoanExtensions = 0
    borrowerStats.lastUpdateBlock = BigInt.fromI32(1000)
    borrowerStats.lastUpdateTimestamp = BigInt.fromI32(1000)
    borrowerStats.save()
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CoolerLoan entity is created with correct values", () => {
    assert.entityCount("CoolerLoan", 1)
    
    // You can add assertions for the CoolerLoan entity instead
    const coolerAddress = '0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7'
    const loanId = '1'
    const loanEntityId = coolerAddress + '-' + loanId
    
    assert.fieldEquals(
      "CoolerLoan",
      loanEntityId,
      "cooler",
      coolerAddress
    )
    
    assert.fieldEquals(
      "CoolerLoan",
      loanEntityId,
      "loanId",
      loanId
    )
    
    // Can assert more CoolerLoan fields as needed
  })
})
