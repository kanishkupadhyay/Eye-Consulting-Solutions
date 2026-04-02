import CityService from "@/services/city.service";

class CityController {
  private cityService = new CityService();

  public getCitiesByState = (stateId: string) => {
    return this.cityService.getCitiesByState(stateId);
  };
}

const cityController = new CityController();
export default cityController;
