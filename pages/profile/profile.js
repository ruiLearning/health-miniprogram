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
  },

  onShow() {
    this.loadProfile()
  },

  loadProfile() {
    const p = app.globalData.profile || {}
    const activityIndex = ACTIVITY_OPTIONS.findIndex(o => o.val === p.activity) ?? 2

    const bmi = this.calcBMI(p)
    const bmr = this.calcBMR(p)
    const tdee = bmr ? Math.round(bmr * (p.activity || 1.55)) : 0

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
      bmr: Math.round(bmr),
      tdee,
    })
  },

  calcBMI(p) {
    if (!p.height || !p.weight) return 0
    const h = p.height / 100
    return (p.weight / (h * h)).toFixed(1)
  },

  calcBMR(p) {
    if (!p.height || !p.weight || !p.age) return 0
    return p.gender === 'female'
      ? 655 + 9.6 * p.weight + 1.8 * p.height - 4.7 * p.age
      : 66  + 13.7 * p.weight + 5  * p.height - 6.8 * p.age
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const val = e.detail.value
    this.setData({ [`form.${key}`]: val })

    // live-update BMI / BMR preview
    if (['height', 'weight', 'age', 'gender'].includes(key)) {
      const f = this.data.form
      const preview = {
        ...f,
        [key]: val,
        height: parseFloat(key === 'height' ? val : f.height),
        weight: parseFloat(key === 'weight' ? val : f.weight),
        age:    parseFloat(key === 'age'    ? val : f.age),
      }
      const bmi = this.calcBMI(preview)
      const bmr = this.calcBMR(preview)
      const tdee = bmr ? Math.round(bmr * (parseFloat(f.activity) || 1.55)) : 0
      this.setData({ bmi, bmr: Math.round(bmr), tdee })
    }
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl || ''
    if (!avatarUrl) return
    this.setData({
      'form.avatarUrl': avatarUrl,
      'profile.avatarUrl': avatarUrl,
    })
  },

  syncWechatProfile() {
    if (!wx.getUserProfile) {
      wx.showToast({ title: '当前基础库不支持', icon: 'none' })
      return
    }

    wx.getUserProfile({
      desc: '用于同步微信头像和昵称',
      success: (res) => {
        const userInfo = res.userInfo || {}
        const updates = {}
        if (userInfo.nickName) updates['form.name'] = userInfo.nickName
        if (userInfo.avatarUrl) updates['form.avatarUrl'] = userInfo.avatarUrl
        if (userInfo.nickName) updates['profile.name'] = userInfo.nickName
        if (userInfo.avatarUrl) updates['profile.avatarUrl'] = userInfo.avatarUrl

        this.setData(updates)
        wx.showToast({ title: '已同步微信资料', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '未授权微信资料', icon: 'none' })
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
    const bmr = this.calcBMR(profile)
    const tdee = bmr ? Math.round(bmr * profile.activity) : 0
    this.setData({ profile, bmi, bmr: Math.round(bmr), tdee })

    wx.showToast({ title: '保存成功 🎉', icon: 'success', duration: 1500 })
  },
})
