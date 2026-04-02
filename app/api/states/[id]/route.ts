import cityController from "@/controllers/city.controller";
import { withDB } from "@/lib/withDb";

export const GET = withDB(
  async (req: Request, { params }: { params: { id: string } }) => {
    const { id } = params;
    return cityController.getCitiesByState(id);
  },
);