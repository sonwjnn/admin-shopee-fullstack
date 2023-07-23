const fs = require('fs')

const readJsonFile = (filePath, id, token) => {
  const fileString = fs.readFileSync(filePath).toString()
  let fileObj = []

  if (fileString !== '') {
    fileObj = JSON.parse(fileString)
  }

  const userIndex = fileObj.findIndex(user => user.id === id)

  if (userIndex !== -1) {
    fileObj[userIndex].token = token
  } else {
    fileObj.push({ id: id, token: token })
  }

  const json = JSON.stringify(fileObj)
  fs.writeFileSync(filePath, json)
}

module.exports = { readJsonFile }
