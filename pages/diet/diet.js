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

const TAN_MEAL_TEMPLATES = {
  breakfast: {
    title: '早餐建议',
    badge: '早餐',
    theme: 'amber',
    foods: [
      { name: '燕麦', tone: 'grain', quickAdd: '燕麦' },
      { name: '鸡蛋', tone: 'protein', quickAdd: '鸡蛋' },
      { name: '全蛋', tone: 'protein', quickAdd: '全蛋' },
      { name: '蓝莓', tone: 'fruit', quickAdd: '蓝莓' },
      { name: '南瓜子', tone: 'fat', quickAdd: '南瓜子' }
    ],
    note: '优先把碳水和蛋白吃稳，早餐乱了，后面更容易嘴馋。'
  },
  lunch: {
    title: '午餐建议',
    badge: '午餐',
    theme: 'green',
    foods: [
      { name: '米饭', tone: 'grain', quickAdd: '米饭' },
      { name: '生米', tone: 'grain', quickAdd: '生米' },
      { name: '龙利鱼', tone: 'protein', quickAdd: '龙利鱼' },
      { name: '巴沙鱼', tone: 'protein', quickAdd: '巴沙鱼' },
      { name: '鸡胸肉', tone: 'protein', quickAdd: '鸡胸肉' },
      { name: '去皮鸡腿肉', tone: 'protein', quickAdd: '去皮鸡腿肉' },
      { name: '虾仁', tone: 'protein', quickAdd: '虾仁' },
      { name: '西兰花', tone: 'veggie', quickAdd: '西兰花' },
      { name: '羽衣甘蓝', tone: 'veggie', quickAdd: '羽衣甘蓝' },
      { name: '生菜', tone: 'veggie', quickAdd: '生菜' },
      { name: '菠菜', tone: 'veggie', quickAdd: '菠菜' },
      { name: '菇类', tone: 'veggie', quickAdd: '菇类' }
    ],
    note: '午餐是最容易把蛋白质和蔬菜吃够的一餐。'
  },
  dinner: {
    title: '晚餐建议',
    badge: '晚餐',
    theme: 'blue',
    foods: [
      { name: '红薯', tone: 'grain', quickAdd: '红薯' },
      { name: '紫薯', tone: 'grain', quickAdd: '紫薯' },
      { name: '土豆', tone: 'grain', quickAdd: '土豆' },
      { name: '贝贝南瓜', tone: 'grain', quickAdd: '贝贝南瓜' },
      { name: '牛肉', tone: 'protein', quickAdd: '牛肉' },
      { name: '混合坚果', tone: 'fat', quickAdd: '混合坚果' },
      { name: '西兰花', tone: 'veggie', quickAdd: '西兰花' },
      { name: '菠菜', tone: 'veggie', quickAdd: '菠菜' },
      { name: '橄榄油', tone: 'fat', quickAdd: '橄榄油' }
    ],
    note: '晚餐更强调饱腹感和可持续，别饿着硬扛。'
  },
  snack: {
    title: '加餐建议',
    badge: '加餐',
    theme: 'purple',
    foods: [
      { name: '希腊酸奶', tone: 'protein', quickAdd: '希腊酸奶' },
      { name: '低脂牛奶', tone: 'protein', quickAdd: '低脂牛奶' },
      { name: '蓝莓', tone: 'fruit', quickAdd: '蓝莓' },
      { name: '香蕉', tone: 'fruit', quickAdd: '香蕉' },
      { name: '鸡蛋', tone: 'protein', quickAdd: '全蛋' },
      { name: '混合坚果', tone: 'fat', quickAdd: '混合坚果' }
    ],
    note: '加餐是补空缺，不是额外乱吃，优先安排在训练前后或两餐之间。'
  }
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
    profileInitial: '健',
    meals: [],
    nutrition: { kcal: 0, carb: 0, prot: 0, fat: 0 },
    macroPlan: null,
    tanMealCards: [],
    tanAdjustTips: [],
    planAdjustExpanded: false,
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

  goProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  togglePlanAdjust() {
    this.setData({
      planAdjustExpanded: !this.data.planAdjustExpanded,
    })
  },

  parseDateStr(dateStr) {
    const [y, m, d] = String(dateStr).split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  },

  isFutureDate(dateStr) {
    return dateStr > app.globalData.today
  },

  shiftDate(date, offset) {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    return d
  },

  buildWeekDates(selectedDate) {
    const selected = this.parseDateStr(selectedDate)
    const day = selected.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const weekStart = this.shiftDate(selected, mondayOffset)
    return Array.from({ length: 7 }, (_, index) => this.shiftDate(weekStart, index))
  },

  loadPage(targetDate = app.globalData.today) {
    if (this.isFutureDate(targetDate)) targetDate = app.globalData.today
    const profile = app.globalData.profile
    const today = app.globalData.today
    const dayData = app.getDayData(targetDate)
    const nutrition = app.computeNutrition(dayData)
    const macroPlan = app.getTanMacroPlan(profile)
    const tanMealCards = this.buildTanMealCards(profile, macroPlan)
    const tanAdjustTips = this.buildTanAdjustTips()
    const goal = macroPlan.kcalTarget || profile.kcalGoal || 2000
    const bmr = this.calcBMR(profile)

    // Greetings
    const hour = new Date().getHours()
    let greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'

    // Date string
    const now = this.parseDateStr(targetDate)
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`
    const recentDates = this.buildRecentDates(targetDate)

    // Build meals array
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'].map(mid => {
      const rawItems = (dayData.meals[mid] || []).map(i => this.prepareLoggedItem({ ...i }))
      return this.decorateMeal(mid, rawItems, tanMealCards)
    })

    const carbTarget = macroPlan.carbTarget || Math.round(goal * 0.5 / 4)
    const protTarget = macroPlan.protTarget || Math.round(goal * 0.2 / 4)
    const fatTarget  = macroPlan.fatTarget || Math.round(goal * 0.3 / 9)
    const kcalPct = Math.min(100, Math.round(nutrition.kcal / goal * 100))
    const carbPct = Math.min(100, Math.round(nutrition.carb / Math.max(carbTarget, 1) * 100))
    const protPct = Math.min(100, Math.round(nutrition.prot / Math.max(protTarget, 1) * 100))
    const fatPct  = Math.min(100, Math.round(nutrition.fat / Math.max(fatTarget, 1) * 100))

    this.setData({
      greeting, dateStr, profile,
      profileInitial: (profile.name || '健康达人').charAt(0),
      todayDate: today,
      selectedDate: targetDate,
      isTodayView: targetDate === today,
      recentDates,
      meals, nutrition,
      macroPlan,
      tanMealCards,
      tanAdjustTips,
      kcalPct, carbPct, protPct, fatPct,
      remainKcal: Math.max(0, goal - nutrition.kcal),
      burnKcal: Math.round(bmr),
      showModal: false,
    })

    this.drawRing(kcalPct)
  },

  decorateMeal(mid, items, tanMealCards = this.data.tanMealCards || []) {
    const cfg = MEAL_CONFIG[mid]
    const mealNutrition = this.computeMealNutrition(items)
    const totalKcal = mealNutrition.kcal
    const mealPlan = tanMealCards.find(card => card.badge === cfg.name)
    const mealRemain = mealPlan ? {
      carb: this.roundMacro(Math.max(0, mealPlan.carb - mealNutrition.carb)),
      prot: this.roundMacro(Math.max(0, mealPlan.prot - mealNutrition.prot)),
      fat: this.roundMacro(Math.max(0, mealPlan.fat - mealNutrition.fat)),
    } : null
    const mealOver = mealPlan ? {
      carb: this.roundMacro(Math.max(0, mealNutrition.carb - mealPlan.carb)),
      prot: this.roundMacro(Math.max(0, mealNutrition.prot - mealPlan.prot)),
      fat: this.roundMacro(Math.max(0, mealNutrition.fat - mealPlan.fat)),
    } : null
    const remainItems = mealPlan ? [
      {
        key: 'carb',
        label: '碳水',
        tone: mealOver.carb > 0 ? 'over' : 'amber',
        value: mealOver.carb > 0 ? `已超 +${mealOver.carb}g` : `还剩 ${mealRemain.carb}g`,
      },
      {
        key: 'prot',
        label: '蛋白',
        tone: mealOver.prot > 0 ? 'over' : 'blue',
        value: mealOver.prot > 0 ? `已超 +${mealOver.prot}g` : `还剩 ${mealRemain.prot}g`,
      },
      {
        key: 'fat',
        label: '脂肪',
        tone: mealOver.fat > 0 ? 'over' : 'coral',
        value: mealOver.fat > 0 ? `已超 +${mealOver.fat}g` : `还剩 ${mealRemain.fat}g`,
      },
    ] : []
    const isOver = !!mealOver && (mealOver.carb > 0 || mealOver.prot > 0 || mealOver.fat > 0)
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
      plan: mealPlan || null,
      eaten: mealNutrition,
      remain: mealRemain,
      over: mealOver,
      remainItems,
      isOver,
    }
  },

  buildRecentDates(selectedDate) {
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    const today = app.globalData.today
    return this.buildWeekDates(selectedDate).map((d) => {
      const date = app.formatDate(d)
      const dayData = app.getDayData(date)
      const nutrition = app.computeNutrition(dayData)
      const hasData = nutrition.kcal > 0
      const isFuture = this.isFutureDate(date)
      return {
        date,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        week: date === today ? '今' : labels[d.getDay()],
        active: !isFuture && date === selectedDate,
        isToday: date === today,
        hasData,
        isFuture,
      }
    })
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date || date === this.data.selectedDate) return
    if (this.isFutureDate(date)) {
      wx.showToast({ title: '今天之后的日期不可修改', icon: 'none' })
      return
    }
    this.loadPage(date)
  },

  onDateChange(e) {
    const date = e.detail.value
    if (!date || date === this.data.selectedDate) return
    if (this.isFutureDate(date)) {
      wx.showToast({ title: '今天之后的日期不可修改', icon: 'none' })
      return
    }
    this.loadPage(date)
  },

  calcBMR(p) {
    return app.calcBMR(p)
  },

  computeMealNutrition(items = []) {
    const total = items.reduce((acc, item) => {
      acc.kcal += item.kcal || 0
      acc.carb += item.carb || 0
      acc.prot += item.prot || 0
      acc.fat += item.fat || 0
      return acc
    }, { kcal: 0, carb: 0, prot: 0, fat: 0 })
    return {
      kcal: Math.round(total.kcal),
      carb: this.roundMacro(total.carb),
      prot: this.roundMacro(total.prot),
      fat: this.roundMacro(total.fat),
    }
  },

  prepareLoggedItem(item) {
    const baseWeight = item.baseWeight || this.parseBaseWeight(item.unit)
    const amount = this.normalizeAmount(item.amount)
    const customWeight = this.normalizeWeight(item.customWeight, baseWeight)
    const scale = baseWeight && customWeight ? customWeight / baseWeight.value : amount
    const safeScale = scale || 1
    const baseKcal = this.roundMacro((item.baseKcal || item.kcal || 0) / (item.baseKcal ? 1 : safeScale))
    const baseCarb = this.roundMacro((item.baseCarb || item.carb || 0) / (item.baseCarb ? 1 : safeScale))
    const baseProt = this.roundMacro((item.baseProt || item.prot || 0) / (item.baseProt ? 1 : safeScale))
    const baseFat = this.roundMacro((item.baseFat || item.fat || 0) / (item.baseFat ? 1 : safeScale))
    const primaryMacros = this.getPrimaryMacros(item)
    return {
      ...item,
      baseWeight,
      primaryMacros,
      isPrimaryCarb: primaryMacros.includes('carb'),
      isPrimaryProt: primaryMacros.includes('prot'),
      isPrimaryFat: primaryMacros.includes('fat'),
      amount,
      amountInput: item.amountInput !== undefined ? String(item.amountInput) : String(amount),
      customWeight,
      weightInput: item.weightInput !== undefined
        ? String(item.weightInput)
        : (customWeight == null ? '' : String(customWeight)),
      baseKcal,
      baseCarb,
      baseProt,
      baseFat,
    }
  },

  getPrimaryMacros(item = {}) {
    const cat = item.cat
    if (cat === '主食' || cat === '水果') return ['carb']
    if (cat === '油脂') return ['fat']
    const macros = [
      { key: 'carb', value: Number(item.carb) || Number(item.baseCarb) || 0 },
      { key: 'prot', value: Number(item.prot) || Number(item.baseProt) || 0 },
      { key: 'fat', value: Number(item.fat) || Number(item.baseFat) || 0 },
    ]
    const max = Math.max(...macros.map(m => m.value), 0)
    if (!max) return []
    const threshold = max >= 10 ? max * 0.45 : max * 0.6
    return macros
      .filter(m => m.value >= 3 && m.value >= threshold)
      .map(m => m.key)
  },

  buildFinalUnit(food) {
    return food.baseWeight
      ? `${food.name} (${food.customWeight}${food.baseWeight.unit})`
      : food.amount === 1 ? food.unit : `${food.unit} x ${food.amount}`
  },

  applyLoggedPreview(item, overrides = {}) {
    const amount = this.normalizeAmount(overrides.amount !== undefined ? overrides.amount : item.amount)
    const customWeight = this.normalizeWeight(
      overrides.customWeight !== undefined ? overrides.customWeight : item.customWeight,
      item.baseWeight
    )
    const scale = item.baseWeight && customWeight ? customWeight / item.baseWeight.value : amount
    return {
      amount,
      amountInput: overrides.amount !== undefined ? String(overrides.amount) : String(amount),
      customWeight,
      weightInput: overrides.customWeight !== undefined
        ? String(overrides.customWeight)
        : (customWeight == null ? '' : String(customWeight)),
      kcal: Math.round((item.baseKcal || 0) * scale),
      carb: this.roundMacro((item.baseCarb || 0) * scale),
      prot: this.roundMacro((item.baseProt || 0) * scale),
      fat: this.roundMacro((item.baseFat || 0) * scale),
    }
  },

  refreshMealsState(meals) {
    const refreshedMeals = meals.map(meal => this.decorateMeal(meal.id, meal.items.map(i => ({ ...i }))))
    const nutrition = this.computeMealNutrition(refreshedMeals.flatMap(meal => meal.items))
    const macroPlan = this.data.macroPlan || {}
    const goal = macroPlan.kcalTarget || this.data.profile.kcalGoal || 2000
    const carbTarget = macroPlan.carbTarget || Math.round(goal * 0.5 / 4)
    const protTarget = macroPlan.protTarget || Math.round(goal * 0.2 / 4)
    const fatTarget = macroPlan.fatTarget || Math.round(goal * 0.3 / 9)
    const kcalPct = Math.min(100, Math.round(nutrition.kcal / goal * 100))
    const carbPct = Math.min(100, Math.round(nutrition.carb / Math.max(carbTarget, 1) * 100))
    const protPct = Math.min(100, Math.round(nutrition.prot / Math.max(protTarget, 1) * 100))
    const fatPct = Math.min(100, Math.round(nutrition.fat / Math.max(fatTarget, 1) * 100))
    this.setData({
      meals: refreshedMeals,
      nutrition,
      kcalPct,
      carbPct,
      protPct,
      fatPct,
      remainKcal: Math.max(0, goal - nutrition.kcal),
    })
    this.drawRing(kcalPct)
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

  getGoalKcal() {
    return (this.data.macroPlan && this.data.macroPlan.kcalTarget) || this.data.profile.kcalGoal || 2000
  },

  getFoodByName(name) {
    return app.globalData.foodDB.find(item => item.name === name) || null
  },

  getServingWeight(food) {
    const baseWeight = food ? this.parseBaseWeight(food.unit) : null
    return baseWeight ? baseWeight.value : 0
  },

  getScaledFoodWeight(foodName, macroKey, targetValue, fallbackWeight = 0) {
    const food = this.getFoodByName(foodName)
    if (!food) return fallbackWeight
    const servingWeight = this.getServingWeight(food)
    const macroValue = Number(food[macroKey]) || 0
    if (!servingWeight || !macroValue || !targetValue) return fallbackWeight
    return Math.round(servingWeight * (targetValue / macroValue))
  },

  getScaledFoodCount(foodName, proteinTarget, extraProt = 0) {
    const food = this.getFoodByName(foodName)
    if (!food) return 0
    const proteinPerUnit = Number(food.prot) || 0
    if (!proteinPerUnit || !proteinTarget) return 0
    return Math.max(1, Math.round(Math.max(0, proteinTarget - extraProt) / proteinPerUnit))
  },

  clampValue(value, min, max) {
    return Math.min(max, Math.max(min, Math.round(value || 0)))
  },

  buildTanMealCards(profile, macroPlan) {
    const weight = Number(profile.weight) || 0
    const splits = {
      breakfast: { carb: 0.24, prot: 0.22, fat: 0.2 },
      lunch: { carb: 0.34, prot: 0.33, fat: 0.3 },
      dinner: { carb: 0.32, prot: 0.3, fat: 0.35 },
      snack: { carb: 0.1, prot: 0.15, fat: 0.15 }
    }

    const mealTargets = Object.keys(splits).reduce((acc, key) => {
      const split = splits[key]
      const carb = Math.round(macroPlan.carbTarget * split.carb)
      const prot = Math.round(macroPlan.protTarget * split.prot)
      const fat = Math.round(macroPlan.fatTarget * split.fat)
      acc[key] = {
        carb,
        prot,
        fat,
        kcal: carb * 4 + prot * 4 + fat * 9
      }
      return acc
    }, {})

    const breakfastOats = this.clampValue(
      this.getScaledFoodWeight('燕麦', 'carb', mealTargets.breakfast.carb * 0.72, 60),
      35,
      110
    )
    const oatsFood = this.getFoodByName('燕麦')
    const oatsServingWeight = this.getServingWeight(oatsFood) || 70
    const oatsScale = oatsServingWeight ? breakfastOats / oatsServingWeight : 0
    const breakfastOatsProt = (oatsFood?.prot || 0) * oatsScale
    const breakfastOatsFat = (oatsFood?.fat || 0) * oatsScale
    const breakfastEggs = this.clampValue(
      this.getScaledFoodCount('鸡蛋', mealTargets.breakfast.prot * 0.78, breakfastOatsProt),
      1,
      4
    )
    const eggFood = this.getFoodByName('鸡蛋')
    const breakfastEggFat = (eggFood?.fat || 0) * breakfastEggs
    const breakfastSeeds = this.clampValue(
      this.getScaledFoodWeight(
        '南瓜子',
        'fat',
        Math.max(3, mealTargets.breakfast.fat - breakfastOatsFat - breakfastEggFat),
        10
      ),
      5,
      25
    )

    const lunchRice = this.clampValue(
      this.getScaledFoodWeight('生米', 'carb', mealTargets.lunch.carb, 80),
      55,
      140
    )
    const lunchProteinWeight = this.clampValue(
      this.getScaledFoodWeight('鸡胸肉', 'prot', mealTargets.lunch.prot, 150),
      100,
      260
    )
    const lunchVegWeight = this.clampValue(weight * 3 + mealTargets.lunch.carb, 180, 360)

    const dinnerTubers = this.clampValue(
      this.getScaledFoodWeight('红薯', 'carb', mealTargets.dinner.carb, 250),
      150,
      420
    )
    const dinnerProteinWeight = this.clampValue(
      this.getScaledFoodWeight('牛肉', 'prot', mealTargets.dinner.prot, 150),
      100,
      260
    )
    const beefFood = this.getFoodByName('牛肉')
    const beefServingWeight = this.getServingWeight(beefFood) || 100
    const beefScale = beefServingWeight ? dinnerProteinWeight / beefServingWeight : 0
    const dinnerBeefFat = (beefFood?.fat || 0) * beefScale
    const dinnerNuts = this.clampValue(
      this.getScaledFoodWeight('混合坚果', 'fat', Math.max(4, mealTargets.dinner.fat - dinnerBeefFat), 15),
      8,
      30
    )
    const dinnerVegWeight = this.clampValue(weight * 3 + mealTargets.dinner.carb * 0.6, 180, 360)

    const snackYogurtWeight = this.clampValue(
      this.getScaledFoodWeight('希腊酸奶', 'prot', mealTargets.snack.prot, 180),
      120,
      300
    )
    const snackMilkWeight = this.clampValue(
      this.getScaledFoodWeight('低脂牛奶', 'prot', mealTargets.snack.prot * 0.75, 220),
      180,
      360
    )
    const snackFruitWeight = this.clampValue(
      this.getScaledFoodWeight('蓝莓', 'carb', Math.max(6, mealTargets.snack.carb * 0.5), 80),
      60,
      180
    )
    const snackNeedsEgg = mealTargets.snack.prot > 18
    const snackEggCount = snackNeedsEgg ? 1 : 0

    return [
      {
        ...TAN_MEAL_TEMPLATES.breakfast,
        carb: mealTargets.breakfast.carb,
        prot: mealTargets.breakfast.prot,
        fat: mealTargets.breakfast.fat,
        kcal: mealTargets.breakfast.kcal,
        macroLine: `碳水 ${mealTargets.breakfast.carb}g · 蛋白 ${mealTargets.breakfast.prot}g · 脂肪 ${mealTargets.breakfast.fat}g · 约 ${mealTargets.breakfast.kcal}千卡`,
        target: `燕麦约 ${breakfastOats}g，鸡蛋约 ${breakfastEggs}个，南瓜子约 ${breakfastSeeds}g，水果少量`,
      },
      {
        ...TAN_MEAL_TEMPLATES.lunch,
        carb: mealTargets.lunch.carb,
        prot: mealTargets.lunch.prot,
        fat: mealTargets.lunch.fat,
        kcal: mealTargets.lunch.kcal,
        macroLine: `碳水 ${mealTargets.lunch.carb}g · 蛋白 ${mealTargets.lunch.prot}g · 脂肪 ${mealTargets.lunch.fat}g · 约 ${mealTargets.lunch.kcal}千卡`,
        target: `生米约 ${lunchRice}g，肉类约 ${lunchProteinWeight}g，蔬菜约 ${lunchVegWeight}g`,
      },
      {
        ...TAN_MEAL_TEMPLATES.dinner,
        carb: mealTargets.dinner.carb,
        prot: mealTargets.dinner.prot,
        fat: mealTargets.dinner.fat,
        kcal: mealTargets.dinner.kcal,
        macroLine: `碳水 ${mealTargets.dinner.carb}g · 蛋白 ${mealTargets.dinner.prot}g · 脂肪 ${mealTargets.dinner.fat}g · 约 ${mealTargets.dinner.kcal}千卡`,
        target: `薯类约 ${dinnerTubers}g，牛肉约 ${dinnerProteinWeight}g，坚果约 ${dinnerNuts}g，蔬菜约 ${dinnerVegWeight}g`,
      },
      {
        ...TAN_MEAL_TEMPLATES.snack,
        carb: mealTargets.snack.carb,
        prot: mealTargets.snack.prot,
        fat: mealTargets.snack.fat,
        kcal: mealTargets.snack.kcal,
        macroLine: `碳水 ${mealTargets.snack.carb}g · 蛋白 ${mealTargets.snack.prot}g · 脂肪 ${mealTargets.snack.fat}g · 约 ${mealTargets.snack.kcal}千卡`,
        target: `希腊酸奶约 ${snackYogurtWeight}g，或低脂牛奶约 ${snackMilkWeight}ml${snackNeedsEgg ? `，再补 ${snackEggCount}个鸡蛋` : ''}，水果约 ${snackFruitWeight}g`,
      }
    ]
  },

  buildTanAdjustTips() {
    return [
      '先按当前目标执行 7-10 天，再看体重和状态。',
      '掉得太快、容易累或训练状态差，优先适当加碳水。',
      '停滞且执行稳定时，再小幅减碳水；每 10 天按新体重重算目标。'
    ]
  },

  openFoodModal(e) {
    if (this.isFutureDate(this.data.selectedDate || app.globalData.today)) {
      wx.showToast({ title: '今天之后的日期不可修改', icon: 'none' })
      return
    }
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

  closeModal() {
    this.setData({ showModal: false }, () => {
      wx.nextTick(() => {
        this.drawRing(this.data.kcalPct)
      })
    })
  },

  noop() {},

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
    if (!this.appendFoodToMeal(food, this.data.currentMeal, currentDate)) return
    wx.showToast({ title: `已添加 ${food.name}`, icon: 'success', duration: 1200 })
    this.setData({ showModal: false })
    this.loadPage(currentDate)
  },

  addSuggestedFood(e) {
    const { meal, name } = e.currentTarget.dataset
    const currentDate = this.data.selectedDate || app.globalData.today
    if (this.isFutureDate(currentDate)) {
      wx.showToast({ title: '今天之后的日期不可修改', icon: 'none' })
      return
    }
    const baseFood = app.globalData.foodDB.find(item => item.name === name)
    if (!baseFood) {
      wx.showToast({ title: '这个建议请用加号详细添加', icon: 'none' })
      return
    }
    const food = this.applyCustomAmount({
      ...baseFood,
      catColor: CAT_COLORS[baseFood.cat] || '#999',
      sourceColor: CAT_COLORS[baseFood.source] || '#999'
    })
    if (!this.appendFoodToMeal(food, meal, currentDate)) return
    wx.showToast({ title: `已添加 ${food.name}`, icon: 'success', duration: 1200 })
    this.loadPage(currentDate)
  },

  appendFoodToMeal(food, meal, currentDate) {
    if (this.isFutureDate(currentDate)) {
      wx.showToast({ title: '今天之后的日期不可修改', icon: 'none' })
      return false
    }
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
      amount: food.amount || 1,
      customWeight: food.customWeight,
      baseWeight: food.baseWeight || null,
      baseKcal: food.kcal,
      baseCarb: food.carb,
      baseProt: food.prot,
      baseFat: food.fat,
      uid: `${food.id}_${Date.now()}`,
    }
    dayData.meals[meal].push(item)
    app.saveDayData(currentDate, dayData)
    return true
  },

  onLoggedWeightInput(e) {
    const { meal, uid } = e.currentTarget.dataset
    const value = e.detail.value
    const mealIndex = this.data.meals.findIndex(item => item.id === meal)
    if (mealIndex === -1) return
    const itemIndex = this.data.meals[mealIndex].items.findIndex(item => item.uid === uid)
    if (itemIndex === -1) return
    const currentItem = this.data.meals[mealIndex].items[itemIndex]
    if (!currentItem.baseWeight) return
    const preview = this.applyLoggedPreview(currentItem, { customWeight: value })
    const meals = this.data.meals.map(mealItem => ({
      ...mealItem,
      items: mealItem.items.map(food => ({ ...food })),
    }))
    Object.assign(meals[mealIndex].items[itemIndex], preview, {
      unit: `${currentItem.name} (${preview.customWeight}${currentItem.baseWeight.unit})`,
    })
    const currentDate = this.data.selectedDate || app.globalData.today
    const dayData = app.getDayData(currentDate)
    const storedMealIndex = dayData.meals[meal].findIndex(item => item.uid === uid)
    if (storedMealIndex !== -1) {
      Object.assign(dayData.meals[meal][storedMealIndex], meals[mealIndex].items[itemIndex])
      app.saveDayData(currentDate, dayData)
    }
    this.refreshMealsState(meals)
  },

  onLoggedAmountInput(e) {
    const { meal, uid } = e.currentTarget.dataset
    const value = e.detail.value
    const mealIndex = this.data.meals.findIndex(item => item.id === meal)
    if (mealIndex === -1) return
    const itemIndex = this.data.meals[mealIndex].items.findIndex(item => item.uid === uid)
    if (itemIndex === -1) return
    const currentItem = this.data.meals[mealIndex].items[itemIndex]
    if (currentItem.baseWeight) return
    const preview = this.applyLoggedPreview(currentItem, { amount: value })
    const meals = this.data.meals.map(mealItem => ({
      ...mealItem,
      items: mealItem.items.map(food => ({ ...food })),
    }))
    Object.assign(meals[mealIndex].items[itemIndex], preview, {
      unit: preview.amount === 1 ? currentItem.unit.split(' x ')[0] : `${currentItem.unit.split(' x ')[0]} x ${preview.amount}`,
    })
    const currentDate = this.data.selectedDate || app.globalData.today
    const dayData = app.getDayData(currentDate)
    const storedMealIndex = dayData.meals[meal].findIndex(item => item.uid === uid)
    if (storedMealIndex !== -1) {
      Object.assign(dayData.meals[meal][storedMealIndex], meals[mealIndex].items[itemIndex])
      app.saveDayData(currentDate, dayData)
    }
    this.refreshMealsState(meals)
  },

  deleteFood(e) {
    const { meal, uid } = e.currentTarget.dataset
    const currentDate = this.data.selectedDate || app.globalData.today
    if (this.isFutureDate(currentDate)) {
      wx.showToast({ title: '今天之后的日期不可修改', icon: 'none' })
      return
    }
    wx.showModal({
      title: '删除食物',
      content: '确认删除这条记录吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        const dayData = app.getDayData(currentDate)
        dayData.meals[meal] = dayData.meals[meal].filter(i => i.uid !== uid)
        app.saveDayData(currentDate, dayData)
        this.loadPage(currentDate)
      }
    })
  },
})
