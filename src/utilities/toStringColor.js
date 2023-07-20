const toStringColor = str => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  const saturation = 50 + Math.abs(hash % 10)
  const lightness = 70 + Math.abs(hash % 10)
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  return color
}

module.exports = { toStringColor }
