import userController from "@/controllers/user.controller";
import { withDB } from "@/lib/withDb";

export const POST = withDB(async (req: Request) => {
  const body = await req.json();
  const { email } = body;
  return userController.sendOtp(email);
});
