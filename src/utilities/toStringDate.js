const toStringDate = {
  dmy: string => {
    if (!string) return null

    const [year, month, day] = string.toISOString().substring(0, 10).split('-')
    return `${day}-${month}-${year}`
  },
  ymd: string => {
    if (!string) return null

    const [year, month, day] = string.toISOString().substring(0, 10).split('-')
    return `${year}-${month}-${day}`
  }
}

module.exports = { toStringDate }
