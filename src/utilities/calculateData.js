const calculateData = async (pageNumber, model, name, user) => {
  const limit = 10
  const obj_find = {}

  if (name) {
    const regex = new RegExp(`(${name})`, 'i')
    obj_find.name = { $regex: regex }
  }

  if (user && user.role !== 'admin') obj_find.user = user.id

  const count = await model.countDocuments(obj_find)
  const sumPage = Math.ceil(count / limit)

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
