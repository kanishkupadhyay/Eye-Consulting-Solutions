import userController from "@/controllers/user.controller";
import { withDB } from "@/lib/withDb";

export const POST = withDB(async (req: Request) => {
  return userController.resetPassword(req);
});
