import { erc20Abi, parseEventLogs } from 'viem'

/**
 * input tx: [{"blockHash":"0x180c70e8c352454f9f63d098e05b5a5e52daff99d612b8bf1f1787450f32c2ad","blockNumber":"0xdb06ae2","contractAddress":"","cumulativeGasUsed":"0x11b4a","effectiveGasPrice":"0x989680","from":"0x865f1eb534a48ddbc8457c63ead1e898c7dfd70e","gasUsed":"0x11b4a","logs":[{"address":"0xaf88d065e77c8cc2239327c5edb3a432268e5831","blockHash":"0x180c70e8c352454f9f63d098e05b5a5e52daff99d612b8bf1f1787450f32c2ad","blockNumber":"0xdb06ae2","data":"0x00000000000000000000000000000000000000000000000000000000000f4240","logIndex":"0x0","removed":false,"topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x000000000000000000000000865f1eb534a48ddbc8457c63ead1e898c7dfd70e","0x00000000000000000000000023d68e4f3f6d2225d1f8445c18281ac87d07d791"],"transactionHash":"0xb650577c4a37fc35cb94f2152785608826fc9d5b20653f890fc012c55528182b","transactionIndex":"0x1"}],"logsBloom":"0x00000000000000100000000400000000000000000000000000000000000000000000000000000008000000000000000000000001000000000000000000000000000010000000000000000008000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002002400000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000","status":"0x1","to":"0xaf88d065e77c8cc2239327c5edb3a432268e5831","transactionHash":"0xb650577c4a37fc35cb94f2152785608826fc9d5b20653f890fc012c55528182b","transactionIndex":"0x1","type":"0x2"}]
 */
export function decodeTxReceipt(txes: any): any {
  const tx = txes[0]

  const logs = parseEventLogs({
    abi: erc20Abi,
    eventName: 'Transfer',
    logs: tx.logs,
  })
  const stringEvent = logs.map(
    log =>
      `${log.eventName} (${Number.parseInt(log.args.value.toString()) / 10 ** 6} USDC)`,
  )
  console.log('stringEvent', logs)
  return {
    address: txes[0].from,
    event: stringEvent.join(', '),
  }
  // return txes.map(decodeTxReceipt);
}

// export function decodeTxReceipt(tx: TransactionReceipt): string {
//   const logs = tx.logs;
//   for (const log of logs) {
//     return "Received (1 USDC)";
//   }
// }
