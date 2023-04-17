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

module.exports.formatCurrencyBRL = (_value, _division = true) => {
  const price = (_value / (_division ? 100 : 1)).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return price
}

module.exports.formatNegativeValue = _value => {
  let price = _value.replace('-', '')

  price = price.replace(' ', ' - ')

  return price
}

module.exports.formatNumberBRL = _value =>
  new Intl.NumberFormat('pt-BR').format(_value)
