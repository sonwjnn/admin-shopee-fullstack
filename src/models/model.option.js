const modelOptions = {
  toJSON: {
    virtuals: true,
    transforms: (_, obj) => {
      delete obj._id
      return obj
    }
  },
  toObject: {
    virtuals: true,
    transforms: (_, obj) => {
      delete obj._id
      return obj
    }
  },
  versionKey: false,
  timestamps: true
}

module.exports = modelOptions
