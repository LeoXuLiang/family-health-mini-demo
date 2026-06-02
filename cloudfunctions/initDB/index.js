const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const results = {};

  const collections = ["health_records", "medications", "care_records"];

  for (const name of collections) {
    try {
      const result = await db.collection(name).count();
      results[name] = { status: "exists", count: result.total };
    } catch {
      try {
        await db.createCollection(name);
        results[name] = { status: "created", count: 0 };
      } catch (err) {
        results[name] = { status: "error", message: err.message };
      }
    }
  }

  return results;
};
