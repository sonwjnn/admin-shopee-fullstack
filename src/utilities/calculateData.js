const calculateData = async (pageNumber, model, name) => {
  const limit = 8
  const obj_find = {}

  if (name && name !== undefined) {
    const regex = new RegExp(`(${name})`, 'i')
    obj_find.name = { $regex: regex }
  }

  const sumData = await model.find(obj_find)
  const sumPage = Math.ceil(sumData.length / limit)

  if (!pageNumber || pageNumber < 1) {
    pageNumber = 1
  }

  if (pageNumber > sumPage && sumPage !== 0) {
    pageNumber = sumPage
  }

  const skip = (pageNumber - 1) * limit

  return { skip, limit, obj_find, sumPage, pageNumber }
}

module.exports = calculateData
