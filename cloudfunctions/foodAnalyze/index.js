const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { fileID, memberId, mealType } = event;

  if (!fileID) {
    return { ok: false, message: "缺少照片 fileID" };
  }

  // TODO: 接入 AI 菜品识别
  // 1. 开通腾讯云图像分析服务：https://console.cloud.tencent.com/tiia
  // 2. 获取 SecretId / SecretKey
  // 3. 调用 cloud.openapi.ocr 或使用腾讯云 SDK 调用菜品识别 API
  //
  // 示例代码（需要先配置云函数环境变量）：
  // const tencentcloud = require("tencentcloud-sdk-nodejs");
  // const TiiaClient = tencentcloud.tiia.v20190529.Client;
  // const client = new TiiaClient({ credential: { ... }, region: "ap-guangzhou" });
  // const result = await client.DetectFood({ ImageUrl: fileID });

  // 当前阶段：保存照片到云存储并返回手动录入入口
  const record = {
    memberId: memberId || "me",
    mealType: mealType || "本餐",
    photoFileID: fileID,
    score: "--",
    title: "待分析（手动补全）",
    macros: [
      { label: "碳水", value: "待补充", accent: "blue" },
      { label: "蛋白", value: "待补充", accent: "green" },
      { label: "蔬菜", value: "待补充", accent: "gold" }
    ],
    advice: "照片已保存。请在饮食页面点击「修正」按钮补充菜品和份量信息。",
    createdBy: cloud.getWXContext().OPENID,
    createdAt: new Date().toISOString()
  };

  const result = await db.collection("meals").add({ data: record });

  return { ok: true, meal: { ...record, _id: result._id } };
};
