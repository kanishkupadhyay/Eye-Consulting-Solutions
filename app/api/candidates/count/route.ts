import candidateController from "@/controllers/candidate.controller";
import { withDB } from "@/lib/withDb";

export const GET = withDB(async () => {
  return candidateController.getCandidatesCount();
});
