const toStringDate = {
  dmy: string => {
    const dmy = string.toISOString().substring(0, 10).split('-')
    const dateString = dmy[2] + '-' + dmy[1] + '-' + dmy[0]
    return dateString
  },
  ymd: string => {
    const ymd = string.toISOString().substring(0, 10).split('-')
    const dateString = ymd[0] + '-' + ymd[1] + '-' + ymd[2]
    return dateString
  }
}

module.exports = { toStringDate }
