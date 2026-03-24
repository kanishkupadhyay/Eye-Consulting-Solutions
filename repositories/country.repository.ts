/* eslint-disable @typescript-eslint/no-explicit-any */
import { Country } from "@/models/country.model";
import { BaseRepository } from "./base.repository";

class CountryRepository extends BaseRepository<any> {
  constructor() {
    super(Country);
  }
  public async getAllCountries(query: any) {
    const { page = 1, limit = 10, title } = query;
    const skip = (page - 1) * limit;
    const searchCondition = title
      ? { title: { $regex: title, $options: "i" } }
      : {};

    const [countries, total] = await Promise.all([
      this.findWithPagination(searchCondition, skip, limit),
      this.count(searchCondition),
    ]);
    return {
      data: countries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default CountryRepository;
