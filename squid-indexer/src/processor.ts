import { EvmBatchProcessor } from '@subsquid/evm-processor'
import * as erc20abi from './abi/erc20'

export const USDC_CONTRACT
  = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'.toLowerCase()

export const USDCe_CONTRACT
  = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'.toLowerCase()
export const processor = new EvmBatchProcessor()
  .setBlockRange({
    from: 229661468,
  })
  .setGateway('https://v2.archive.subsquid.io/network/arbitrum-one')
  .setRpcEndpoint({
    url: process.env.ARBITRUM_RPC ?? 'https://arbitrum.llamarpc.com',
    rateLimit: 10,
  })
  .setFinalityConfirmation(1)
  .addLog({
    address: [USDC_CONTRACT],
    topic0: [erc20abi.events.Transfer.topic],
  })
  .addLog({
    address: [USDCe_CONTRACT],
    topic0: [erc20abi.events.Transfer.topic],
  })
