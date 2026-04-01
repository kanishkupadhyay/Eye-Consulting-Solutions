import { IGetCandidatesRequest } from "@/common/backend/candidate.interface";
import CandidateService from "@/services/candidate.service";

class CandidateController {
  private candidateService = new CandidateService();

  constructor() {}

  public parseResumes = async (req: Request) => {
    return this.candidateService.parseResumes(req);
  };

  public uploadResume = async (req: Request) => {
    return this.candidateService.uploadResume(req);
  };

  public uploadBulkResumes = async (req: Request) => {
    return this.candidateService.uploadBulkResumes(req);
  }

  public verifyCandidate = async (req: Request) => {
    return this.candidateService.verifyCandidate(req);
  }

  public getCandidatesCount = async () => {
    return this.candidateService.getCandidatesCount();
  };

  public getCandidates = async (body: IGetCandidatesRequest) => {
    return this.candidateService.getCandidates(body);
  };

  public getCandidateById = async (id: string | null) => {
    return this.candidateService.getCandidateById(id);
  };
}

const candidateController = new CandidateController();
export default candidateController;
