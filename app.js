// app.js
App({
  globalData: {
    today: '',
    profile: null,
    foodDB: [],
    windowWidth: 375,
  },

  onLaunch() {
    const now = new Date()
    this.globalData.today = this.formatDate(now)
    this.globalData.windowWidth = wx.getSystemInfoSync().windowWidth
    this.initProfile()
    this.initFoodDB()
    this.clearLegacySeedData()
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  initProfile() {
    const p = wx.getStorageSync('hc_profile')
    if (p) {
      this.globalData.profile = p
    } else {
      const defaultProfile = {
        name: '健康达人',
        avatarUrl: '',
        gender: 'male',
        height: 170,
        weight: 65,
        age: 25,
        kcalGoal: 2000,
        waterGoal: 8,
        activity: 1.55
      }
      this.globalData.profile = defaultProfile
      wx.setStorageSync('hc_profile', defaultProfile)
    }
  },

  initFoodDB() {
    this.globalData.foodDB = [
      // 主食
      { id: 'f01', name: '米饭', unit: '碗 (200g)', kcal: 232, carb: 50, prot: 4, fat: 0.5, cat: '主食' },
      { id: 'f12', name: '生米', unit: '份 (93g)', kcal: 321, carb: 72.1, prot: 6.7, fat: 0.7, cat: '主食', source: '谭成义' },
      { id: 'f02', name: '全麦面包', unit: '片 (35g)', kcal: 88, carb: 16, prot: 3.5, fat: 1.2, cat: '主食' },
      { id: 'f03', name: '燕麦粥', unit: '碗 (200g)', kcal: 150, carb: 27, prot: 5, fat: 2.5, cat: '主食' },
      { id: 'f09', name: '燕麦', unit: '份 (70g)', kcal: 272, carb: 46, prot: 11.9, fat: 4.8, cat: '主食', source: '谭成义' },
      { id: 'f04', name: '紫薯', unit: '个 (150g)', kcal: 129, carb: 30, prot: 1.6, fat: 0.1, cat: '主食' },
      { id: 'f10', name: '红薯', unit: '份 (300g)', kcal: 258, carb: 60, prot: 4.8, fat: 0.3, cat: '主食', source: '谭成义' },
      { id: 'f11', name: '土豆', unit: '份 (200g)', kcal: 154, carb: 34, prot: 4, fat: 0.2, cat: '主食', source: '谭成义' },
      { id: 'f13', name: '贝贝南瓜', unit: '份 (200g)', kcal: 182, carb: 44, prot: 4, fat: 0.4, cat: '主食', source: '谭成义' },
      { id: 'f05', name: '玉米', unit: '根 (150g)', kcal: 150, carb: 33, prot: 3.5, fat: 1.5, cat: '主食' },
      { id: 'f06', name: '馒头', unit: '个 (100g)', kcal: 233, carb: 47, prot: 7, fat: 1.1, cat: '主食' },
      { id: 'f07', name: '面条', unit: '碗 (200g)', kcal: 280, carb: 55, prot: 9, fat: 1.4, cat: '主食' },
      { id: 'f08', name: '糙米饭', unit: '碗 (200g)', kcal: 216, carb: 45, prot: 5, fat: 1.8, cat: '主食' },
      // 蛋白质
      { id: 'p01', name: '鸡胸肉', unit: '份 (100g)', kcal: 133, carb: 0, prot: 25, fat: 3.1, cat: '蛋白质' },
      { id: 'p02', name: '水煮蛋', unit: '个 (60g)', kcal: 78, carb: 0.6, prot: 6.5, fat: 5.1, cat: '蛋白质' },
      { id: 'p11', name: '全蛋', unit: '个 (60g)', kcal: 78, carb: 0.6, prot: 6.5, fat: 5.1, cat: '蛋白质', source: '谭成义' },
      { id: 'p03', name: '三文鱼', unit: '份 (100g)', kcal: 142, carb: 0, prot: 20, fat: 6.3, cat: '蛋白质' },
      { id: 'p12', name: '龙利鱼', unit: '份 (100g)', kcal: 83, carb: 0, prot: 17.6, fat: 1.2, cat: '蛋白质', source: '谭成义' },
      { id: 'p13', name: '巴沙鱼', unit: '份 (100g)', kcal: 90, carb: 0, prot: 17, fat: 2.2, cat: '蛋白质', source: '谭成义' },
      { id: 'p14', name: '鸡腿肉', unit: '份 (100g)', kcal: 167, carb: 0, prot: 19, fat: 10, cat: '蛋白质', source: '谭成义' },
      { id: 'p15', name: '去皮鸡腿肉', unit: '份 (100g)', kcal: 133, carb: 0, prot: 20.8, fat: 5.6, cat: '蛋白质', source: '谭成义' },
      { id: 'p04', name: '北豆腐', unit: '块 (100g)', kcal: 76, carb: 1.9, prot: 8, fat: 4.2, cat: '蛋白质' },
      { id: 'p05', name: '低脂牛奶', unit: '杯 (250ml)', kcal: 130, carb: 12, prot: 8.5, fat: 2.5, cat: '蛋白质' },
      { id: 'p06', name: '希腊酸奶', unit: '杯 (150g)', kcal: 90, carb: 5, prot: 15, fat: 0.7, cat: '蛋白质' },
      { id: 'p07', name: '牛腱子', unit: '份 (100g)', kcal: 143, carb: 0, prot: 22, fat: 6, cat: '蛋白质' },
      { id: 'p16', name: '牛肉', unit: '份 (100g)', kcal: 155, carb: 0, prot: 24, fat: 5.5, cat: '蛋白质', source: '谭成义' },
      { id: 'p08', name: '虾仁', unit: '份 (100g)', kcal: 93, carb: 0, prot: 19, fat: 1.1, cat: '蛋白质' },
      { id: 'p09', name: '猪里脊', unit: '份 (100g)', kcal: 143, carb: 0, prot: 20, fat: 7.5, cat: '蛋白质' },
      { id: 'p10', name: '鸡蛋羹', unit: '碗 (150g)', kcal: 102, carb: 1.5, prot: 9, fat: 6.5, cat: '蛋白质' },
      // 蔬菜
      { id: 'v01', name: '西兰花', unit: '份 (150g)', kcal: 51, carb: 10, prot: 4.2, fat: 0.6, cat: '蔬菜' },
      { id: 'v02', name: '菠菜', unit: '份 (100g)', kcal: 23, carb: 3.6, prot: 2.9, fat: 0.4, cat: '蔬菜' },
      { id: 'v10', name: '羽衣甘蓝', unit: '份 (100g)', kcal: 49, carb: 8.8, prot: 4.3, fat: 0.9, cat: '蔬菜', source: '谭成义' },
      { id: 'v11', name: '生菜', unit: '份 (100g)', kcal: 15, carb: 2.9, prot: 1.4, fat: 0.2, cat: '蔬菜', source: '谭成义' },
      { id: 'v09', name: '菇类', unit: '份 (100g)', kcal: 30, carb: 5, prot: 2.5, fat: 0.3, cat: '蔬菜', source: '谭成义' },
      { id: 'v12', name: '萝卜', unit: '份 (100g)', kcal: 16, carb: 3.4, prot: 0.7, fat: 0.1, cat: '蔬菜', source: '谭成义' },
      { id: 'v03', name: '番茄', unit: '个 (150g)', kcal: 27, carb: 5.8, prot: 1.3, fat: 0.3, cat: '蔬菜' },
      { id: 'v04', name: '黄瓜', unit: '根 (200g)', kcal: 30, carb: 7, prot: 1.6, fat: 0.2, cat: '蔬菜' },
      { id: 'v05', name: '彩椒', unit: '个 (100g)', kcal: 26, carb: 5.5, prot: 1, fat: 0.2, cat: '蔬菜' },
      { id: 'v06', name: '生菜沙拉', unit: '份 (150g)', kcal: 22, carb: 3.8, prot: 1.5, fat: 0.3, cat: '蔬菜' },
      { id: 'v07', name: '花椰菜', unit: '份 (150g)', kcal: 38, carb: 7.5, prot: 2.9, fat: 0.3, cat: '蔬菜' },
      { id: 'v08', name: '香菇', unit: '份 (100g)', kcal: 26, carb: 5.2, prot: 2.2, fat: 0.3, cat: '蔬菜' },
      // 水果
      { id: 'fr01', name: '苹果', unit: '个 (200g)', kcal: 104, carb: 28, prot: 0.5, fat: 0.3, cat: '水果' },
      { id: 'fr02', name: '香蕉', unit: '根 (120g)', kcal: 107, carb: 27, prot: 1.3, fat: 0.4, cat: '水果' },
      { id: 'fr03', name: '橙子', unit: '个 (180g)', kcal: 86, carb: 22, prot: 1.3, fat: 0.2, cat: '水果' },
      { id: 'fr04', name: '草莓', unit: '份 (100g)', kcal: 32, carb: 7.7, prot: 0.7, fat: 0.3, cat: '水果' },
      { id: 'fr05', name: '蓝莓', unit: '份 (100g)', kcal: 57, carb: 14, prot: 0.7, fat: 0.3, cat: '水果' },
      { id: 'fr06', name: '西瓜', unit: '份 (300g)', kcal: 90, carb: 23, prot: 1.8, fat: 0.3, cat: '水果' },
      { id: 'fr07', name: '猕猴桃', unit: '个 (100g)', kcal: 61, carb: 15, prot: 1.1, fat: 0.5, cat: '水果' },
      { id: 'fr08', name: '芒果', unit: '份 (200g)', kcal: 130, carb: 34, prot: 1.4, fat: 0.6, cat: '水果' },
      // 零食
      { id: 's01', name: '混合坚果', unit: '份 (30g)', kcal: 175, carb: 6, prot: 4, fat: 15, cat: '零食' },
      { id: 's06', name: '南瓜子', unit: '份 (15g)', kcal: 84, carb: 2.2, prot: 4.5, fat: 7.3, cat: '零食', source: '谭成义' },
      { id: 's02', name: '黑巧克力', unit: '块 (30g)', kcal: 160, carb: 18, prot: 2, fat: 10, cat: '零食' },
      { id: 's03', name: '薯片', unit: '份 (30g)', kcal: 153, carb: 16, prot: 2, fat: 9.5, cat: '零食' },
      { id: 's04', name: '花生', unit: '份 (30g)', kcal: 171, carb: 5.4, prot: 7.7, fat: 14.4, cat: '零食' },
      { id: 's05', name: '奶酪', unit: '片 (20g)', kcal: 69, carb: 0.2, prot: 4.5, fat: 5.5, cat: '零食' },
      // 油脂
      { id: 'o01', name: '牛油果油', unit: '份 (10g)', kcal: 90, carb: 0, prot: 0, fat: 10, cat: '油脂', source: '谭成义' },
      { id: 'o02', name: '山茶油', unit: '份 (10g)', kcal: 90, carb: 0, prot: 0, fat: 10, cat: '油脂', source: '谭成义' },
      { id: 'o03', name: '低芥酸菜籽油', unit: '份 (10g)', kcal: 90, carb: 0, prot: 0, fat: 10, cat: '油脂', source: '谭成义' },
      { id: 'o04', name: '猪油', unit: '份 (10g)', kcal: 90, carb: 0, prot: 0, fat: 10, cat: '油脂', source: '谭成义' },
      { id: 'o05', name: '牛油', unit: '份 (10g)', kcal: 90, carb: 0, prot: 0, fat: 10, cat: '油脂', source: '谭成义' },
      { id: 'o06', name: '橄榄油', unit: '份 (10g)', kcal: 90, carb: 0, prot: 0, fat: 10, cat: '油脂', source: '谭成义' },
    ]
  },

  getDayData(dateStr) {
    const key = `hc_day_${dateStr}`
    const data = wx.getStorageSync(key)
    if (data) return data
    const empty = {
      meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
      tasks: {},
      water: 0
    }
    return empty
  },

  saveDayData(dateStr, data) {
    const key = `hc_day_${dateStr}`
    wx.setStorageSync(key, data)
  },

  computeNutrition(dayData) {
    let kcal = 0, carb = 0, prot = 0, fat = 0
    const meals = dayData.meals || {}
    Object.values(meals).forEach(items => {
      items.forEach(item => {
        kcal += item.kcal || 0
        carb += item.carb || 0
        prot += item.prot || 0
        fat += item.fat || 0
      })
    })
    return {
      kcal: Math.round(kcal),
      carb: Math.round(carb * 10) / 10,
      prot: Math.round(prot * 10) / 10,
      fat: Math.round(fat * 10) / 10
    }
  },

  // 清除之前写入的示例数据
  clearLegacySeedData() {
    if (!wx.getStorageSync('hc_seeded')) return
    const now = new Date()
    for (let i = 0; i <= 13; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = `hc_day_${this.formatDate(d)}`
      const data = wx.getStorageSync(key)
      if (!data) continue
      // 只删除全部由 seed 写入的记录（uid 以 seed_ 开头）
      const meals = data.meals || {}
      const isSeedDay = Object.values(meals).every(
        arr => arr.length === 0 || arr.every(item => String(item.uid).startsWith('seed_'))
      )
      if (isSeedDay) wx.removeStorageSync(key)
    }
    wx.removeStorageSync('hc_seeded')
  },
})
