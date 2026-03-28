import Candidate, { ICandidate } from "@/models/candidate.model";
import { BaseRepository } from "./base.repository";

class CandidateRepository extends BaseRepository<ICandidate> {
  constructor() {
    super(Candidate);
  }
}

export default CandidateRepository;
