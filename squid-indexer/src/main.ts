import { Database, LocalDest } from '@subsquid/file-store'
import { Column, Table, Types, dialects } from '@subsquid/file-store-csv'
import * as erc20abi from './abi/erc20'

import { USDC_CONTRACT, USDCe_CONTRACT, processor } from './processor'

const dbOptions = {
  tables: {
    TransfersTable: new Table(
      'transfers.tsv',
      {
        from: Column(Types.String()),
        to: Column(Types.String()),
        value: Column(Types.Numeric()),
      },
      {
        dialect: dialects.excelTab,
        header: true,
      },
    ),
  },
  dest: new LocalDest('./data'),
  chunkSizeMb: 10,
  // Explicitly keeping the default value of syncIntervalBlocks (infinity).
  // Make sure to use a finite value here if your output data rate is low!
  // More details here:
  // https://docs.subsquid.io/store/file-store/overview/#filesystem-syncs-and-dataset-partitioning
  syncIntervalBlocks: undefined,
}

// TODO: change to dynamic wallets from bot
const wallets = ['0x865f1EB534a48DDBC8457C63eAd1E898C7DfD70E']

processor.run(new Database(dbOptions), async (ctx: any) => {
  for (const block of ctx.blocks) {
    for (const log of block.logs) {
      if (
        log.address === USDC_CONTRACT
        || (log.address === USDCe_CONTRACT
        && log.topics[0] === erc20abi.events.Transfer.topic)
      ) {
        const { from, to, value } = erc20abi.events.Transfer.decode(log)
        ctx.store.TransfersTable.write({ from, to, value })
      }

      let address

      if (wallets.includes(log.from)) {
        address = log.from
      }
      if (wallets.includes(log.to)) {
        address = log.to
      }

      if (address) {
        console.log(`Wallet ${address} is involved in a transaction`)

        fetch('localhost:3000/chain-event', {
          method: 'POST',
          body: JSON.stringify({
            address,
            ...log,
          }),
        })
      }
    }
  }
})
