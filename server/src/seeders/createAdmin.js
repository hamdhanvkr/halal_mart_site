require("dotenv").config({
  path: require("path").join(
    __dirname,
    "../../.env"
  ),
});

const bcrypt = require("bcryptjs");

const {
  sequelize,
} = require("../config/database");

const { Admin } = require("../models");

const createAdmin = async () => {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL connected");

    const name = "Mohamed Halith";
    const email = "admin@gmail.com";
    const password = "Admin@12345";

    const existingAdmin = await Admin.findOne({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      console.log(
        "❌ Admin with this email already exists."
      );

      await sequelize.close();
      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      permissions: [],
      status: "active",
    });

    console.log("");
    console.log(
      "================================"
    );
    console.log(
      "✅ ADMIN CREATED SUCCESSFULLY"
    );
    console.log(
      "================================"
    );

    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Status:", admin.status);

    console.log("");
    console.log(
      "Login Email:",
      email
    );

    console.log(
      "Login Password:",
      password
    );

    console.log(
      "================================"
    );

    await sequelize.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Failed to create admin:",
      error
    );

    await sequelize.close();

    process.exit(1);
  }
};

createAdmin();