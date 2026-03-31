import candidateController from "@/controllers/candidate.controller";
import { withDB } from "@/lib/withDb";

export const POST = withDB(async (req: Request) => {
  return candidateController.verifyCandidate(req);
});
