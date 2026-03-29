import ResultErrorMessage from "@/common/backend/error.message";
import StatusCodes from "@/common/backend/status-codes";
import { getDecodedToken } from "@/common/backend/utils";

export const authMiddleware = (
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
            message: ResultErrorMessage.YouAreNotAuthorized,
          }),
          {
            status: StatusCodes.UNAUTHORIZED,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const token = authHeader.split(" ")[1];

      // 🔹 Verify token
      const decoded = getDecodedToken(token);

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
