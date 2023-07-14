const toStringDate = {
  dmy: string => {
    const [year, month, day] = string.toISOString().substring(0, 10).split('-')
    return `${day}-${month}-${year}`
  },
  ymd: string => {
    const [year, month, day] = string.toISOString().substring(0, 10).split('-')
    return `${year}-${month}-${day}`
  }
}

module.exports = { toStringDate }
