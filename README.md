# 家庭健康跟踪助手 Demo

这是一个基于 Uni-app + Vue 3 的小程序 Demo，覆盖家庭健康记录、饮食分析、成员权限和家庭管理四个核心页面。

## 已实现

- 今天：家庭健康概况、成员切换、快捷记录入口、待办提醒、家庭快照。
- 记录：选择成员和指标，录入血压、血糖、体重等 mock 记录，查看趋势和最近记录。
- 饮食：拍照或上传餐食图片，展示模拟识别结果、营养结构和饮食建议。
- 用药：底部独立 Tab，展示今天该吃什么药，支持手动添加药品和服药规则、确认已服药和未确认状态提醒。
- 家庭：展示 6 位家庭成员，模拟管理员和父母视角的数据可见范围。
- 首次使用：隐私说明、微信登录替身、家庭成员身份绑定。
- 成员详情：基础档案、过敏史、常用药备注、医生关注事项和指标关注范围。
- 提醒设置：指标记录、复诊、用药记录提醒入口。
- 就医用药：就医记录、复诊日期、用药记录归档。
- 数据管理：健康记录、餐食照片、隐私授权、导出和删除入口。
- 邀请家人：家庭邀请码和邀请流程页面。
- Mock 后端：`src/services/mockBackend.js` 封装登录、权限校验、指标保存、饮食分析、删除申请等接口替身。
- 健康边界：页面保留“不替代医生诊断、用药调整咨询医生或药师”的提示。

## 本地运行

```bash
pnpm install
pnpm dev:h5
```

打开：

```text
http://localhost:5173/
```

## 构建

H5 构建：

```bash
pnpm build:h5
```

微信小程序构建：

```bash
pnpm build:mp-weixin
```

构建完成后，用微信开发者工具导入：

```text
dist/build/mp-weixin
```

## 当前 Demo 边界

- 数据为前端 mock 数据，身份绑定会存在本地 storage，业务记录刷新后不持久化。
- 饮食识别是模拟结果，已预留 `uni.chooseImage` 上传入口和 `analyzeMealImage` 替换点。
- 微信登录、云数据库、云函数、订阅消息尚未接入真实服务。
- `manifest.json` 中微信小程序 appid 为空，上线前需要替换成真实 appid。

## 后端替换点

- `src/services/mockBackend.js`
  - `loginWithWechat`：替换为微信登录和云函数登录。
  - `bindMember`：替换为家庭成员绑定接口。
  - `saveMetricRecord`：替换为指标记录保存接口。
  - `analyzeMealImage`：替换为图片上传、AI 识别和营养建议云函数。
  - `listCareRecords`：替换为就医、复诊、用药记录接口。
  - `listMedicationTasks`：替换为今日用药任务接口。
  - `confirmMedication`：替换为服药确认接口。
  - `createMedicationReminder`：替换为手动新增药物提醒接口。
  - `requestDataDeletion`：替换为真实删除和审计接口。

## 建议云数据库集合

- `families`：家庭信息、管理员。
- `users`：微信 openId、绑定成员、角色。
- `members`：成员档案、关系组、可见范围。
- `metricRecords`：血压、血糖、体重、体脂、心率、睡眠记录。
- `mealRecords`：餐食图片、分析结果、人工修正。
- `visitRecords`：就医记录、检查、复诊安排。
- `medicationLogs`：按医嘱用药记录。
- `reminders`：记录提醒、复诊提醒、用药记录提醒。
- `auditLogs`：代录、删除、导出等操作日志。

## 建议下一步

1. 接入微信登录，建立用户和家庭成员绑定关系。
2. 用微信云开发建立 `families`、`members`、`metricRecords`、`mealRecords`、`reminders` 集合。
3. 把饮食分析封装到云函数，前端只上传图片和成员上下文。
4. 加入隐私授权流程、数据删除入口和订阅消息提醒。
5. 在微信开发者工具里做真机调试，重点检查老人使用场景下的按钮大小和拍照流程。
