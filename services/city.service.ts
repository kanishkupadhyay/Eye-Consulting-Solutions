import StatusCodes from "@/common/backend/status-codes";
import ResultSuccessMessages from "@/common/backend/success.message";
import CityFactory from "@/factories/city.factory";
import { ICity } from "@/models/city.model";
import CityRepository from "@/repositories/city.repository";

class CityService {
  private cityRepository = new CityRepository();

  public getCitiesByState = async (stateId: string) => {
    const cities = await this.cityRepository.getCitiesByState(stateId);

    const transformedCities = cities.map((city: ICity) =>
      CityFactory.transformCityResponse(city),
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: ResultSuccessMessages.CitiesFetchedSuccessfully,
        data: transformedCities,
      }),
      {
        status: StatusCodes.OK,
        headers: { "Content-Type": "application/json" },
      },
    );
  };
}

export default CityService;
