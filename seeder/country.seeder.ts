import { Country } from "@/models/country.model";

const countries = [
  {
    name: "India",
    code: "IN",
    dialCode: "+91",
    currency: "Indian Rupee",
    currencyCode: "INR",
    flagUrl: "https://flagcdn.com/w320/in.png",
  },
  {
    name: "United States",
    code: "US",
    dialCode: "+1",
    currency: "US Dollar",
    currencyCode: "USD",
    flagUrl: "https://flagcdn.com/w320/us.png",
  },
  {
    name: "United Kingdom",
    code: "GB",
    dialCode: "+44",
    currency: "Pound Sterling",
    currencyCode: "GBP",
    flagUrl: "https://flagcdn.com/w320/gb.png",
  },
];

const seedCountries = async () => {
  try {
    const count = await Country.countDocuments();

    if (count > 0) {
      console.log("⏭️ Countries already exist, skipping seeder");
      return;
    }

    console.log("🌱 Seeding countries...");
    await Country.insertMany(countries);

    console.log("✅ Countries seeded successfully");
  } catch (error) {
    console.error("❌ Seeder error:", error);
  }
};

export default seedCountries;
