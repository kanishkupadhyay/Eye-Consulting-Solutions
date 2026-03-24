import userController from "@/controllers/user.controller";
import { withDB } from "@/lib/withDb";

export const GET = withDB(async (_req: Request, context: any) => {
  const { id } = context.params;
  return userController.getUserById(id);
});

export const PUT = withDB(async (req: Request, context: any) => {
  const { id } = context.params;
  return userController.updateUser(req, id);
});

export const DELETE = withDB(async (req: Request, context: any) => {
  const { id } = context.params;
  return userController.deleteUser(req, id);
});
