import CandidateService from "@/services/candidate.service";

class CandidateController {
  private candidateService = new CandidateService();

  constructor() {}

  public uploadResumes = async (req: Request) => {
    return this.candidateService.uploadResumes(req);
  };

  public uploadResume = async (req: Request) => {
    return this.candidateService.uploadResume(req);
  };

  public getCandidatesCount = async () => {
    return this.candidateService.getCandidatesCount();
  };
}

const candidateController = new CandidateController();
export default candidateController;
