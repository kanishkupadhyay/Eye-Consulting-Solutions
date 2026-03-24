import ResultErrorCodes from "@/common/backend/error.message";
import { checkIsValidEmail } from "@/common/backend/utils";
import CountryRepository from "@/repositories/country.repository";
import UserRepository from "@/repositories/user.repository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import StatusCodes from "@/common/backend/status-codes";
import {
  IUserLoginRequest,
  IUserRegisterRequest,
} from "@/common/backend/user.interfaces";

class UserService {
  private userRepository = new UserRepository();
  private countryRepository = new CountryRepository();

  public registerUser = async (data: IUserRegisterRequest) => {
    try {
      await this.validateRequestBody(data);

      const user = await this.userRepository.createUser(data);

      return new Response(JSON.stringify({ success: true, data: user }), {
        status: StatusCodes.CREATED,
        headers: { "Content-Type": "application/json" },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };

  public loginUser = async (data: IUserLoginRequest) => {
    try {
      const { email, password } = data;

      if (!email) throw new Error(ResultErrorCodes.EmailIsRequired);
      if (!password) throw new Error(ResultErrorCodes.PasswordIsRequired);

      // 🔹 fetch user from DB
      const user = await this.userRepository.findOne("email", email);

      // 🔹 safe check for missing password
      if (!user || !user.password) {
        throw new Error(ResultErrorCodes.InvalidCredentials);
      }

      // 🔹 compare password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new Error(ResultErrorCodes.InvalidCredentials);
      }

      // update lastLogin timestamp
      await this.userRepository.update(user._id, { lastLogin: new Date() });

      // 🔹 generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" },
      );

      // 🔹 success response
      return new Response(
        JSON.stringify({ success: true, data: { user, token } }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      // 🔹 error response
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };

  public deleteUser = async (req: Request, id: string) => {
    try {
      if (!id) throw new Error("User id is required");

      // 🔐 Extract token from Authorization header
      const token = req.headers.get("authorization")?.split(" ")[1];
      if (!token) throw new Error("Unauthorized");

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const loggedInUser = await this.userRepository.findById(decoded.userId);
      if (!loggedInUser) throw new Error("User not found");

      const user = await this.userRepository.findById(id);
      if (!user) throw new Error("Target user not found");

      // 👑 ADMIN → can delete only non-admin users
      if (loggedInUser.isAdmin) {
        if (user.isAdmin) {
          throw new Error("Admins cannot delete other admins");
        }
      }
      // 👤 NON-ADMIN → can delete only self
      else {
        if (loggedInUser._id.toString() !== id) {
          throw new Error("Not allowed");
        }
      }

      await this.userRepository.deleteById(id);

      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };

  private validateRequestBody = async (data: IUserRegisterRequest) => {
    const fieldMapping = [
      {
        field: data?.firstName,
        errorMsg: ResultErrorCodes.FirstNameIsRequired,
      },
      { field: data?.email, errorMsg: ResultErrorCodes.EmailIsRequired },
      { field: data?.password, errorMsg: ResultErrorCodes.PasswordIsRequired },
      // {
      //   field: data?.countryCode,
      //   errorMsg: ResultErrorCodes.CountryCodeIsRequired,
      // },
      { field: data?.phone, errorMsg: ResultErrorCodes.PhoneNumberIsRequired },
    ];

    for (const item of fieldMapping) {
      if (!item.field) throw new Error(item.errorMsg);
    }

    if (!checkIsValidEmail(data.email))
      throw new Error(ResultErrorCodes.EmailIsNotValid);

    const userAlreadyExists = await this.userRepository.findByFieldName(
      "email",
      data.email,
    );
    if (userAlreadyExists)
      throw new Error(ResultErrorCodes.UserAlreadyExistsWithThisEmail);

    // const countryExists = await this.countryRepository.findByFieldName(
    //   "dialCode",
    //   data.countryCode,
    // );
    // if (!countryExists)
    //   throw new Error(ResultErrorCodes.CountryCodeDoesNotExist);

    if (data.phone.length !== 10)
      throw new Error(ResultErrorCodes.PhoneNumberIsInvalid);
  };

  public getUsers = async (body: any) => {
    try {
      const { page = 1, limit = 10, search } = body;

      const skip = (page - 1) * limit;

      const filter: any = {
        $or: [{ isAdmin: false }, { isAdmin: { $exists: false } }],
      };

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // 🔥 reuse BaseRepository methods
      const [users, total] = await Promise.all([
        this.userRepository.findWithPagination(filter, skip, limit),
        this.userRepository.count(filter),
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          data: users,
          page,
          totalPages: Math.ceil(total / limit),
          total,
        }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };

  public getUserById = async (id: string) => {
    try {
      if (!id) throw new Error("User id is required");

      const user = await this.userRepository.findById(id);

      if (!user) throw new Error("User not found");

      if (user.isAdmin) {
        throw new Error("Access denied");
      }

      return new Response(JSON.stringify({ success: true, data: user }), {
        status: StatusCodes.OK,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };

  public updateUser = async (req: Request, id: string) => {
    try {
      if (!id) throw new Error("User id is required");

      // 🔐 token extract
      const token = req.headers.get("authorization")?.split(" ")[1];
      if (!token) throw new Error("Unauthorized");

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const loggedInUser = await this.userRepository.findById(decoded.userId);
      if (!loggedInUser) throw new Error("User not found");

      const user = await this.userRepository.findById(id);
      if (!user) throw new Error("Target user not found");

      const body = await req.json();
      const { firstName, lastName, phone, password } = body;

      // 👑 ADMIN → can update only non-admin users
      if (loggedInUser.isAdmin) {
        if (user.isAdmin) {
          throw new Error("Admins cannot update other admins");
        }
      }
      // 👤 NON-ADMIN → can update only self
      else {
        if (loggedInUser._id.toString() !== id) {
          throw new Error("Not allowed");
        }
      }

      // 🔹 update allowed fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (password) user.password = await bcrypt.hash(password, 10);

      await user.save();

      return new Response(
        JSON.stringify({ success: true, message: "User updated successfully" }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}

export default UserService;
