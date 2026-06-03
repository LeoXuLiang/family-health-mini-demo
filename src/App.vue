<script>
const INIT_FLAG = "cloud_collections_ready";

export default {
  onLaunch() {
    console.log("家康小记 启动");
    try {
      wx.cloud.init({
        env: "cloudbase-d6g9ez3uu31f0c644",
        traceUser: true
      });
      console.log("云开发已初始化");
      this.initCollections();
    } catch (error) {
      console.warn("云开发初始化失败，使用本地存储降级", error);
    }
  },
  methods: {
    async initCollections() {
      try {
        if (wx.getStorageSync(INIT_FLAG)) return;

        const db = wx.cloud.database();
        const names = ["health_records", "medications", "care_records"];

        for (const name of names) {
          try {
            const res = await db.collection(name).add({
              data: { _init: true }
            });
            await db.collection(name).doc(res._id).remove();
            console.log(`[cloud] collection ${name} ready`);
          } catch (e) {
            console.warn(`[cloud] init ${name}:`, e.errMsg || e.message);
          }
        }

        wx.setStorageSync(INIT_FLAG, true);
      } catch (e) {
        console.warn("[cloud] initCollections error:", e);
      }
    }
  }
};
</script>

<style>
page {
  min-height: 100%;
  background: #eef5ef;
  color: #18332d;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text,
button,
input,
picker,
textarea {
  box-sizing: border-box;
}

button {
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  line-height: 1.2;
  text-align: center;
}

button::after {
  border: 0;
}

/* #ifdef H5 */
.uni-tabbar,
.uni-tabbar__item,
.uni-tabbar__bd,
.uni-tabbar-bottom {
  height: 58px !important;
}

.uni-tabbar__label {
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 58px !important;
}
/* #endif */
</style>
