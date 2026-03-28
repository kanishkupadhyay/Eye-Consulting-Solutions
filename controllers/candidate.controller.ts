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
}

const candidateController = new CandidateController();
export default candidateController;
