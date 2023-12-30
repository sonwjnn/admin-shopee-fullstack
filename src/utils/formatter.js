const formatPriceToVND = price => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  })
  return formatter.format(price)
}
const toStringDate = {
  dmy: string => {
    if (!string) return ''
    if (string instanceof Date) {
      const [year, month, day] = string
        .toISOString()
        .substring(0, 10)
        .split('-')
      return `${day}-${month}-${year}`
    } else {
      const [year, month, day] = string.substring(0, 10).split('-')
      return `${day}-${month}-${year}`
    }
  },
  ymd: string => {
    if (!string) return ''
    if (string instanceof Date) {
      const [year, month, day] = string
        .toISOString()
        .substring(0, 10)
        .split('-')
      return `${year}-${month}-${day}`
    } else {
      const [year, month, day] = string.substring(0, 10).split('-')
      return `${year}-${month}-${day}`
    }
  }
}

module.exports = { formatPriceToVND, toStringDate }
