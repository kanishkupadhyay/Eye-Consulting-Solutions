// lib/withDB.ts
import seedCountries from "@/seeder/country.seeder";
import { connectDB } from "./db";
import seedAdmin from "@/seeder/admin-user.seeder";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function withDB(handler: Function) {
  return async (...args: any[]) => {
    seedCountries();
    seedAdmin();
    await connectDB();
    return handler(...args);
  };
}
