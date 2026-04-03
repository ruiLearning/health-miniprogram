// pages/profile/profile.js
const app = getApp()

const ACTIVITY_OPTIONS = [
  { label: '久坐 (基本不运动)',    val: 1.2   },
  { label: '轻度活动 (每周1-3次)', val: 1.375 },
  { label: '中度活动 (每周3-5次)', val: 1.55  },
  { label: '高度活动 (每周6-7次)', val: 1.725 },
  { label: '极度活动 (每天高强度)', val: 1.9  },
]

Page({
  data: {
    profile: {},
    form: {
      name: '',
      avatarUrl: '',
      gender: 'male',
      age: '',
      height: '',
      weight: '',
      kcalGoal: '',
      waterGoal: '',
      activity: 1.55,
    },
    activityIndex: 2,
    activityOptions: ACTIVITY_OPTIONS,
    bmi: 0,
    bmr: 0,
    tdee: 0,
    avatarLoadFailed: false,
    displayInitial: '健',
    bmiLabel: '',
    bmiTagClass: 'green-tag',
    kcalHint: '',
    kcalHintClass: 'amber-tag',
    waterHint: '',
    waterHintClass: 'blue-tag',
    weightHint: '',
    weightHintClass: 'green-tag',
    bmrHint: '',
    bmrHintClass: 'blue-tag',
    healthyWeightHint: '',
    healthyWeightHintClass: 'green-tag',
    isDirty: false,
    savedProfile: null,
  },

  onShow() {
    this.loadProfile()
  },

  loadProfile() {
    const p = app.globalData.profile || {}
    const savedProfile = wx.getStorageSync('hc_profile') || p
    const activityIndex = ACTIVITY_OPTIONS.findIndex(o => o.val === p.activity) ?? 2

    const bmi = this.calcBMI(p)
    const bmiStatus = this.getBMIStatus(bmi)
    const bmr = this.calcBMR(p)
    const tdee = bmr ? Math.round(bmr * (p.activity || 1.55)) : 0
    const displayName = p.name || '健康达人'
    const headerHints = this.getHeaderHints({ ...p, bmi, tdee })

    this.setData({
      profile: p,
      form: {
        name:      p.name      || '',
        avatarUrl: p.avatarUrl || '',
        gender:    p.gender    || 'male',
        age:       p.age       ? String(p.age)       : '',
        height:    p.height    ? String(p.height)    : '',
        weight:    p.weight    ? String(p.weight)    : '',
        kcalGoal:  p.kcalGoal  ? String(p.kcalGoal)  : '',
        waterGoal: p.waterGoal ? String(p.waterGoal) : '8',
        activity:  p.activity  || 1.55,
      },
      activityIndex: activityIndex >= 0 ? activityIndex : 2,
      bmi,
      bmiLabel: bmiStatus.label,
      bmiTagClass: bmiStatus.className,
      kcalHint: headerHints.kcalHint,
      kcalHintClass: headerHints.kcalHintClass,
      waterHint: headerHints.waterHint,
      waterHintClass: headerHints.waterHintClass,
      weightHint: headerHints.weightHint,
      weightHintClass: headerHints.weightHintClass,
      bmrHint: headerHints.bmrHint,
      bmrHintClass: headerHints.bmrHintClass,
      healthyWeightHint: headerHints.healthyWeightHint,
      healthyWeightHintClass: headerHints.healthyWeightHintClass,
      bmr: Math.round(bmr),
      tdee,
      avatarLoadFailed: false,
      displayInitial: displayName.charAt(0),
      isDirty: false,
      savedProfile,
    })
  },

  calcBMI(p) {
    if (!p.height || !p.weight) return 0
    const h = p.height / 100
    return (p.weight / (h * h)).toFixed(1)
  },

  getBMIStatus(bmiValue) {
    const bmi = parseFloat(bmiValue)
    if (!bmi) return { label: '', className: 'green-tag' }
    if (bmi < 18.5) return { label: '偏瘦', className: 'blue-tag' }
    if (bmi < 24) return { label: '正常', className: 'green-tag' }
    if (bmi < 28) return { label: '超重', className: 'amber-tag' }
    return { label: '肥胖', className: 'coral-tag' }
  },

  getHeaderHints(profile) {
    const bmi = parseFloat(profile.bmi)
    const kcalGoal = parseInt(profile.kcalGoal, 10) || 0
    const waterGoal = parseInt(profile.waterGoal, 10) || 0
    const weight = parseFloat(profile.weight) || 0
    const activityVal = parseFloat(profile.activity) || 0
    const todayData = app.getDayData(app.globalData.today)
    const actualWater = todayData.water || 0

    let kcalHint = ''
    let kcalHintClass = 'amber-tag'
    if (kcalGoal) {
      if (kcalGoal < 1200) {
        kcalHint = `热量偏低 ${kcalGoal}千卡`
        kcalHintClass = 'coral-tag'
      } else if (kcalGoal > 2800) {
        kcalHint = `热量偏高 ${kcalGoal}千卡`
        kcalHintClass = 'amber-tag'
      } else {
        kcalHint = `热量目标 ${kcalGoal}千卡`
        kcalHintClass = 'amber-tag'
      }
    }

    let waterHint = ''
    let waterHintClass = 'blue-tag'
    const recommendedWater = weight
      ? Math.max(6, Math.round((weight * 0.033) / 0.25) + (activityVal >= 1.55 ? 1 : 0))
      : 8
    if (waterGoal || recommendedWater) {
      const targetWater = waterGoal || recommendedWater
      if (actualWater >= targetWater) {
        waterHint = `今日饮水 ${actualWater}/${targetWater}杯`
        waterHintClass = 'blue-tag'
      } else if (actualWater > 0) {
        waterHint = `今日饮水 ${actualWater}/${targetWater}杯`
        waterHintClass = 'coral-tag'
      } else if (waterGoal) {
        waterHint = `饮水目标 ${targetWater}杯`
        waterHintClass = 'blue-tag'
      } else {
        waterHint = `饮水建议 ${targetWater}杯`
        waterHintClass = 'blue-tag'
      }
    }

    let weightHint = ''
    let weightHintClass = 'green-tag'
    const height = parseFloat(profile.height) || 0
    let healthyWeightHint = ''
    if (height) {
      const meter = height / 100
      const minWeight = (18.5 * meter * meter).toFixed(1)
      const maxWeight = (23.9 * meter * meter).toFixed(1)
      healthyWeightHint = `${minWeight}-${maxWeight}kg`
    }

    if (weight) {
      if (bmi && bmi < 18.5) {
        weightHint = `当前 ${weight}kg · 建议 ${healthyWeightHint || '--'} · 偏瘦`
        weightHintClass = 'blue-tag'
      } else if (bmi && bmi >= 24) {
        weightHint = `当前 ${weight}kg · 建议 ${healthyWeightHint || '--'} · 控制体重`
        weightHintClass = 'amber-tag'
      } else {
        weightHint = `当前 ${weight}kg · 建议 ${healthyWeightHint || '--'} · 保持节奏`
        weightHintClass = 'green-tag'
      }
    }

    let bmrHint = ''
    let bmrHintClass = 'blue-tag'
    if (profile.tdee) {
      const bmr = Math.round(profile.tdee / (parseFloat(profile.activity) || 1.55))
      bmrHint = `基础代谢 ${bmr}千卡`
      bmrHintClass = 'blue-tag'
    }

    let healthyWeightHintClass = 'green-tag'
    if (height) {
      healthyWeightHint = `建议体重 ${healthyWeightHint}`
      healthyWeightHintClass = bmi && (bmi < 18.5 || bmi >= 24) ? 'amber-tag' : 'green-tag'
    }

    return {
      kcalHint,
      kcalHintClass,
      waterHint,
      waterHintClass,
      weightHint,
      weightHintClass,
      bmrHint,
      bmrHintClass,
      healthyWeightHint,
      healthyWeightHintClass,
    }
  },

  calcBMR(p) {
    if (!p.height || !p.weight || !p.age) return 0
    return p.gender === 'female'
      ? 655 + 9.6 * p.weight + 1.8 * p.height - 4.7 * p.age
      : 66  + 13.7 * p.weight + 5  * p.height - 6.8 * p.age
  },

  persistProfileDraft(extra = {}) {
    const current = app.globalData.profile || {}
    const draft = {
      ...current,
      ...extra,
    }
    app.globalData.profile = draft
  },

  buildProfileFromForm(form = this.data.form) {
    return {
      name: (form.name || '').trim(),
      avatarUrl: form.avatarUrl || '',
      gender: form.gender || 'male',
      age: parseFloat(form.age) || 25,
      height: parseFloat(form.height) || 170,
      weight: parseFloat(form.weight) || 65,
      kcalGoal: parseInt(form.kcalGoal, 10) || 2000,
      waterGoal: parseInt(form.waterGoal, 10) || 8,
      activity: parseFloat(form.activity) || 1.55,
    }
  },

  updateDirtyState(form = this.data.form) {
    const savedProfile = this.data.savedProfile || wx.getStorageSync('hc_profile') || {}
    const currentProfile = this.buildProfileFromForm(form)
    const isDirty = JSON.stringify(currentProfile) !== JSON.stringify(savedProfile)
    this.setData({ isDirty })
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const val = e.detail.value
    const nextForm = {
      ...this.data.form,
      [key]: val,
    }
    this.setData({ [`form.${key}`]: val })
    this.updateDirtyState(nextForm)

    // live-update BMI / BMR preview
    if (['height', 'weight', 'age', 'gender', 'kcalGoal', 'waterGoal'].includes(key)) {
      const f = this.data.form
      const preview = {
        ...f,
        [key]: val,
        height: parseFloat(key === 'height' ? val : f.height),
        weight: parseFloat(key === 'weight' ? val : f.weight),
        age:    parseFloat(key === 'age'    ? val : f.age),
      }
      const bmi = this.calcBMI(preview)
      const bmiStatus = this.getBMIStatus(bmi)
      const bmr = this.calcBMR(preview)
      const tdee = bmr ? Math.round(bmr * (parseFloat(f.activity) || 1.55)) : 0
      const headerHints = this.getHeaderHints({
        ...preview,
        bmi,
        kcalGoal: f.kcalGoal,
        waterGoal: f.waterGoal,
        tdee,
      })
      this.setData({
        bmi,
        bmiLabel: bmiStatus.label,
        bmiTagClass: bmiStatus.className,
        kcalHint: headerHints.kcalHint,
        kcalHintClass: headerHints.kcalHintClass,
        waterHint: headerHints.waterHint,
        waterHintClass: headerHints.waterHintClass,
        weightHint: headerHints.weightHint,
        weightHintClass: headerHints.weightHintClass,
        bmrHint: headerHints.bmrHint,
        bmrHintClass: headerHints.bmrHintClass,
        healthyWeightHint: headerHints.healthyWeightHint,
        healthyWeightHintClass: headerHints.healthyWeightHintClass,
        bmr: Math.round(bmr),
        tdee
      })
    }
  },

  onNicknameInput(e) {
    const val = (e.detail.value || '').trim()
    const displayName = val || '健康达人'
    const nextForm = {
      ...this.data.form,
      name: val,
    }
    this.setData({
      'form.name': val,
      displayInitial: displayName.charAt(0),
    })
    if (val) this.persistProfileDraft({ name: val })
    this.updateDirtyState(nextForm)
  },

  onNicknameBlur(e) {
    this.onNicknameInput(e)
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl || ''
    if (avatarUrl) {
      const nextForm = {
        ...this.data.form,
        avatarUrl,
      }
      this.setData({
        'form.avatarUrl': avatarUrl,
        'profile.avatarUrl': avatarUrl,
        avatarLoadFailed: false,
      })
      this.persistProfileDraft({ avatarUrl })
      this.updateDirtyState(nextForm)
    }
    this.syncWechatProfile()
  },

  onAvatarError() {
    this.setData({
      avatarLoadFailed: true,
      'form.avatarUrl': '',
      'profile.avatarUrl': '',
    })
  },

  syncWechatProfile() {
    if (!wx.getUserProfile) {
      wx.showToast({ title: '请直接点头像和昵称获取微信信息', icon: 'none' })
      return
    }

    wx.getUserProfile({
      desc: '用于同步微信头像和昵称',
      success: (res) => {
        const userInfo = res.userInfo || {}
        const updates = {}
        const profileDraft = {}
        if (userInfo.nickName) updates['form.name'] = userInfo.nickName
        if (userInfo.avatarUrl) updates['form.avatarUrl'] = userInfo.avatarUrl
        if (userInfo.nickName) updates['profile.name'] = userInfo.nickName
        if (userInfo.avatarUrl) updates['profile.avatarUrl'] = userInfo.avatarUrl
        if (userInfo.nickName) profileDraft.name = userInfo.nickName
        if (userInfo.avatarUrl) profileDraft.avatarUrl = userInfo.avatarUrl

        if (!Object.keys(updates).length) {
          wx.showToast({ title: '未获取到可同步资料', icon: 'none' })
          return
        }
        this.setData(updates)
        this.persistProfileDraft(profileDraft)
        if (userInfo.nickName) {
          this.setData({ displayInitial: userInfo.nickName.charAt(0) })
        }
        this.updateDirtyState({
          ...this.data.form,
          ...(userInfo.nickName ? { name: userInfo.nickName } : {}),
          ...(userInfo.avatarUrl ? { avatarUrl: userInfo.avatarUrl } : {}),
        })
        wx.showToast({ title: '已同步微信资料', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '请点头像和昵称使用微信信息', icon: 'none' })
      }
    })
  },

  setGender(e) {
    const val = e.currentTarget.dataset.val
    this.setData({ 'form.gender': val })
    const f = this.data.form
    const preview = { ...f, gender: val, height: parseFloat(f.height), weight: parseFloat(f.weight), age: parseFloat(f.age) }
    const bmr = this.calcBMR(preview)
    const tdee = bmr ? Math.round(bmr * (parseFloat(f.activity) || 1.55)) : 0
    this.setData({ bmr: Math.round(bmr), tdee })
  },

  onActivityChange(e) {
    const idx = parseInt(e.detail.value)
    const actVal = ACTIVITY_OPTIONS[idx].val
    this.setData({ activityIndex: idx, 'form.activity': actVal })
    const f = this.data.form
    const bmr = this.calcBMR({ ...f, height: parseFloat(f.height), weight: parseFloat(f.weight), age: parseFloat(f.age) })
    const tdee = bmr ? Math.round(bmr * actVal) : 0
    this.setData({ tdee })
  },

  autoCalcKcal() {
    const f = this.data.form
    const p = {
      gender: f.gender,
      height: parseFloat(f.height),
      weight: parseFloat(f.weight),
      age:    parseFloat(f.age),
      activity: parseFloat(f.activity),
    }
    if (!p.height || !p.weight || !p.age) {
      wx.showToast({ title: '请先填写身高、体重和年龄', icon: 'none' })
      return
    }
    const bmr  = this.calcBMR(p)
    const tdee = Math.round(bmr * (p.activity || 1.55))
    const kcalGoal = tdee - 200  // light deficit as default
    this.setData({
      'form.kcalGoal': String(kcalGoal),
      bmr: Math.round(bmr),
      tdee,
    })
    wx.showToast({ title: `推荐热量 ${kcalGoal} 千卡`, icon: 'none', duration: 2000 })
  },

  saveProfile() {
    const f = this.data.form

    if (!f.name || !f.name.trim()) {
      wx.showToast({ title: '请填写昵称', icon: 'none' }); return
    }

    const profile = {
      name:      f.name.trim(),
      avatarUrl: f.avatarUrl || '',
      gender:    f.gender,
      age:       parseFloat(f.age)       || 25,
      height:    parseFloat(f.height)    || 170,
      weight:    parseFloat(f.weight)    || 65,
      kcalGoal:  parseInt(f.kcalGoal)    || 2000,
      waterGoal: parseInt(f.waterGoal)   || 8,
      activity:  parseFloat(f.activity)  || 1.55,
    }

    app.globalData.profile = profile
    wx.setStorageSync('hc_profile', profile)

    const bmi = this.calcBMI(profile)
    const bmiStatus = this.getBMIStatus(bmi)
    const bmr = this.calcBMR(profile)
    const tdee = bmr ? Math.round(bmr * profile.activity) : 0
    const headerHints = this.getHeaderHints({ ...profile, bmi, tdee })
    this.setData({
      profile,
      bmi,
      bmiLabel: bmiStatus.label,
      bmiTagClass: bmiStatus.className,
      kcalHint: headerHints.kcalHint,
      kcalHintClass: headerHints.kcalHintClass,
      waterHint: headerHints.waterHint,
      waterHintClass: headerHints.waterHintClass,
      weightHint: headerHints.weightHint,
      weightHintClass: headerHints.weightHintClass,
      bmrHint: headerHints.bmrHint,
      bmrHintClass: headerHints.bmrHintClass,
      healthyWeightHint: headerHints.healthyWeightHint,
      healthyWeightHintClass: headerHints.healthyWeightHintClass,
      bmr: Math.round(bmr),
      tdee,
      isDirty: false,
      savedProfile: profile,
    })

    wx.showToast({ title: '保存成功 🎉', icon: 'success', duration: 1500 })
  },
})
