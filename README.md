# 家庭健康跟踪助手 Demo

基于 `Uni-app + Vue 3 + 微信云开发` 的家庭健康小程序 Demo，面向 6 人家庭健康记录场景，支持健康指标录入、餐食分析、用药提醒、就医记录和家庭权限管理。

涉及用药调整请咨询医生或药师，本项目不替代医生诊断。

## 核心能力

- `今天`：家庭健康概况、成员切换、快捷入口、待办提醒、家庭快照。
- `记录`：血压、血糖、体重、心率、睡眠状态等指标录入与趋势查看，默认展示概览，点击后新增记录。
- `饮食`：拍照上传餐食，云存储保存照片，展示待分析结果与营养建议。
- `用药`：今日用药清单、手动添加规则、服药确认、未确认提醒。
- `工具`：4-6-8 呼吸法放松练习，支持轮数选择、暂停、重置和图形化节奏引导。
- `家庭`：6 位成员档案、角色权限、照护关系可见与可操作控制，支持云端成员档案保存。
- `就医记录`：基本就医信息、诊断结果、开药记录、检查记录、复诊提醒、补充信息。
- `数据管理`：删除申请、导出入口、授权说明。

## 页面预览

以下截图来自当前版本页面预览；小程序最终效果以 `dist/build/mp-weixin` 在微信开发者工具/小程序助手中的编译结果为准。

![today](./demo-screenshot-today.png)
![records](./demo-screenshot-records.png)
![meals](./demo-screenshot-meals.png)
![family](./demo-screenshot-family.png)

## 技术栈

- `Uni-app`
- `Vue 3`
- `Vite`
- `pnpm`
- 微信云开发数据库与云函数
- 本地 Mock 降级服务：`src/services/mockBackend.js`

## 最新更新

- 接入微信云开发数据同步，云环境：`cloudbase-d6g9ez3uu31f0c644`。
- 新增并部署 `initDB` 云函数，用于创建 `members`、`health_records`、`medications`、`care_records`、`meals` 集合，并初始化 6 位成员档案。
- 成员档案改为云端读写，家庭页年龄、病史、过敏和标签等摘要实时刷新。
- 记录页改为默认概览态，新增记录入口更明显，保存成功后自动回到初始页面。
- 今天页家庭快照和记录页趋势改为从健康记录实时计算。
- 饮食页、用药页、成员选择组件统一接入云端成员列表，并增加缺集合时的本地兜底。
- 修复小程序端切页/热重载时的组件事件绑定稳定性问题。

## 快速开始

```bash
pnpm install
pnpm dev:h5
```

打开：

```text
http://localhost:5173/
```

## 构建发布

H5 构建：

```bash
pnpm build:h5
```

微信小程序构建：

```bash
pnpm build:mp-weixin
```

构建完成后，在微信开发者工具导入：

```text
dist/build/mp-weixin
```

## 当前版本边界

- 当前为 Demo + 微信云开发版本，健康记录、成员档案、用药、就医和餐食记录已接入云数据库，并保留本地 Mock 降级。
- 饮食分析仍为待分析/手动修正结果，已接入照片上传和云存储，AI 菜品识别仍是替换点。
- 微信登录和成员绑定仍为模拟流程，订阅消息暂未接入真实服务。
- 已在 `src/manifest.json` 配置小程序 `appid`，发布前仍需确认线上隐私保护指引、服务类目和数据库权限。

## 服务替换点

重点替换文件：[src/services/cloudService.js](./src/services/cloudService.js) 与 [src/services/mockBackend.js](./src/services/mockBackend.js)

- `loginWithWechat`：替换为真实微信登录。
- `bindMember`：替换为成员绑定接口。
- `listMembers` / `getMemberProfile` / `updateMemberProfile`：已接入云端成员档案，可继续迁移到后端权限校验。
- `saveMetricRecord`：已接入 `health_records`，可继续补充异常提醒和审计日志。
- `saveMealRecord` / `uploadMealPhoto`：已接入 `meals` 和云存储，AI 识别仍待替换。
- `listCareRecords`：已接入 `care_records`，可继续扩展报告图片云存储。
- `listMedicationTasks` / `confirmMedication` / `createMedicationReminder`：已接入 `medications`，订阅消息仍待接入。
- `requestDataDeletion`：替换为删除申请和审计接口。

## 建议数据库模型

- `members`：成员档案、关系组、权限范围。
- `health_records`：健康指标记录。
- `meals`：餐食图片与分析结果。
- `care_records`：就医、检查、复诊信息。
- `medications`：用药提醒与确认状态。
- `families` / `users` / `reminders` / `auditLogs`：后续生产版建议补充。

## 版本信息

- 当前版本：`v0.4.0`
- 本次发布内容：微信云开发同步、成员档案云端化、记录页概览式录入、家庭快照实时计算、饮食/用药页稳定性修复、`initDB` 云函数部署能力。
