import { Types } from "mongoose";
import { BaseRepository } from "./base.repository";
import City, { ICity } from "@/models/city.model";

class CityRepository extends BaseRepository<ICity> {
  constructor() {
    super(City);
  }

  public getCitiesByState = async (stateId: string) => {
    const cities = await this.model.find({
      state: new Types.ObjectId(stateId),
    });
    return cities;
  };
}

export default CityRepository;
