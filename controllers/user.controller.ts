import {
  IGetUsersRequest,
  IUserLoginRequest,
  IUserRegisterRequest,
} from "@/common/backend/user.interfaces";
import UserService from "@/services/user.service";

class UserController {
  private userService = new UserService();

  public register = (body: IUserRegisterRequest) => {
    return this.userService.registerUser(body);
  };

  public login = (body: IUserLoginRequest) => {
    return this.userService.loginUser(body);
  };

  public getUsers = (body: IGetUsersRequest) => {
    return this.userService.getUsers(body);
  };

  public getUserById = (id: string) => {
    return this.userService.getUserById(id);
  };

  public updateUser = (req: Request, id: string) => {
    return this.userService.updateUser(req, id);
  };

  public deleteUser = (req: Request, id: string) => {
    return this.userService.deleteUser(req, id);
  };
}

const userController = new UserController();
export default userController;
