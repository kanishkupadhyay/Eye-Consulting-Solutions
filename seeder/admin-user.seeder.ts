import { User } from "@/models/user.model";

const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  phone: "1234567890",
  password: "Admin@123",
  isAdmin: true,
};

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (existingAdmin) {
      console.log("⏭️ Admin already exists, skipping seeder");
      return;
    }

    console.log("🌱 Seeding admin user...");

    await User.create({...adminUser});

    console.log("✅ Admin user seeded successfully");
  } catch (error) {
    console.error("❌ Admin seeder error:", error);
  }
};

export default seedAdmin;