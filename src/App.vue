<script>
export default {
  onLaunch() {
    console.log("家康小记 启动");
    try {
      wx.cloud.init({
        env: "cloudbase-d6g9ez3uu31f0c644",
        traceUser: true
      });
      console.log("云开发已初始化");
    } catch (error) {
      console.warn("云开发初始化失败，使用本地存储降级", error);
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
