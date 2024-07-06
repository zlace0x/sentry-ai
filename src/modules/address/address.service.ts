import { config } from '#root/config.js'

export async function getAddressBalances(address: string, chain_id = 42161) {
  if (!config.CHAINBASE_API_KEY) {
    throw new Error('Missing CHAINBASE_API_KEY in config')
  }
  const res = await fetch(
    `https://api.chainbase.online/v1/account/tokens?chain_id=${chain_id}&address=${address}`,
    {
      method: 'GET',
      headers: { 'x-api-key': config.CHAINBASE_API_KEY },
    },
  )

  const { data } = await res.json()

  if (data) {
    return data.map(
      (token: any) =>
        `${token.symbol}, ${token.name}, Balance: ${token.balance}, value: ${
          token.current_usd_price ?? 'unknown'
        }`,
    )
  }
}
