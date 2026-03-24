import CountryRepository from "@/repositories/country.repository";

class CountryService {
  private countryRepository: CountryRepository;

  constructor() {
    this.countryRepository = new CountryRepository();
  }

  // public getAllCountries = async (req, res) => {
  //   try {
  //     const countryList = await this.countryRepository.getAllCountries(
  //       req.query,
  //     );
  //     return res.send(countryList);
  //   } catch (error) {
  //     throw error;
  //   }
  // };
}

export default CountryService;
