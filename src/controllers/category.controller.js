const responseHandler = require('../handlers/response.handler.js')

// import tmdbApi from "../tmdb/tmdb.api.js";
// import userModel from "../models/user.model.js";
// import favoriteModel from "../models/favorite.model.js";
const cateModel = require('../models/M_Categories.js')

// import tokenMiddleWare from "../middlewares/token.middleware.js";

const getList = async (req, res) => {
  try {
    // const { page } = req.query

    // const { productType, productCategory } = req.params

    const response = await cateModel.find().exec((err, data) => {
      if (err) {
        throw new Error(err)
      } else {
        res.send({ kq: 1, data, msg: 'Get all successfully.' })
      }
    })
    // return responseHandler.ok(res, response)
  } catch (error) {
    responseHandler.error(res)
  }
}

module.exports = { getList }
