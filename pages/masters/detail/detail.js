// pages/masters/detail/detail.js
const { ARTICLES } = require('../masters.js')

Page({
  data: {
    article: null,
    loadFailed: false
  },

  onLoad(options) {
    const id = Number(options.id)
    let article = ARTICLES.find(a => a.id === id)
    if (!article) {
      const cachedArticle = wx.getStorageSync('hc_master_article')
      if (cachedArticle && (!id || cachedArticle.id === id)) {
        article = cachedArticle
      }
    }
    if (article) {
      wx.setNavigationBarTitle({ title: article.author + ' · ' + article.platform })
      this.setData({ article, loadFailed: false })
      return
    }

    this.setData({ loadFailed: true })
  }
})
