class Categories {
  dequy_list(array = [], id = '', char = '') {
    var str = ''

    array.forEach(e => {
      // 1. lấy cha
      if (e.parentsID == id) {
        str += '<option value="' + e._id + '">' + char + e.name + '</option>'

        // 2. gọi con
        str += this.dequy_list(array, e._id, char + '|----- ')
      }
    })

    return str
  }

  api_category_list(array = [], id = '') {
    var json = []

    array.forEach(e => {
      if (e.parentsID == id) {
        json.push({
          name: e.name,
          slug: e.cate,
          childs: this.api_category_list(array, e._id)
        })
      }
    })

    return json
  }

  /*
        {
            'name': 'Thiết bị điện tử',
            'child': [
                {
                    "name": "Điện Thoại Di Động"
                },
                {
                    "name": "Máy tính bảng"
                }
            ]
        },
        {
            'name': 'Phụ kiện điện tử'
        }
    */
}

module.exports = Categories
