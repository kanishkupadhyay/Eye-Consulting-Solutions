import StatusCodes from "@/common/backend/status-codes";
import ResultSuccessMessages from "@/common/backend/success.message";
import StateFactory from "@/factories/state.factory";
import StateRepository from "@/repositories/state.repository";
import { IState } from "@/models/state.model";

class StateService {
  private stateRepository = new StateRepository();

  public getAllIndianStates = async () => {
    const states = await this.stateRepository.getAllIndianStates();
    const transformedStates = states.map((state: IState) =>
      StateFactory.transformStateResponse(state),
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: ResultSuccessMessages.StatesFetchedSuccessfully,
        data: transformedStates,
      }),
      {
        status: StatusCodes.OK,
        headers: { "Content-Type": "application/json" },
      },
    );
  };
}

export default StateService;
