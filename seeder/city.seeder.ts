import City from "@/models/city.model";
import State from "@/models/state.model";
import { Country, State as CSCState, City as CSCCity } from "country-state-city";

const seedCities = async () => {
  try {
    const count = await City.countDocuments();
    if (count > 0) {
      console.log("⏭️ Cities already exist, skipping seeder");
      return;
    }

    console.log("🌱 Seeding Indian cities from country-state-city package...");

    const india = Country.getCountryByCode("IN"); // IN = India
    if (!india) throw new Error("India country not found");

    const states = CSCState.getStatesOfCountry("IN"); // get all Indian states
    const cityDocs: any[] = [];

    for (const stateData of states) {
      const state = await State.findOne({ name: stateData.name });
      if (!state) {
        console.warn(`⚠️ State not found in DB: ${stateData.name}`);
        continue;
      }

      const cities = CSCCity.getCitiesOfState("IN", stateData.isoCode);
      cities.forEach((cityData) => {
        cityDocs.push({ name: cityData.name, state: state._id });
      });
    }

    if (cityDocs.length > 0) {
      await City.insertMany(cityDocs);
      console.log("✅ Cities seeded successfully");
    } else {
      console.log("⚠️ No cities to insert");
    }
  } catch (error) {
    console.error("❌ Seeder error:", error);
  }
};

export default seedCities;