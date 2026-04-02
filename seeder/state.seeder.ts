import State from "@/models/state.model";
import { Country, State as CSCState } from "country-state-city";

const seedStates = async () => {
  try {
    const count = await State.countDocuments();
    if (count > 0) {
      console.log("⏭️ States already exist, skipping seeder");
      return;
    }

    console.log("🌱 Seeding Indian states and union territories...");

    const india = Country.getCountryByCode("IN"); // IN = India
    if (!india) throw new Error("India country not found");

    const states = CSCState.getStatesOfCountry("IN"); // all Indian states
    const stateDocs = states.map((stateData) => ({ name: stateData.name }));

    if (stateDocs.length > 0) {
      await State.insertMany(stateDocs);
      console.log("✅ Indian states seeded successfully");
    } else {
      console.log("⚠️ No states found to insert");
    }
  } catch (error) {
    console.error("❌ Seeder error:", error);
  }
};

export default seedStates;