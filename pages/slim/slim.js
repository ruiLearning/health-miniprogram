const app = getApp()

const CHECKIN_TASKS = [
  { id: 'diet', name: '健康饮食', icon: '🥗' },
  { id: 'water', name: '喝够水', icon: '💧' },
  { id: 'exercise', name: '运动30分', icon: '🏃' },
  { id: 'sleep', name: '早睡早起', icon: '😴' },
  { id: 'meditate', name: '冥想放松', icon: '🧘' },
  { id: 'nosnack', name: '不吃零食', icon: '🚫' },
]

const MASTER_PREVIEWS = [
  '按体重算三大营养素',
  '提升食物质量比硬饿更重要',
  '主流减肥方法怎么选',
]

Page({
  data: {
    profileName: '健康达人',
    weight: '--',
    bmi: '--',
    kcalTarget: 0,
    waterGoal: 0,
    todayKcal: 0,
    todayWater: 0,
    todayWeight: '--',
    taskDone: 0,
    taskTotal: 4,
    activeTab: 0,
    topTabs: [
      { key: 'diet', label: '饮食记录' },
      { key: 'checkin', label: '每日打卡' },
      { key: 'stats', label: '数据统计' },
      { key: 'masters', label: '大神训练法' },
      { key: 'profile', label: '减肥设置' },
    ],
    modulePanels: [
      {
        title: '饮食记录',
        desc: '记录三餐、查看热量和三大营养素',
        badge: '今天吃了什么',
        accent: 'green',
        url: '/pages/diet/diet',
        stats: [],
      },
      {
        title: '每日打卡',
        desc: '水量、体重、心情和习惯任务都在这里',
        badge: '每天坚持',
        accent: 'amber',
        url: '/pages/checkin/checkin',
        stats: [],
      },
      {
        title: '数据统计',
        desc: '看趋势、完成率和近 30 天体重变化',
        badge: '趋势复盘',
        accent: 'blue',
        url: '/pages/stats/stats',
        stats: [],
      },
      {
        title: '大神训练法',
        desc: '保留原来的减脂内容合集，随时回看',
        badge: '方法参考',
        accent: 'purple',
        url: '/pages/masters/masters',
        stats: [],
      },
      {
        title: '减肥设置',
        desc: '原“我的”页，继续管理个人资料和目标',
        badge: '原我的',
        accent: 'coral',
        url: '/pages/profile/profile',
        stats: [],
      },
    ],
  },

  onShow() {
    this.loadSummary()
  },

  loadSummary() {
    const profile = wx.getStorageSync('hc_profile') || app.globalData.profile || {}
    const today = app.globalData.today
    const dayData = app.getDayData(today)
    const nutrition = app.computeNutrition(dayData)
    const bmi = this.calcBMI(profile)
    const doneTasks = Object.values(dayData.tasks || {}).filter(Boolean).length
    const weightMap = wx.getStorageSync('hc_weights') || {}
    const macroPlan = app.getTanMacroPlan(profile)
    const weekKcal = this.buildWeekKcal(profile)
    const weekTaskRates = this.buildWeekTaskRates()
    const modulePanels = this.buildModulePanels({
      today,
      profile,
      dayData,
      nutrition,
      bmi,
      macroPlan,
      doneTasks,
      taskTotal: Object.keys(dayData.tasks || {}).length || 4,
      todayWater: dayData.water || 0,
      todayWeight: weightMap[today] || '--',
      kcalTarget: macroPlan.kcalTarget || profile.kcalGoal || 0,
      weekKcal,
      weekTaskRates,
    })

    this.setData({
      profileName: profile.name || '健康达人',
      weight: profile.weight || '--',
      bmi: bmi || '--',
      kcalTarget: macroPlan.kcalTarget || profile.kcalGoal || 0,
      waterGoal: profile.waterGoal || 8,
      todayKcal: nutrition.kcal || 0,
      todayWater: dayData.water || 0,
      todayWeight: weightMap[today] || '--',
      taskDone: doneTasks,
      taskTotal: Object.keys(dayData.tasks || {}).length || 4,
      modulePanels,
    }, () => {
      if (this.data.activeTab === 0) this.drawMacroPie()
    })
  },

  buildModulePanels(summary) {
    const macroBars = this.buildMacroBars(summary.nutrition, summary.macroPlan)
    const waterGoal = summary.profile.waterGoal || 8
    const waterCups = Array.from({ length: Math.min(waterGoal, 10) }, (_, index) => ({
      filled: index < (summary.todayWater || 0),
    }))
    const taskChips = CHECKIN_TASKS.map((task) => ({
      ...task,
      done: !!(summary.dayData.tasks || {})[task.id],
    }))
    const settings = [
      { label: '昵称', value: summary.profile.name || '健康达人' },
      { label: '性别', value: summary.profile.gender === 'female' ? '女' : '男' },
      { label: '年龄', value: summary.profile.age ? `${summary.profile.age} 岁` : '--' },
      { label: '身高', value: summary.profile.height ? `${summary.profile.height} cm` : '--' },
      { label: '体重', value: summary.profile.weight ? `${summary.profile.weight} kg` : '--' },
      { label: '饮水目标', value: `${summary.profile.waterGoal || 8} 杯` },
    ]

    return [
      {
        title: '饮食记录',
        desc: '记录三餐、查看热量和三大营养素，今天的饮食状态可以先从这里开始。',
        badge: '今天吃了什么',
        accent: 'green',
        url: '/pages/diet/diet',
        cta: '进入饮食记录',
        stats: [
          { label: '今日热量', value: summary.nutrition.kcal || 0, unit: '千卡' },
          { label: '目标热量', value: summary.kcalTarget || 0, unit: '千卡' },
          { label: 'BMI', value: summary.bmi || '--', unit: '' },
        ],
        macroBars,
      },
      {
        title: '每日打卡',
        desc: '饮水、体重、心情和习惯任务都放在这里，适合每天快速完成。',
        badge: '每天坚持',
        accent: 'amber',
        url: '/pages/checkin/checkin',
        cta: '进入每日打卡',
        stats: [
          { label: '今日饮水', value: summary.todayWater || 0, unit: '杯' },
          { label: '今日体重', value: summary.todayWeight, unit: summary.todayWeight === '--' ? '' : 'kg' },
          { label: '任务完成', value: `${summary.doneTasks}/${summary.taskTotal}`, unit: '' },
        ],
        waterCups,
        taskChips,
      },
      {
        title: '数据统计',
        desc: '看热量、体重和完成率趋势，适合用来复盘最近一段时间的变化。',
        badge: '趋势复盘',
        accent: 'blue',
        url: '/pages/stats/stats',
        cta: '进入数据统计',
        stats: [
          { label: '当前体重', value: summary.profile.weight || '--', unit: summary.profile.weight ? 'kg' : '' },
          { label: 'BMI', value: summary.bmi || '--', unit: '' },
          { label: '今日热量', value: summary.nutrition.kcal || 0, unit: '千卡' },
        ],
        weekKcal: summary.weekKcal,
        weekTaskRates: summary.weekTaskRates,
      },
      {
        title: '大神训练法',
        desc: '原来的减脂内容合集还在，想看方法、案例和饮食思路时可以切到这里。',
        badge: '方法参考',
        accent: 'purple',
        url: '/pages/masters/masters',
        cta: '进入大神训练法',
        stats: [
          { label: '适配目标', value: '减脂', unit: '' },
          { label: '内容类型', value: '方法合集', unit: '' },
          { label: '浏览方式', value: '按专题看', unit: '' },
        ],
        previews: MASTER_PREVIEWS,
      },
      {
        title: '减肥设置',
        desc: '这里就是原来的“我的”，继续管理基础资料、热量目标、饮水目标和餐次配置。',
        badge: '原我的',
        accent: 'coral',
        url: '/pages/profile/profile',
        cta: '进入减肥设置',
        stats: [
          { label: '当前体重', value: summary.profile.weight || '--', unit: summary.profile.weight ? 'kg' : '' },
          { label: '饮水目标', value: summary.profile.waterGoal || 8, unit: '杯' },
          { label: '目标热量', value: summary.kcalTarget || 0, unit: '千卡' },
        ],
        settings,
      },
    ]
  },

  buildMacroBars(nutrition, macroPlan) {
    const items = [
      {
        label: '碳水',
        current: Math.round(nutrition.carb || 0),
        target: macroPlan.carbTarget || 0,
        color: '#f59e0b',
        icon: '🍚',
      },
      {
        label: '蛋白',
        current: Math.round(nutrition.prot || 0),
        target: macroPlan.protTarget || 0,
        color: '#3b82f6',
        icon: '🥩',
      },
      {
        label: '脂肪',
        current: Math.round(nutrition.fat || 0),
        target: macroPlan.fatTarget || 0,
        color: '#ef4444',
        icon: '🥑',
      },
    ]
    return items.map((item) => ({
      ...item,
      pct: item.target ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0,
    }))
  },

  buildWeekKcal(profile = {}) {
    const now = new Date()
    const goal = profile.kcalGoal || 2000
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    return Array.from({ length: 7 }, (_, index) => {
      const offset = 6 - index
      const d = new Date(now)
      d.setDate(now.getDate() - offset)
      const dayData = app.getDayData(app.formatDate(d))
      const kcal = app.computeNutrition(dayData).kcal || 0
      return {
        label: offset === 0 ? '今' : labels[d.getDay()],
        kcal,
        height: kcal ? Math.max(12, Math.round((Math.min(kcal, goal) / goal) * 92)) : 12,
      }
    })
  },

  buildWeekTaskRates() {
    const now = new Date()
    return CHECKIN_TASKS.slice(0, 3).map((task) => {
      let done = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dayData = app.getDayData(app.formatDate(d))
        if ((dayData.tasks || {})[task.id]) done += 1
      }
      return {
        label: task.name,
        value: `${Math.round((done / 7) * 100)}%`,
      }
    })
  },

  calcBMI(profile = {}) {
    const height = Number(profile.height) || 0
    const weight = Number(profile.weight) || 0
    if (!height || !weight) return ''
    const meter = height / 100
    return (weight / (meter * meter)).toFixed(1)
  },

  switchTab(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    this.setData({ activeTab: index }, () => {
      if (index === 0) this.drawMacroPie()
    })
  },

  onSwiperChange(e) {
    const current = e.detail.current
    this.setData({ activeTab: current }, () => {
      if (current === 0) this.drawMacroPie()
    })
  },

  drawMacroPie() {
    const panel = (this.data.modulePanels || [])[0]
    if (!panel || !panel.macroBars || !panel.macroBars.length) return

    const values = panel.macroBars.map((item) => Math.max(0, Number(item.current) || 0))
    const total = values.reduce((sum, value) => sum + value, 0)
    const ctx = wx.createCanvasContext('macroPie', this)
    const size = 180
    const center = size / 2
    const radius = 64
    const innerRadius = 34

    ctx.clearRect(0, 0, size, size)

    if (!total) {
      ctx.beginPath()
      ctx.arc(center, center, radius, 0, Math.PI * 2)
      ctx.setFillStyle('#E2E8F0')
      ctx.fill()
      ctx.beginPath()
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2)
      ctx.setFillStyle('#FFFFFF')
      ctx.fill()
      ctx.setFillStyle('#94A3B8')
      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.fillText('暂无记录', center, center + 4)
      ctx.draw()
      return
    }

    let start = -Math.PI / 2
    panel.macroBars.forEach((item, index) => {
      const ratio = values[index] / total
      const end = start + Math.PI * 2 * ratio
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, start, end)
      ctx.closePath()
      ctx.setFillStyle(item.color)
      ctx.fill()
      start = end
    })

    ctx.beginPath()
    ctx.arc(center, center, innerRadius, 0, Math.PI * 2)
    ctx.setFillStyle('#FFFFFF')
    ctx.fill()

    ctx.setFillStyle('#64748B')
    ctx.setFontSize(11)
    ctx.setTextAlign('center')
    ctx.fillText('今日摄入', center, center - 4)
    ctx.setFillStyle('#122033')
    ctx.setFontSize(14)
    ctx.fillText(`${Math.round(total)}g`, center, center + 16)
    ctx.draw()
  },

  openEntry(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return
    wx.navigateTo({ url })
  },
})
