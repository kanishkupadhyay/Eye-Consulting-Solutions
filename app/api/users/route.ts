import userController from "@/controllers/user.controller";
import { withAdminAuth } from "@/lib/withAdmin";
import { withDB } from "@/lib/withDb";

export const POST = withDB(
  withAdminAuth(async (req: Request) => {
    const body = await req.json();

    return userController.getUsers(body);
  }),
);
