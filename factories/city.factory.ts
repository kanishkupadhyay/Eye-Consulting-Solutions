import { ICityListResponse } from "@/common/backend/city.interfaces";
import { ICity } from "@/models/city.model";

class CityFactory {
  public static transformCityResponse(city: ICity): ICityListResponse {
    return {
      id: city._id.toString(),
      name: city.name,
      state: city.state.toString(),
    };
  }
}

export default CityFactory;
