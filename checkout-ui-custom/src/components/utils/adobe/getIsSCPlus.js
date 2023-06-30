export function _isSCPlus(item) {
  const filter = Object.values(item.productCategories)
    .map(el => el.toLowerCase())
    .filter(el => el.match('samsung care'))

  return filter.length > 0
}
