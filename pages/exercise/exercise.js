Page({
  data: {
    activeTab: 0,
    latitude: 39.9087,
    longitude: 116.3975,
    scale: 13,
    locationLabel: '默认中心点：北京天安门',
    markers: [
      {
        id: 1,
        latitude: 39.9087,
        longitude: 116.3975,
        width: 28,
        height: 28,
        callout: {
          content: '北京天安门',
          display: 'ALWAYS',
          padding: 8,
          borderRadius: 8,
          bgColor: '#2563EB',
          color: '#FFFFFF',
          fontSize: 12,
        },
      },
      {
        id: 2,
        latitude: 40.0198,
        longitude: 116.3962,
        width: 24,
        height: 24,
        callout: {
          content: '最美骑行路线',
          display: 'BYCLICK',
          padding: 8,
          borderRadius: 8,
          bgColor: '#0F766E',
          color: '#FFFFFF',
          fontSize: 12,
        },
      },
    ],
    topTabs: [
      { key: 'map', label: '地图' },
      { key: 'outdoor', label: '户外' },
      { key: 'record', label: '记录' },
    ],
    panels: [
      {
        accent: 'blue',
        badge: 'MAP',
        title: '地图',
        desc: '这里后面可以接入跑步路线、步行轨迹、附近运动点位和定位相关能力。',
        highlights: ['路线预览', '附近地点', '运动轨迹'],
        featuredRoute: {
          title: '最美骑行路线',
          route: '奥林匹克森林公园南园 → 北园环线',
          distance: '约 12km',
          time: '60-90 分钟',
          desc: '城市里很适合放松骑的经典路线，适合傍晚和周末刷圈。',
        },
      },
      {
        accent: 'green',
        badge: 'OUTDOOR',
        title: '户外',
        desc: '这里后面可以放徒步、骑行、露营、爬山和天气联动等户外运动内容。',
        highlights: ['徒步计划', '骑行路线', '天气联动'],
        featuredRoute: {
          title: '最美骑行路线',
          route: '奥林匹克森林公园南园 → 北园环线',
          distance: '约 12km',
          time: '60-90 分钟',
          desc: '整体路线平缓、绿化好、风景连续，适合日常刷圈和周末放松骑行。',
        },
        cards: [
          {
            title: '城市轻徒步',
            meta: '适合下班后 30-60 分钟',
            desc: '围绕公园、滨江、大学校园做轻量徒步，门槛低、恢复快。',
          },
          {
            title: '周末骑行',
            meta: '适合周末半天',
            desc: '结合地图路线和补给点，适合做中低强度有氧输出。',
          },
          {
            title: '天气联动提醒',
            meta: '后续可接天气能力',
            desc: '根据温度、风力和降雨提醒你更适合跑步、骑行还是室内替代。',
          },
        ],
      },
      {
        accent: 'amber',
        badge: 'RECORD',
        title: '记录',
        desc: '这里后面可以做运动记录、训练日志、消耗统计和周计划复盘。',
        highlights: ['训练日志', '消耗统计', '周计划'],
        records: [
          { day: '周一', title: '快走 45 分钟', meta: '中低强度有氧', kcal: 210 },
          { day: '周三', title: '慢跑 30 分钟', meta: '节奏稳定', kcal: 260 },
          { day: '周六', title: '骑行 60 分钟', meta: '户外耐力', kcal: 380 },
        ],
      },
    ],
  },

  onReady() {
    this.mapCtx = wx.createMapContext('exerciseMap', this)
  },

  onShow() {
    if (this.data.activeTab === 0) {
      this.locateMe(true)
    }
  },

  switchTab(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    this.setData({ activeTab: index }, () => {
      if (index === 0) this.locateMe(true)
    })
  },

  locateMe(silentFallback = false) {
    wx.getLocation({
      type: 'gcj02',
      success: ({ latitude, longitude }) => {
        this.setData({
          latitude,
          longitude,
          scale: 15,
          locationLabel: '已定位到当前位置',
          markers: [
            {
              id: 1,
              latitude,
              longitude,
              width: 28,
              height: 28,
              callout: {
                content: '当前位置',
                display: 'ALWAYS',
                padding: 8,
                borderRadius: 8,
                bgColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: 12,
              },
            },
            {
              id: 2,
              latitude: 40.0198,
              longitude: 116.3962,
              width: 24,
              height: 24,
              callout: {
                content: '最美骑行路线',
                display: 'BYCLICK',
                padding: 8,
                borderRadius: 8,
                bgColor: '#0F766E',
                color: '#FFFFFF',
                fontSize: 12,
              },
            },
          ],
        }, () => {
          if (this.mapCtx && typeof this.mapCtx.moveToLocation === 'function') {
            this.mapCtx.moveToLocation()
          }
        })
      },
      fail: () => {
        this.setData({
          latitude: 39.9087,
          longitude: 116.3975,
          scale: 14,
          locationLabel: '未获取到位置，已切换到北京天安门',
          markers: [
            {
              id: 1,
              latitude: 39.9087,
              longitude: 116.3975,
              width: 28,
              height: 28,
              callout: {
                content: '北京天安门',
                display: 'ALWAYS',
                padding: 8,
                borderRadius: 8,
                bgColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: 12,
              },
            },
            {
              id: 2,
              latitude: 40.0198,
              longitude: 116.3962,
              width: 24,
              height: 24,
              callout: {
                content: '最美骑行路线',
                display: 'BYCLICK',
                padding: 8,
                borderRadius: 8,
                bgColor: '#0F766E',
                color: '#FFFFFF',
                fontSize: 12,
              },
            },
          ],
        })

        if (!silentFallback) {
          wx.showToast({
            title: '定位失败，已切换到天安门',
            icon: 'none',
          })
        }
      },
    })
  },
})
