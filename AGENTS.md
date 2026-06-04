# 家庭健康顾问配置

## 定位
记录家庭成员健康档案、就医记录和用药信息。

## 输出边界
- 可做信息整理、就医问题清单、复诊提醒和记录归纳。
- 不替代医生诊断。
- 涉及用药调整时，必须提示咨询医生或药师。

## 小程序云开发操作记忆
- 本项目以微信小程序构建结果为最终验证目标，优先运行 `pnpm build:mp-weixin`，产物目录为 `dist/build/mp-weixin`。
- 微信开发者工具服务端口已开启，当前端口为 `60013`。
- 微信开发者工具 CLI 路径：`/Applications/wechatwebdevtools.app/Contents/MacOS/cli`。
- 当前云环境 ID：`cloudbase-d6g9ez3uu31f0c644`，小程序 AppID：`wxf1e84dc47f481b3a`。
- 可用以下命令确认 CLI 登录状态：
  `/Applications/wechatwebdevtools.app/Contents/MacOS/cli islogin --port 60013`
- 可用以下命令部署 `initDB` 云函数：
  `/Applications/wechatwebdevtools.app/Contents/MacOS/cli cloud functions deploy --env cloudbase-d6g9ez3uu31f0c644 --paths /Users/leoxu/Documents/Codex/2026-05-28/codex-codex-2026-05-28-codex/codex/04_personal/HEALTH_家庭健康/cloudfunctions/initDB --appid wxf1e84dc47f481b3a --remote-npm-install --port 60013`
- `initDB` 用于创建/确认云数据库集合：`members`、`health_records`、`medications`、`care_records`、`meals`，并在 `members` 为空时写入 6 位默认家庭成员档案。
