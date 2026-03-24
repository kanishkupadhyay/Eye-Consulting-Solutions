import userController from "@/controllers/user.controller";
import { withAdminAuth } from "@/lib/withAdmin";
import { withDB } from "@/lib/withDb";

export const GET = withDB(
  withAdminAuth(async (req: Request) => {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop() as string;

    return userController.getUserById(id);
  }),
);

export const PUT = withDB(
  withAdminAuth(async (req: Request) => {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop() as string;

    return userController.updateUser(req, id);
  }),
);

export const DELETE = withDB(
  withAdminAuth(async (req: Request) => {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop() as string;

    return userController.deleteUser(req, id);
  }),
);
