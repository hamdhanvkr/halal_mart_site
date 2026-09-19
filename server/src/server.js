require("dotenv").config();

const app = require("./app");

const { sequelize, connectDatabase } = require("./config/database");

// Load models and relationships
require("./models");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    await sequelize.sync();

    console.log("✅ Sequelize models synchronized");

    app.listen(PORT, () => {
      console.log(`🚀 Halal Mart Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();