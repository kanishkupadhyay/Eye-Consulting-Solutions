import stateController from "@/controllers/state.controller";
import { withDB } from "@/lib/withDb";

export const GET = withDB(async () => {
  return stateController.getAllIndianStates();
});
