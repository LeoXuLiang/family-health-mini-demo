const tabList = [
  { pagePath: "/pages/today/index", text: "今天" },
  { pagePath: "/pages/records/index", text: "记录" },
  { pagePath: "/pages/meals/index", text: "饮食" },
  { pagePath: "/pages/medications/index", text: "用药" },
  { pagePath: "/pages/tools/index", text: "工具" },
  { pagePath: "/pages/family/index", text: "家庭" }
];

Component({
  data: {
    selected: 0,
    list: tabList
  },
  lifetimes: {
    attached() {
      this.updateSelected();
      setTimeout(() => this.updateSelected(), 0);
    }
  },
  pageLifetimes: {
    show() {
      this.updateSelected();
    }
  },
  methods: {
    updateSelected() {
      const pages = getCurrentPages();
      if (!pages.length) {
        return;
      }
      const current = pages[pages.length - 1];
      const route = `/${current && current.route ? current.route : ""}`;
      const selected = this.data.list.findIndex((item) => item.pagePath === route);
      const nextSelected = selected >= 0 ? selected : 0;
      if (nextSelected !== this.data.selected) {
        this.setData({ selected: nextSelected });
      }
    },
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index);
      const target = this.data.list[index];
      if (!target) {
        return;
      }
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      const currentRoute = `/${current && current.route ? current.route : ""}`;
      if (target.pagePath === currentRoute) {
        return;
      }
      this.setData({ selected: index });
      wx.switchTab({
        url: target.pagePath,
        fail: () => {
          this.updateSelected();
        }
      });
    }
  }
});
