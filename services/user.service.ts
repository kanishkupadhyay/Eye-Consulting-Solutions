import ResultErrorCodes from "@/common/backend/error.message";
import { checkIsValidEmail } from "@/common/backend/utils";
import CountryRepository from "@/repositories/country.repository";
import UserRepository from "@/repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import StatusCodes from "@/common/backend/status-codes";
import {
  IUserLoginRequest,
  IUserRegisterRequest,
} from "@/common/backend/user.interfaces";
import UserFactory from "@/factories/user.factory";
import ResultSuccessMessages from "@/common/backend/success.messsage";
import { EmailService } from "@/common/backend/email.service";
import crypto from "crypto";
import { Otp } from "@/models/otp.model";
import { User } from "@/models/user.model";

class UserService {
  private userRepository = new UserRepository();
  private countryRepository = new CountryRepository();
  private emailService = new EmailService();

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
      const trimmedEmail = email?.trim() || "";
      const trimmedPassword = password?.trim() || "";

      if (!trimmedEmail) throw new Error(ResultErrorCodes.EmailIsRequired);

      const isEmailValid = checkIsValidEmail(trimmedEmail);

      if (!isEmailValid) throw new Error(ResultErrorCodes.EmailIsNotValid);

      if (!trimmedPassword)
        throw new Error(ResultErrorCodes.PasswordIsRequired);

      if (trimmedPassword.length < 8) {
        throw new Error(ResultErrorCodes.PasswordMustBeAtLeast8Characters);
      }

      // 🔹 fetch user from DB
      const user = await this.userRepository.findOne("email", trimmedEmail);

      // 🔹 safe check for missing password
      if (!user || !user.password) {
        throw new Error(ResultErrorCodes.InvalidCredentials);
      }

      // 🔹 compare password
      const isPasswordMatch = await bcrypt.compare(
        trimmedPassword,
        user.password,
      );
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
        JSON.stringify({
          success: true,
          data: { user: UserFactory.transformUserResponse(user), token },
        }),
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
      if (!id) throw new Error(ResultErrorCodes.UserIdIsRequired);

      const user = await this.userRepository.findById(id);
      if (!user) throw new Error(ResultErrorCodes.UserNotFound);

      await this.userRepository.deleteById(id);

      return new Response(
        JSON.stringify({
          success: true,
          message: ResultSuccessMessages.UserDeletedSuccessfully,
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

  private validateRequestBody = async (data: IUserRegisterRequest) => {
    const fieldMapping = [
      {
        field: data?.firstName,
        errorMsg: ResultErrorCodes.FirstNameIsRequired,
      },
      { field: data?.email, errorMsg: ResultErrorCodes.EmailIsRequired },
      { field: data?.password, errorMsg: ResultErrorCodes.PasswordIsRequired },
      { field: data?.phone, errorMsg: ResultErrorCodes.PhoneNumberIsRequired },
    ];

    for (const item of fieldMapping) {
      if (!item.field) throw new Error(item.errorMsg);
    }

    if (data?.password && data.password.length < 8) {
      throw new Error(ResultErrorCodes.PasswordMustBeAtLeast8Characters);
    }

    if (
      data?.phone &&
      (!/^\d{10}$/.test(data.phone) || data?.phone?.length !== 10)
    ) {
      throw new Error(ResultErrorCodes.PhoneNumberIsInvalid);
    }

    if (!checkIsValidEmail(data.email))
      throw new Error(ResultErrorCodes.EmailIsNotValid);

    const userAlreadyExists = await this.userRepository.findByFieldName(
      "email",
      data.email,
    );
    if (userAlreadyExists)
      throw new Error(ResultErrorCodes.UserAlreadyExistsWithThisEmail);

    const phoneNumberAlreadyInUse = await this.userRepository.findByFieldName(
      "phone",
      data.phone,
    );
    if (phoneNumberAlreadyInUse) {
      throw new Error(ResultErrorCodes.PhoneNumberAlreadyInUse);
    }
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
      if (!id) throw new Error(ResultErrorCodes.UserIdIsRequired);

      const user = await this.userRepository.findById(id);

      if (!user) throw new Error(ResultErrorCodes.UserNotFound);

      if (user.isAdmin) {
        throw new Error(ResultErrorCodes.AccessDenied);
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
      if (!id) throw new Error(ResultErrorCodes.UserIdIsRequired);

      const user = await this.userRepository.findById(id);
      if (!user) throw new Error(ResultErrorCodes.UserNotFound);

      const body = await req.json();
      const { firstName, lastName, phone, password } = body;

      // 🔹 update allowed fields
      if (firstName !== undefined) user.firstName = firstName.trim();
      if (lastName !== undefined) user.lastName = lastName.trim();
      if (phone !== undefined) {
        if (phone && (!/^\d{10}$/.test(phone) || phone?.length !== 10)) {
          throw new Error(ResultErrorCodes.PhoneNumberIsInvalid);
        }
        user.phone = phone;
      }
      if (password) {
        const trimmedPassword = password.trim();
        if (trimmedPassword.length < 8) {
          throw new Error(ResultErrorCodes.PasswordMustBeAtLeast8Characters);
        }
        user.password = await bcrypt.hash(trimmedPassword, 10);
      }

      await user.save();

      return new Response(
        JSON.stringify({
          success: true,
          message: ResultSuccessMessages.UserCreatedSuccessfully,
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

  public sendOtp = async (email: string) => {
    try {
      if (!email) throw new Error(ResultErrorCodes.EmailIsRequired);

      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) throw new Error(ResultErrorCodes.UserNotFound);

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Generate temporary token for page protection
      const token = crypto.randomBytes(32).toString("hex");

      // OTP expires in 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Save OTP in MongoDB using Mongoose
      await Otp.create({
        email,
        otp,
        token,
        verified: false,
        expiresAt,
      });

      // Send OTP email using reusable EmailService
      await this.emailService.sendOtpMail(email, otp);

      // ✅ Return structured Response like other APIs
      return new Response(
        JSON.stringify({ success: true, message: "OTP sent", token }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      // ✅ Wrap error in Response object instead of returning plain object
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message || "Internal Server Error",
        }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}

export default UserService;
