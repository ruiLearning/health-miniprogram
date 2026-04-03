// pages/masters/detail/detail.js
const { ARTICLES } = require('../masters.js')

Page({
  data: {
    article: null
  },

  onLoad(options) {
    const id = Number(options.id)
    const article = ARTICLES.find(a => a.id === id)
    if (article) {
      wx.setNavigationBarTitle({ title: article.author + ' · ' + article.platform })
      this.setData({ article })
    }
  }
})
