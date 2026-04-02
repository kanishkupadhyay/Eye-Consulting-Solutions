import { IStateListResponse } from "@/common/backend/state.interfaces";
import { IState } from "../models/state.model";

class StateFactory {
  public static transformStateResponse(state: IState): IStateListResponse {
    return {
      id: state._id.toString(),
      name: state.name,
    };
  }
}

export default StateFactory;
