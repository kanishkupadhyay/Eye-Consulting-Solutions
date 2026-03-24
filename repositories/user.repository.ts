import { User } from "@/models/user.model";
import { BaseRepository } from "./base.repository";
import { IUserRegisterRequest } from "@/common/backend/user.interfaces";

class UserRepository extends BaseRepository<any> {
  constructor() {
    super(User);
  }

  public createUser = async (userInfo: IUserRegisterRequest) => {
    const user = await this.model.create(userInfo);
    return user;
  };
}

export default UserRepository;
