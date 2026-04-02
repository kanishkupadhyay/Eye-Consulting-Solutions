import StateService from "@/services/state.service";

class StateController {
  private stateService = new StateService();

  public getAllIndianStates = () => {
    return this.stateService.getAllIndianStates();
  };
}

const stateController = new StateController();
export default stateController;
