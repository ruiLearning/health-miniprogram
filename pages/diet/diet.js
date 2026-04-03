// pages/diet/diet.js
const app = getApp()

const MEAL_CONFIG = {
  breakfast: { name: '早餐', icon: '🌅', iconBg: '#FFF8E7', badgeBg: '#FFF8E7', badgeColor: '#F08C00' },
  lunch:     { name: '午餐', icon: '🍱', iconBg: '#ECFDF5', badgeBg: '#ECFDF5', badgeColor: '#1AAD74' },
  dinner:    { name: '晚餐', icon: '🌙', iconBg: '#EFF6FF', badgeBg: '#EFF6FF', badgeColor: '#3B82F6' },
  snack:     { name: '加餐', icon: '🍎', iconBg: '#F5F3FF', badgeBg: '#F5F3FF', badgeColor: '#7C3AED' },
}

const CAT_COLORS = {
  '主食': '#F08C00', '蛋白质': '#3B82F6', '蔬菜': '#1AAD74',
  '水果': '#EC4899', '零食': '#7C3AED', '油脂': '#B7791F', '谭成义': '#0F766E'
}

Page({
  data: {
    greeting: '',
    dateStr: '',
    todayDate: '',
    selectedDate: '',
    isTodayView: true,
    recentDates: [],
    profile: {},
    meals: [],
    nutrition: { kcal: 0, carb: 0, prot: 0, fat: 0 },
    kcalPct: 0,
    carbPct: 0, protPct: 0, fatPct: 0,
    remainKcal: 0,
    burnKcal: 0,
    showModal: false,
    currentMeal: 'breakfast',
    currentMealName: '早餐',
    searchKey: '',
    activeCat: '全部',
    foodCats: ['全部', '谭成义', '主食', '蛋白质', '蔬菜', '水果', '零食', '油脂'],
    filteredFoods: [],
    customAmounts: {},
    customWeights: {},
  },

  onShow() {
    this.loadPage(this.data.selectedDate || app.globalData.today)
  },

  loadPage(targetDate = app.globalData.today) {
    const profile = app.globalData.profile
    const today = app.globalData.today
    const dayData = app.getDayData(targetDate)
    const nutrition = app.computeNutrition(dayData)
    const goal = profile.kcalGoal || 2000
    const bmr = this.calcBMR(profile)

    // Greetings
    const hour = new Date().getHours()
    let greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'

    // Date string
    const now = new Date(targetDate)
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`
    const recentDates = this.buildRecentDates(targetDate)

    // Build meals array
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'].map(mid => {
      const cfg = MEAL_CONFIG[mid]
      const items = (dayData.meals[mid] || []).map(i => ({ ...i }))
      const totalKcal = items.reduce((s, i) => s + i.kcal, 0)
      return {
        id: mid,
        name: cfg.name,
        icon: cfg.icon,
        iconBg: cfg.iconBg,
        badgeBg: cfg.badgeBg,
        badgeColor: cfg.badgeColor,
        items,
        itemCount: items.length,
        totalKcal: Math.round(totalKcal),
      }
    })

    const kcalPct = Math.min(100, Math.round(nutrition.kcal / goal * 100))
    const carbPct = Math.min(100, Math.round(nutrition.carb / (goal * 0.5 / 4) * 100))
    const protPct = Math.min(100, Math.round(nutrition.prot / (goal * 0.2 / 4) * 100))
    const fatPct  = Math.min(100, Math.round(nutrition.fat  / (goal * 0.3 / 9) * 100))

    this.setData({
      greeting, dateStr, profile,
      todayDate: today,
      selectedDate: targetDate,
      isTodayView: targetDate === today,
      recentDates,
      meals, nutrition,
      kcalPct, carbPct, protPct, fatPct,
      remainKcal: Math.max(0, goal - nutrition.kcal),
      burnKcal: Math.round(bmr),
    })

    this.drawRing(kcalPct)
  },

  buildRecentDates(selectedDate) {
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    const today = app.globalData.today
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = app.formatDate(d)
      result.push({
        date,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        week: date === today ? '今' : labels[d.getDay()],
        active: date === selectedDate,
      })
    }
    return result
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date || date === this.data.selectedDate) return
    this.loadPage(date)
  },

  onDateChange(e) {
    const date = e.detail.value
    if (!date || date === this.data.selectedDate) return
    this.loadPage(date)
  },

  calcBMR(p) {
    if (!p.height || !p.weight || !p.age) return 0
    const base = p.gender === 'female'
      ? 655 + 9.6 * p.weight + 1.8 * p.height - 4.7 * p.age
      : 66 + 13.7 * p.weight + 5 * p.height - 6.8 * p.age
    return base
  },

  drawRing(pct) {
    const w = 200, cx = 100, cy = 100, r = 80, lineW = 18

    const ctx = wx.createCanvasContext('kcalRing', this)
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (pct / 100) * 2 * Math.PI

    ctx.clearRect(0, 0, w, w)

    // Track
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#F0F0F0')
    ctx.setLineWidth(lineW)
    ctx.stroke()

    if (pct > 0) {
      const color = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F08C00' : '#1AAD74'
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(lineW)
      ctx.setLineCap('round')
      ctx.stroke()
    }

    ctx.draw()
  },

  // ── Modal ──
  openFoodModal(e) {
    const meal = e.currentTarget.dataset.meal
    const cfg = MEAL_CONFIG[meal]
    this.setData({
      showModal: true,
      currentMeal: meal,
      currentMealName: cfg.name,
      searchKey: '',
      activeCat: '全部',
      customAmounts: {},
      customWeights: {},
      filteredFoods: this.buildFoodList('', '全部'),
    })
  },

  noop() {},

  closeModal() {
    this.setData({ showModal: false })
    setTimeout(() => this.drawRing(this.data.kcalPct), 50)
  },

  buildFoodList(key, cat) {
    let list = app.globalData.foodDB.map(f => ({
      ...f,
      catColor: CAT_COLORS[f.cat] || '#999',
      sourceColor: CAT_COLORS[f.source] || '#999'
    }))
    if (cat && cat !== '全部') {
      list = cat === '谭成义'
        ? list.filter(f => f.source === '谭成义')
        : list.filter(f => f.cat === cat)
    }
    if (key) list = list.filter(f => f.name.includes(key))
    return list.map(f => this.applyCustomAmount(f))
  },

  applyCustomAmount(food) {
    const baseWeight = this.parseBaseWeight(food.unit)
    const rawAmount = this.data.customAmounts[food.id]
    const rawWeight = this.data.customWeights[food.id]
    const amount = this.normalizeAmount(rawAmount)
    const customWeight = this.normalizeWeight(rawWeight, baseWeight)
    const scale = customWeight && baseWeight ? customWeight / baseWeight.value : amount
    return {
      ...food,
      baseWeight,
      amount,
      amountInput: rawAmount === undefined ? String(amount) : String(rawAmount),
      customWeight,
      weightInput: rawWeight === undefined
        ? (customWeight == null ? '' : String(customWeight))
        : String(rawWeight),
      displayKcal: Math.round((food.kcal || 0) * scale),
      displayCarb: this.roundMacro((food.carb || 0) * scale),
      displayProt: this.roundMacro((food.prot || 0) * scale),
      displayFat: this.roundMacro((food.fat || 0) * scale),
    }
  },

  buildPreview(food, overrides = {}) {
    const baseWeight = this.parseBaseWeight(food.unit)
    const rawAmount = overrides.amount !== undefined ? overrides.amount : this.data.customAmounts[food.id]
    const rawWeight = overrides.customWeight !== undefined ? overrides.customWeight : this.data.customWeights[food.id]
    const amount = this.normalizeAmount(rawAmount)
    const customWeight = this.normalizeWeight(rawWeight, baseWeight)
    const scale = customWeight && baseWeight ? customWeight / baseWeight.value : amount
    return {
      amount,
      amountInput: rawAmount === undefined ? String(amount) : String(rawAmount),
      customWeight,
      weightInput: rawWeight === undefined
        ? (customWeight == null ? '' : String(customWeight))
        : String(rawWeight),
      baseWeight,
      displayKcal: Math.round((food.kcal || 0) * scale),
      displayCarb: this.roundMacro((food.carb || 0) * scale),
      displayProt: this.roundMacro((food.prot || 0) * scale),
      displayFat: this.roundMacro((food.fat || 0) * scale),
    }
  },

  parseBaseWeight(unit = '') {
    const match = String(unit).match(/\(([\d.]+)\s*(g|ml)\)/i)
    if (!match) return null
    return {
      value: parseFloat(match[1]),
      unit: match[2].toLowerCase(),
    }
  },

  normalizeAmount(value) {
    const n = parseFloat(value)
    if (!n || n <= 0) return 1
    return Math.min(99, Math.round(n * 10) / 10)
  },

  normalizeWeight(value, baseWeight) {
    if (!baseWeight) return null
    const n = parseFloat(value)
    if (!n || n <= 0) return baseWeight.value
    return Math.min(9999, Math.round(n * 10) / 10)
  },

  roundMacro(value) {
    return Math.round(value * 10) / 10
  },

  onSearch(e) {
    const key = e.detail.value
    this.setData({
      searchKey: key,
      filteredFoods: this.buildFoodList(key, this.data.activeCat),
    })
  },

  setCat(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({
      activeCat: cat,
      filteredFoods: this.buildFoodList(this.data.searchKey, cat),
    })
  },

  onAmountInput(e) {
    const id = e.currentTarget.dataset.id
    const value = e.detail.value
    const index = this.data.filteredFoods.findIndex(item => item.id === id)
    if (index === -1) return
    const preview = this.buildPreview(this.data.filteredFoods[index], { amount: value })
    const customAmounts = {
      ...this.data.customAmounts,
      [id]: value,
    }
    this.setData({
      customAmounts,
      [`filteredFoods[${index}].amountInput`]: preview.amountInput,
      [`filteredFoods[${index}].amount`]: preview.amount,
      [`filteredFoods[${index}].displayKcal`]: preview.displayKcal,
      [`filteredFoods[${index}].displayCarb`]: preview.displayCarb,
      [`filteredFoods[${index}].displayProt`]: preview.displayProt,
      [`filteredFoods[${index}].displayFat`]: preview.displayFat,
    })
  },

  onWeightInput(e) {
    const id = e.currentTarget.dataset.id
    const value = e.detail.value
    const index = this.data.filteredFoods.findIndex(item => item.id === id)
    if (index === -1) return
    const preview = this.buildPreview(this.data.filteredFoods[index], { customWeight: value })
    const customWeights = {
      ...this.data.customWeights,
      [id]: value,
    }
    this.setData({
      customWeights,
      [`filteredFoods[${index}].weightInput`]: preview.weightInput,
      [`filteredFoods[${index}].customWeight`]: preview.customWeight,
      [`filteredFoods[${index}].displayKcal`]: preview.displayKcal,
      [`filteredFoods[${index}].displayCarb`]: preview.displayCarb,
      [`filteredFoods[${index}].displayProt`]: preview.displayProt,
      [`filteredFoods[${index}].displayFat`]: preview.displayFat,
    })
  },

  addFood(e) {
    const foodId = e.currentTarget.dataset.id
    const food = this.data.filteredFoods.find(item => item.id === foodId)
    if (!food) return
    const currentDate = this.data.selectedDate || app.globalData.today
    const dayData = app.getDayData(currentDate)
    const finalUnit = food.baseWeight
      ? `${food.name} (${food.customWeight}${food.baseWeight.unit})`
      : food.amount === 1 ? food.unit : `${food.unit} x ${food.amount}`
    const item = {
      ...food,
      unit: finalUnit,
      kcal: food.displayKcal,
      carb: food.displayCarb,
      prot: food.displayProt,
      fat: food.displayFat,
      uid: `${food.id}_${Date.now()}`,
    }
    dayData.meals[this.data.currentMeal].push(item)
    app.saveDayData(currentDate, dayData)

    wx.showToast({ title: `已添加 ${food.name}`, icon: 'success', duration: 1200 })
    this.setData({ showModal: false })
    this.loadPage(currentDate)
  },

  deleteFood(e) {
    const { meal, uid } = e.currentTarget.dataset
    wx.showModal({
      title: '删除食物',
      content: '确认删除这条记录吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        const currentDate = this.data.selectedDate || app.globalData.today
        const dayData = app.getDayData(currentDate)
        dayData.meals[meal] = dayData.meals[meal].filter(i => i.uid !== uid)
        app.saveDayData(currentDate, dayData)
        this.loadPage(currentDate)
      }
    })
  },
})
