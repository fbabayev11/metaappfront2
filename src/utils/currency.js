export function detectCurrency(result, market) {
  const items = result?.items_analysis || []
  for (const item of items) {
    const raw = item.metrics_raw || {}
    for (const key of Object.keys(raw)) {
      if (key.includes('(TL)') || key.includes('(TRY)')) return { symbol: '₺', code: 'TRY' }
      if (key.includes('(AZN)')) return { symbol: '₼', code: 'AZN' }
      if (key.includes('(USD)')) return { symbol: '$', code: 'USD' }
      if (key.includes('(GBP)')) return { symbol: '£', code: 'GBP' }
      if (key.includes('(EUR)')) return { symbol: '€', code: 'EUR' }
    }
  }
  if (market === 'tr') return { symbol: '₺', code: 'TRY' }
  if (market === 'az') return { symbol: '₼', code: 'AZN' }
  return { symbol: '€', code: 'EUR' }
}

export function formatMoney(amount, currency) {
  const num = parseFloat(amount) || 0
  return `${currency.symbol}${num.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
