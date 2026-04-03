// pages/stats/stats.js
const app = getApp()

const TASKS_META = [
  { id: 'diet',     name: '健康饮食', icon: '🥗', color: '#1AAD74' },
  { id: 'water',    name: '喝够水',   icon: '💧', color: '#3B82F6' },
  { id: 'exercise', name: '运动',     icon: '🏃', color: '#F08C00' },
  { id: 'sleep',    name: '早睡早起', icon: '😴', color: '#7C3AED' },
  { id: 'meditate', name: '冥想',     icon: '🧘', color: '#EC4899' },
  { id: 'nosnack',  name: '不吃零食', icon: '🚫', color: '#EF4444' },
]

Page({
  data: {
    monthCheckinDays: 0,
    avgKcal: 0,
    avgWater: 0,
    kcalDays: [],
    macroItems: [],
    macroHasData: false,
    taskRates: [],
    weightData: [],
    weightMin: 0,
    weightMax: 0,
    bmi: 0,
    bmiStatus: '',
    bmiColor: '',
    bmiPos: 50,
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const today = app.globalData.today
    const profile = app.globalData.profile
    const now = new Date()

    // ── 7 day kcal ──
    const kcalDays = []
    const goal = profile.kcalGoal || 2000
    let totalKcal = 0, kcalCount = 0
    let totalWater = 0, waterCount = 0

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const ds = app.formatDate(d)
      const dd = app.getDayData(ds)
      const nut = app.computeNutrition(dd)
      const labels = ['日','一','二','三','四','五','六']
      kcalDays.push({
        date: ds,
        label: i === 0 ? '今' : labels[d.getDay()],
        kcal: nut.kcal,
        pct: nut.kcal ? Math.min(1, nut.kcal / goal) : 0,
      })
      if (nut.kcal > 0) { totalKcal += nut.kcal; kcalCount++ }
      if (dd.water > 0) { totalWater += dd.water; waterCount++ }
    }

    // ── Month stats ──
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    let monthCheckinDays = 0
    for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
      const ds = app.formatDate(new Date(d))
      const dd = app.getDayData(ds)
      const done = Object.values(dd.tasks || {}).filter(Boolean).length
      if (done >= 3) monthCheckinDays++
    }

    // ── Today nutrition ──
    const todayData = app.getDayData(today)
    const todayNut = app.computeNutrition(todayData)
    const totalMacroKcal = todayNut.carb * 4 + todayNut.prot * 4 + todayNut.fat * 9
    const macroItems = totalMacroKcal > 0 ? [
      { label: '碳水化合物', val: todayNut.carb, kcal: Math.round(todayNut.carb * 4), pct: Math.round(todayNut.carb * 4 / totalMacroKcal * 100), color: '#7CBF8E', bg: '#EEF8F1' },
      { label: '蛋白质', val: todayNut.prot, kcal: Math.round(todayNut.prot * 4), pct: Math.round(todayNut.prot * 4 / totalMacroKcal * 100), color: '#5D9BCF', bg: '#EEF5FB' },
      { label: '脂肪', val: todayNut.fat, kcal: Math.round(todayNut.fat * 9), pct: Math.round(todayNut.fat * 9 / totalMacroKcal * 100), color: '#E7A16C', bg: '#FFF3EA' },
    ] : [
      { label: '碳水化合物', val: 0, kcal: 0, pct: 0, color: '#7CBF8E', bg: '#EEF8F1' },
      { label: '蛋白质',     val: 0, kcal: 0, pct: 0, color: '#5D9BCF', bg: '#EEF5FB' },
      { label: '脂肪',       val: 0, kcal: 0, pct: 0, color: '#E7A16C', bg: '#FFF3EA' },
    ]

    // ── Task rates (this week) ──
    const taskRates = TASKS_META.map(t => {
      let done = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dd = app.getDayData(app.formatDate(d))
        if (dd.tasks && dd.tasks[t.id]) done++
      }
      return { ...t, rate: Math.round(done / 7 * 100) }
    })

    // ── Weight data ──
    const weightData = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const ds = app.formatDate(d)
      const dd = app.getDayData(ds)
      if (dd.weight) weightData.push({ date: ds, w: dd.weight })
    }
    const weights = weightData.map(w => w.w)
    const weightMin     = weights.length ? Math.min(...weights).toFixed(1) : '--'
    const weightMax     = weights.length ? Math.max(...weights).toFixed(1) : '--'
    const weightCurrent = weights.length ? weights[weights.length - 1].toFixed(1) : '--'
    const weightStart   = weights.length ? weights[0].toFixed(1) : '--'
    const weightChangePure = weights.length >= 2
      ? parseFloat((weights[weights.length - 1] - weights[0]).toFixed(1))
      : 0
    const weightChangeStr = weights.length >= 2
      ? (weightChangePure > 0 ? '+' : '') + weightChangePure + 'kg'
      : '--'
    const weightChangeColor = weightChangePure < 0 ? '#1AAD74' : weightChangePure > 0 ? '#EF4444' : '#888'
    const weightDays = weightData.length

    // ── BMI ──
    let bmi = 0, bmiStatus = '', bmiColor = '', bmiPos = 0
    if (profile.height && profile.weight) {
      const h = profile.height / 100
      bmi = (profile.weight / (h * h)).toFixed(1)
      if (bmi < 18.5) { bmiStatus = '偏轻'; bmiColor = '#3B82F6' }
      else if (bmi < 24) { bmiStatus = '正常'; bmiColor = '#1AAD74' }
      else if (bmi < 28) { bmiStatus = '超重'; bmiColor = '#F08C00' }
      else { bmiStatus = '肥胖'; bmiColor = '#EF4444' }
      bmiPos = Math.min(95, Math.max(5, ((bmi - 14) / 26) * 100))
    }

    this.setData({
      monthCheckinDays,
      avgKcal: kcalCount ? Math.round(totalKcal / kcalCount) : 0,
      avgWater: waterCount ? (totalWater / waterCount).toFixed(1) : 0,
      kcalDays,
      macroItems,
      macroHasData: totalMacroKcal > 0,
      taskRates,
      weightData,
      weightMin, weightMax,
      weightCurrent, weightStart,
      weightChangeStr, weightChangeColor, weightDays,
      bmi, bmiStatus, bmiColor, bmiPos,
    })

    // Draw charts — use createSelectorQuery to get real rendered sizes
    setTimeout(() => {
      wx.createSelectorQuery().in(this)
        .select('.chart-canvas').boundingClientRect()
        .select('.dist-canvas').boundingClientRect()
        .select('.weight-canvas').boundingClientRect()
        .exec((rects) => {
          const [kcalRect, macroRect, weightRect] = rects
          if (kcalRect) this.safeDraw(() => this.drawKcalChart(kcalDays, goal, kcalRect.width, kcalRect.height))
          if (macroRect) this.safeDraw(() => this.drawMacroChart(macroItems, todayNut.kcal, macroRect.width, macroRect.height))
          if (weightRect) this.safeDraw(() => this.drawWeightChart(weightData, weightRect.width, weightRect.height))
        })
    }, 100)
  },

  safeDraw(drawer) {
    try {
      drawer()
    } catch (error) {
      console.error('stats chart draw failed:', error)
    }
  },

  drawKcalChart(days, goal) {
    const ratio = app.globalData.windowWidth / 750
    // 750rpx screen - 24rpx*2 page padding - 32rpx*2 card padding = 638rpx content width
    const W = Math.round(638 * ratio)
    const H = Math.round(320 * ratio)
    const padL = Math.round(48 * ratio)
    const padR = Math.round(16 * ratio)
    const padT = Math.round(20 * ratio)
    const padB = Math.round(20 * ratio)
    const chartW = W - padL - padR
    const chartH = H - padT - padB
    const maxKcal = Math.max(goal * 1.3, ...days.map(d => d.kcal), 100)
    const barW = chartW / days.length * 0.55
    const barGap = chartW / days.length
    const fontSize = Math.round(18 * ratio)

    const ctx = wx.createCanvasContext('kcalChart', this)
    ctx.clearRect(0, 0, W, H)

    // No data state
    if (days.every(d => !d.kcal)) {
      ctx.setFillStyle('#F5F5F5')
      ctx.fillRect(padL, padT, chartW, chartH)
      ctx.setFillStyle('#CCCCCC')
      ctx.setFontSize(Math.round(22 * ratio))
      ctx.setTextAlign('center')
      ctx.fillText('前往饮食页记录三餐数据', W / 2, H / 2)
      ctx.setTextAlign('left')
      ctx.draw()
      return
    }

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + chartH - (i / 4) * chartH
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(W - padR, y)
      ctx.setStrokeStyle(i === 0 ? '#E0E0E0' : '#F5F5F5')
      ctx.setLineWidth(i === 0 ? 1 : 0.5)
      ctx.stroke()
      if (i > 0) {
        ctx.setFillStyle('#CCC')
        ctx.setFontSize(fontSize)
        ctx.fillText(Math.round(maxKcal * i / 4), 0, y + Math.round(6 * ratio))
      }
    }

    // Goal line
    const goalY = padT + chartH - (goal / maxKcal) * chartH
    ctx.beginPath()
    ctx.moveTo(padL, goalY)
    ctx.lineTo(W - padR, goalY)
    ctx.setStrokeStyle('#1AAD74')
    ctx.setLineWidth(1)
    ctx.setLineDash([Math.round(8 * ratio), Math.round(6 * ratio)])
    ctx.stroke()
    ctx.setLineDash([])

    // Bars
    days.forEach((d, i) => {
      if (!d.kcal) return
      const x = padL + i * barGap + (barGap - barW) / 2
      const barH = (d.kcal / maxKcal) * chartH
      const y = padT + chartH - barH

      const color = d.kcal >= goal * 1.1 ? '#EF4444'
        : d.kcal >= goal * 0.85 ? '#1AAD74'
        : '#F08C00'

      ctx.beginPath()
      ctx.setFillStyle(color)
      const r = Math.min(Math.round(8 * ratio), barH / 2)
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barW - r, y)
      ctx.arcTo(x + barW, y, x + barW, y + r, r)
      ctx.lineTo(x + barW, y + barH)
      ctx.lineTo(x, y + barH)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
      ctx.fill()

      if (d.kcal > 0) {
        ctx.setFillStyle('#666')
        ctx.setFontSize(fontSize)
        ctx.setTextAlign('center')
        ctx.fillText(d.kcal, x + barW / 2, y - Math.round(6 * ratio))
      }
    })

    ctx.setTextAlign('left')
    ctx.draw()
  },

  drawMacroChart(items, totalKcal) {
    const W = 152
    const H = 152
    const cx = 76
    const cy = 76
    const r = 48
    const lineW = 12

    const ctx = wx.createCanvasContext('macroChart', this)
    ctx.clearRect(0, 0, W, H)

    if (items[0].val === 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      ctx.setStrokeStyle('#E8EEF0')
      ctx.setLineWidth(lineW)
      ctx.stroke()
      ctx.setFillStyle('#A8B4BE')
      ctx.setFontSize(11)
      ctx.setTextAlign('center')
      ctx.fillText('暂无饮食记录', cx, cy - 2)
      ctx.setFillStyle('#C0C8D2')
      ctx.setFontSize(10)
      ctx.fillText('记录后自动生成', cx, cy + 16)
      ctx.setTextAlign('left')
      ctx.draw()
      return
    }

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#E8EEF0')
    ctx.setLineWidth(lineW)
    ctx.stroke()

    let startAngle = -Math.PI / 2
    const gap = 0.06
    items.forEach(item => {
      const angle = (item.pct / 100) * 2 * Math.PI
      if (angle <= 0) return
      const drawStart = startAngle + gap / 2
      const drawEnd = startAngle + angle - gap / 2
      if (drawEnd <= drawStart) {
        startAngle += angle
        return
      }
      ctx.beginPath()
      ctx.arc(cx, cy, r, drawStart, drawEnd)
      ctx.setStrokeStyle(item.color)
      ctx.setLineWidth(lineW)
      ctx.stroke()
      startAngle += angle
    })

    // Center text
    ctx.setFillStyle('#8C98A8')
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.fillText('总摄入', cx, cy - 12)
    ctx.setFillStyle('#162033')
    ctx.setFontSize(15)
    ctx.fillText(totalKcal || 0, cx, cy + 2)
    ctx.setFillStyle('#A1ACB8')
    ctx.setFontSize(10)
    ctx.fillText('kcal', cx, cy + 18)

    ctx.setTextAlign('left')
    ctx.draw()
  },

  drawWeightChart(data) {
    const ratio = app.globalData.windowWidth / 750
    const W = Math.round(638 * ratio)
    const H = Math.round(300 * ratio)
    const padL = Math.round(56 * ratio)
    const padR = Math.round(16 * ratio)
    const padT = Math.round(24 * ratio)
    const padB = Math.round(24 * ratio)
    const chartW = W - padL - padR
    const chartH = H - padT - padB
    const fontSize = Math.round(18 * ratio)

    const ctx = wx.createCanvasContext('weightChart', this)
    ctx.clearRect(0, 0, W, H)

    // No data state
    if (data.length === 0) {
      ctx.setFillStyle('#F5F5F5')
      ctx.fillRect(padL, padT, chartW, chartH)
      ctx.setFillStyle('#CCC')
      ctx.setFontSize(Math.round(22 * ratio))
      ctx.setTextAlign('center')
      ctx.fillText('前往打卡页记录体重', W / 2, H / 2)
      ctx.setTextAlign('left')
      ctx.draw()
      return
    }

    // Single point
    if (data.length === 1) {
      ctx.setFillStyle('#F5F5F5')
      ctx.fillRect(padL, padT, chartW, chartH)
      ctx.setFillStyle('#AAA')
      ctx.setFontSize(Math.round(22 * ratio))
      ctx.setTextAlign('center')
      ctx.fillText('再记录一次体重即可查看趋势', W / 2, H / 2 - Math.round(14 * ratio))
      ctx.setFillStyle('#1AAD74')
      ctx.setFontSize(Math.round(30 * ratio))
      ctx.fillText(data[0].w + ' kg', W / 2, H / 2 + Math.round(20 * ratio))
      ctx.setTextAlign('left')
      ctx.draw()
      return
    }

    const weights = data.map(d => d.w)
    const rawMin = Math.min(...weights)
    const rawMax = Math.max(...weights)
    const padding = Math.max((rawMax - rawMin) * 0.3, 0.5)
    const minW = rawMin - padding
    const maxW = rawMax + padding

    // Grid lines + Y labels
    const gridCount = 4
    for (let i = 0; i <= gridCount; i++) {
      const y = padT + (i / gridCount) * chartH
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(W - padR, y)
      ctx.setStrokeStyle(i === gridCount ? '#E8E8E8' : '#F5F5F5')
      ctx.setLineWidth(i === gridCount ? 1 : 0.5)
      ctx.stroke()
      const val = maxW - (i / gridCount) * (maxW - minW)
      ctx.setFillStyle('#BBBBBB')
      ctx.setFontSize(fontSize)
      ctx.setTextAlign('right')
      ctx.fillText(val.toFixed(1), padL - Math.round(6 * ratio), y + Math.round(6 * ratio))
    }
    ctx.setTextAlign('left')

    // Compute points
    const pts = data.map((d, i) => ({
      x: padL + (i / (data.length - 1)) * chartW,
      y: padT + ((maxW - d.w) / (maxW - minW)) * chartH,
      w: d.w,
    }))

    // Area fill
    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.lineTo(pts[pts.length - 1].x, padT + chartH)
    ctx.lineTo(pts[0].x, padT + chartH)
    ctx.closePath()
    ctx.setFillStyle('rgba(26,173,116,0.10)')
    ctx.fill()

    // Line (smooth-ish via straight segments)
    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.setStrokeStyle('#1AAD74')
    ctx.setLineWidth(Math.round(3 * ratio))
    ctx.setLineJoin('round')
    ctx.stroke()

    // Dots + value labels for first, last, min, max
    const specialIdx = new Set([0, pts.length - 1,
      weights.indexOf(rawMin), weights.indexOf(rawMax)])
    const dotR = Math.round(5 * ratio)

    pts.forEach((p, i) => {
      const isSpecial = specialIdx.has(i)
      ctx.beginPath()
      ctx.arc(p.x, p.y, isSpecial ? Math.round(6 * ratio) : dotR, 0, 2 * Math.PI)
      ctx.setFillStyle(isSpecial ? '#1AAD74' : 'rgba(26,173,116,0.4)')
      ctx.fill()
      if (isSpecial) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.round(3 * ratio), 0, 2 * Math.PI)
        ctx.setFillStyle('#fff')
        ctx.fill()
        // Label
        const above = p.y > padT + Math.round(28 * ratio)
        ctx.setFillStyle('#1AAD74')
        ctx.setFontSize(Math.round(17 * ratio))
        ctx.setTextAlign('center')
        ctx.fillText(p.w + 'kg', p.x, above ? p.y - Math.round(12 * ratio) : p.y + Math.round(22 * ratio))
      }
    })

    ctx.setTextAlign('left')
    ctx.draw()
  },
})
