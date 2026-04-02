import { BaseRepository } from "./base.repository";
import State, { IState } from "@/models/state.model";

class StateRepository extends BaseRepository<IState> {
  constructor() {
    super(State);
  }

  public getAllIndianStates = async () => {
    const states = await this.model.find();
    return states;
  };
}

export default StateRepository;
