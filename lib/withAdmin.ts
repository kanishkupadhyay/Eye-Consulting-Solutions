import ResultErrorCodes from "@/common/backend/error.message";
import StatusCodes from "@/common/backend/status-codes";
import UserRepository from "@/repositories/user.repository";
import jwt from "jsonwebtoken";

export const withAdminAuth = (
  handler: (req: Request, decoded: any) => Promise<Response>,
) => {
  return async (req: Request) => {
    try {
      // 🔹 Get token from headers
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: ResultErrorCodes.YouAreNotAuthorized,
          }),
          {
            status: StatusCodes.UNAUTHORIZED,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const token = authHeader.split(" ")[1];

      // 🔹 Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        isAdmin?: boolean;
      };

      // 🔹 Check admin
      const userService = new UserRepository();
      const user = await userService.findById(decoded.userId);
      if (!user || !user.isAdmin) {
        return new Response(
          JSON.stringify({
            success: false,
            message: ResultErrorCodes.YouDontHavePermissionToPerformThisAction,
          }),
          {
            status: StatusCodes.FORBIDDEN,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // 🔹 Call the handler with decoded token
      return handler(req, decoded);
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  };
};
