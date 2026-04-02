export interface IGetCandidatesRequest {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  gender?: 'Male' | 'Female';
}