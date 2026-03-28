import candidateController from "@/controllers/candidate.controller";
import { withDB } from "@/lib/withDb";

export const POST = withDB(async (req: Request) => {
  const body = await req.json();
  return candidateController.getCandidates(body);
});
