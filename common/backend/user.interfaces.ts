export interface IUserRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
}

export interface IUserLoginRequest {
  email: string;
  password: string;
}

export interface IGetUsersRequest {
  page: number;
  limit: number;
  search?: string;
}

export interface IUserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  lastLogin: Date;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserLoginResponse {
  success: boolean;
  data: { user: IUserInfo; token: string };
}
