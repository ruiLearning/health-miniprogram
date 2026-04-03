// pages/checkin/checkin.js
const app = getApp()

const TASKS = [
  { id: 'diet',     name: '健康饮食', icon: '🥗', color: '#1AAD74', bg: '#ECFDF5', bgDone: '#BBF7D0' },
  { id: 'water',    name: '喝够水',   icon: '💧', color: '#3B82F6', bg: '#EFF6FF', bgDone: '#BFDBFE' },
  { id: 'exercise', name: '运动30分', icon: '🏃', color: '#F08C00', bg: '#FFFBEB', bgDone: '#FDE68A' },
  { id: 'sleep',    name: '早睡早起', icon: '😴', color: '#7C3AED', bg: '#F5F3FF', bgDone: '#DDD6FE' },
  { id: 'meditate', name: '冥想放松', icon: '🧘', color: '#EC4899', bg: '#FDF2F8', bgDone: '#FBCFE8' },
  { id: 'nosnack',  name: '不吃零食', icon: '🚫', color: '#EF4444', bg: '#FEF2F2', bgDone: '#FECACA' },
]

const MOODS = [
  { val: 'great',  emoji: '😄', label: '很棒' },
  { val: 'good',   emoji: '😊', label: '不错' },
  { val: 'normal', emoji: '😐', label: '一般' },
  { val: 'tired',  emoji: '😴', label: '疲惫' },
  { val: 'bad',    emoji: '😞', label: '不好' },
]

Page({
  data: {
    streakDays: 0,
    monthDays: 0,
    monthRate: 0,
    weekDays: [],
    tasks: [],
    doneTasks: 0,
    totalTasks: TASKS.length,
    waterCount: 0,
    waterGoal: 8,
    waterPct: 0,
    waterCups: [],
    moods: MOODS,
    todayMood: '',
    todayWeight: '',
    todayDate: '',
    selectedWeightDate: '',
    selectedWeightLabel: '',
    isTodayWeight: true,
    recentWeightDates: [],
    lastWeight: '',
    weightDiff: 0,
    weightDiffAbs: 0,
  },

  onShow() {
    this.loadPage(this.data.selectedWeightDate || app.globalData.today)
  },

  loadPage(weightDate = app.globalData.today) {
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    const profile = app.globalData.profile
    const waterGoal = profile.waterGoal || 8
    const weightDayData = app.getDayData(weightDate)

    // Tasks
    const taskStates = dayData.tasks || {}
    const tasks = TASKS.map(t => ({
      ...t,
      done: !!taskStates[t.id],
      cardBg: taskStates[t.id] ? t.bgDone : t.bg,
      borderColor: taskStates[t.id] ? t.color : 'transparent',
      nameColor: taskStates[t.id] ? t.color : '#333',
      iconBg: taskStates[t.id] ? t.color : 'rgba(0,0,0,0.06)',
    }))
    const doneTasks = tasks.filter(t => t.done).length

    // Water
    const waterCount = dayData.water || 0
    const waterPct = Math.min(100, Math.round(waterCount / waterGoal * 100))
    const waterCups = Array.from({ length: waterGoal }, (_, i) => i)

    // Week
    const weekDays = this.buildWeekDays(today)

    // Streak & month stats
    const { streakDays, monthDays } = this.calcStreaks(today)
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const monthRate = Math.round(monthDays / daysInMonth * 100)

    // Mood & weight
    const todayMood = dayData.mood || ''
    const todayWeight = weightDayData.weight ? String(weightDayData.weight) : ''
    const { lastWeight, weightDiff } = this.getWeightDiff(weightDate, weightDayData.weight)
    const recentWeightDates = this.buildRecentWeightDates(weightDate)
    const selectedWeightLabel = this.formatWeightDateLabel(weightDate)

    this.setData({
      tasks, doneTasks,
      waterCount, waterGoal, waterPct, waterCups,
      weekDays,
      streakDays, monthDays, monthRate,
      todayMood, todayWeight,
      todayDate: today,
      selectedWeightDate: weightDate,
      selectedWeightLabel,
      isTodayWeight: weightDate === today,
      recentWeightDates,
      lastWeight,
      weightDiff,
      weightDiffAbs: Math.abs(weightDiff).toFixed(1),
    })
  },

  buildRecentWeightDates(selectedDate) {
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    const today = app.globalData.today
    const result = []
    for (let i = 9; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = app.formatDate(d)
      const dayData = app.getDayData(date)
      result.push({
        date,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        week: date === today ? '今' : labels[d.getDay()],
        active: date === selectedDate,
        hasWeight: !!dayData.weight,
      })
    }
    return result
  },

  formatWeightDateLabel(dateStr) {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },

  selectWeightDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date || date === this.data.selectedWeightDate) return
    this.loadPage(date)
  },

  onWeightDateChange(e) {
    const date = e.detail.value
    if (!date || date === this.data.selectedWeightDate) return
    this.loadPage(date)
  },

  buildWeekDays(today) {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    const labels = ['一','二','三','四','五','六','日']
    const result = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = app.formatDate(d)
      const dayData = app.getDayData(dateStr)
      const tasksDone = Object.values(dayData.tasks || {}).filter(Boolean).length
      result.push({
        date: dateStr,
        dayLabel: labels[i],
        dateLabel: d.getDate(),
        done: tasksDone >= 3,
        isToday: dateStr === today,
        isFuture: d > now,
      })
    }
    return result
  },

  calcStreaks(today) {
    const now = new Date()
    let streak = 0
    let monthDays = 0
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Month days
    for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
      const ds = app.formatDate(new Date(d))
      const dd = app.getDayData(ds)
      const done = Object.values(dd.tasks || {}).filter(Boolean).length
      if (done >= 3) monthDays++
    }

    // Streak
    for (let i = 0; i < 60; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const ds = app.formatDate(d)
      const dd = app.getDayData(ds)
      const done = Object.values(dd.tasks || {}).filter(Boolean).length
      if (done >= 3) streak++
      else if (i > 0) break
    }

    return { streakDays: streak, monthDays }
  },

  getWeightDiff(today, todayW) {
    if (!todayW) return { lastWeight: '', weightDiff: 0 }
    const now = new Date()
    for (let i = 1; i <= 30; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const ds = app.formatDate(d)
      const dd = app.getDayData(ds)
      if (dd.weight) {
        return {
          lastWeight: dd.weight,
          weightDiff: parseFloat((todayW - dd.weight).toFixed(1))
        }
      }
    }
    return { lastWeight: '', weightDiff: 0 }
  },

  toggleTask(e) {
    const id = e.currentTarget.dataset.id
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    dayData.tasks[id] = !dayData.tasks[id]
    app.saveDayData(today, dayData)

    const tasks = this.data.tasks.map(t => {
      if (t.id !== id) return t
      const done = !!dayData.tasks[id]
      return {
        ...t, done,
        cardBg: done ? t.bgDone : t.bg,
        borderColor: done ? t.color : 'transparent',
        nameColor: done ? t.color : '#333',
        iconBg: done ? t.color : 'rgba(0,0,0,0.06)',
      }
    })
    const doneTasks = tasks.filter(t => t.done).length

    // Haptic
    wx.vibrateShort({ type: 'light' })

    if (dayData.tasks[id] && doneTasks === TASKS.length) {
      wx.showToast({ title: '🎉 今日任务全部完成！', icon: 'none', duration: 2000 })
    }

    this.setData({ tasks, doneTasks })
    // re-calc week streak
    setTimeout(() => this.loadPage(), 100)
  },

  toggleWater(e) {
    const idx = e.currentTarget.dataset.index
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    const newCount = idx + 1 === dayData.water ? idx : idx + 1
    dayData.water = newCount
    app.saveDayData(today, dayData)
    const waterPct = Math.min(100, Math.round(newCount / this.data.waterGoal * 100))
    wx.vibrateShort({ type: 'light' })
    this.setData({ waterCount: newCount, waterPct })
  },

  increaseWater() {
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    const goal = this.data.waterGoal
    if (dayData.water >= goal * 2) return
    dayData.water = (dayData.water || 0) + 1
    app.saveDayData(today, dayData)
    const waterPct = Math.min(100, Math.round(dayData.water / goal * 100))
    wx.vibrateShort({ type: 'light' })
    this.setData({ waterCount: dayData.water, waterPct })
  },

  decreaseWater() {
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    if (!dayData.water) return
    dayData.water--
    app.saveDayData(today, dayData)
    const waterPct = Math.min(100, Math.round(dayData.water / this.data.waterGoal * 100))
    this.setData({ waterCount: dayData.water, waterPct })
  },

  setMood(e) {
    const val = e.currentTarget.dataset.val
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    dayData.mood = val
    app.saveDayData(today, dayData)
    wx.vibrateShort({ type: 'light' })
    this.setData({ todayMood: val })
  },

  onWeightInput(e) {
    this.setData({ todayWeight: e.detail.value })
  },

  saveWeight() {
    const w = parseFloat(this.data.todayWeight)
    if (!w || w < 20 || w > 300) {
      wx.showToast({ title: '请输入有效体重', icon: 'none' })
      return
    }
    const targetDate = this.data.selectedWeightDate || app.globalData.today
    const dayData = app.getDayData(targetDate)
    dayData.weight = w
    app.saveDayData(targetDate, dayData)

    // Only sync profile weight when editing today's value.
    if (targetDate === app.globalData.today) {
      const profile = app.globalData.profile
      profile.weight = w
      app.globalData.profile = profile
      wx.setStorageSync('hc_profile', profile)
    }

    wx.showToast({ title: '体重已记录', icon: 'success' })
    this.loadPage(targetDate)
  },
})
