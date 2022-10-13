module.exports.debounce = (func, wait) => {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

module.exports.formatCurrency = (_locale, _currency, _value) => {
  const price = _value / 100

  new Intl.NumberFormat(_locale, {
    style: 'currency',
    currency: _currency,
  }).format(price)

  return price
}

module.exports.formatCurrencyBRL = (_value, _division = true) => {
  const price = (_value / (_division ? 100 : 1)).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return price
}
