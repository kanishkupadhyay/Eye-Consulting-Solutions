import ResultErrorMessage from "@/common/backend/error.message";
import { checkIsValidEmail, getDecodedToken } from "@/common/backend/utils";
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
import { User } from "@/models/user.model";
import OtpService from "./otp.service";
import { NextResponse } from "next/server";

class UserService {
  private userRepository = new UserRepository();
  private countryRepository = new CountryRepository();
  private emailService = new EmailService();
  private otpService = new OtpService();

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

  public resetPassword = async (req: Request) => {
    try {
      const body = await req.json();
      const { newPassword, resetToken } = body;

      if (!resetToken) {
        throw new Error(ResultErrorMessage.ResetTokenIsRequired);
      }

      if (!newPassword) {
        throw new Error(ResultErrorMessage.NewPasswordIsRequired);
      }
      const decoded: any = getDecodedToken(
        resetToken,
        process.env.JWT_RESET_SECRET,
      );
      const user = await User.findOne({ email: decoded?.email });

      if (!user) {
        throw new Error(ResultErrorMessage.UserNotFound);
      }

      user.password = newPassword;
      await user.save();
      return new Response(
        JSON.stringify({
          success: true,
          message: ResultSuccessMessages.PasswordResetSuccessfully,
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

  public loginUser = async (data: IUserLoginRequest) => {
    try {
      const { email, password } = data;
      const trimmedEmail = email?.trim() || "";
      const trimmedPassword = password?.trim() || "";

      if (!trimmedEmail) throw new Error(ResultErrorMessage.EmailIsRequired);

      const isEmailValid = checkIsValidEmail(trimmedEmail);

      if (!isEmailValid) throw new Error(ResultErrorMessage.EmailIsNotValid);

      if (!trimmedPassword)
        throw new Error(ResultErrorMessage.PasswordIsRequired);

      if (trimmedPassword.length < 8) {
        throw new Error(ResultErrorMessage.PasswordMustBeAtLeast8Characters);
      }

      // 🔹 fetch user from DB
      const user = await this.userRepository.findOne("email", trimmedEmail);

      // 🔹 safe check for missing password
      if (!user || !user.password) {
        throw new Error(ResultErrorMessage.InvalidCredentials);
      }

      // 🔹 compare password
      const isPasswordMatch = await bcrypt.compare(
        trimmedPassword,
        user.password,
      );
      if (!isPasswordMatch) {
        throw new Error(ResultErrorMessage.InvalidCredentials);
      }

      // update lastLogin timestamp
      await this.userRepository.update(user._id, { lastLogin: new Date() });

      // 🔹 generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_AUTH_SECRET!,
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
      if (!id) throw new Error(ResultErrorMessage.UserIdIsRequired);

      const user = await this.userRepository.findById(id);
      if (!user) throw new Error(ResultErrorMessage.UserNotFound);

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
        errorMsg: ResultErrorMessage.FirstNameIsRequired,
      },
      { field: data?.email, errorMsg: ResultErrorMessage.EmailIsRequired },
      {
        field: data?.password,
        errorMsg: ResultErrorMessage.PasswordIsRequired,
      },
      {
        field: data?.phone,
        errorMsg: ResultErrorMessage.PhoneNumberIsRequired,
      },
    ];

    for (const item of fieldMapping) {
      if (!item.field) throw new Error(item.errorMsg);
    }

    if (data?.password && data.password.length < 8) {
      throw new Error(ResultErrorMessage.PasswordMustBeAtLeast8Characters);
    }

    if (
      data?.phone &&
      (!/^\d{10}$/.test(data.phone) || data?.phone?.length !== 10)
    ) {
      throw new Error(ResultErrorMessage.PhoneNumberIsInvalid);
    }

    if (!checkIsValidEmail(data.email))
      throw new Error(ResultErrorMessage.EmailIsNotValid);

    const userAlreadyExists = await this.userRepository.findByFieldName(
      "email",
      data.email,
    );
    if (userAlreadyExists)
      throw new Error(ResultErrorMessage.UserAlreadyExistsWithThisEmail);

    const phoneNumberAlreadyInUse = await this.userRepository.findByFieldName(
      "phone",
      data.phone,
    );
    if (phoneNumberAlreadyInUse) {
      throw new Error(ResultErrorMessage.PhoneNumberAlreadyInUse);
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
      if (!id) throw new Error(ResultErrorMessage.UserIdIsRequired);

      const user = await this.userRepository.findById(id);

      if (!user) {
        return NextResponse.json(
          { message: ResultErrorMessage.UserNotFound, success: false },
          { status: StatusCodes.NOT_FOUND },
        );
      }

      if (user.isAdmin) {
        return NextResponse.json(
          { message: ResultErrorMessage.AccessDenied, success: false },
          { status: StatusCodes.FORBIDDEN },
        );
      }

      return NextResponse.json(
        { success: true, data: user },
        { status: StatusCodes.OK },
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

  public updateUser = async (req: Request, id: string) => {
    try {
      if (!id) throw new Error(ResultErrorMessage.UserIdIsRequired);

      const user = await this.userRepository.findById(id);
      if (!user) throw new Error(ResultErrorMessage.UserNotFound);

      const body = await req.json();
      const { firstName, lastName, phone, password } = body;

      // 🔹 update allowed fields
      if (firstName !== undefined) user.firstName = firstName.trim();
      if (lastName !== undefined) user.lastName = lastName.trim();
      if (phone !== undefined) {
        if (phone && (!/^\d{10}$/.test(phone) || phone?.length !== 10)) {
          throw new Error(ResultErrorMessage.PhoneNumberIsInvalid);
        }
        user.phone = phone;
      }
      if (password) {
        const trimmedPassword = password.trim();
        if (trimmedPassword.length < 8) {
          throw new Error(ResultErrorMessage.PasswordMustBeAtLeast8Characters);
        }
        user.password = trimmedPassword;
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
      if (!email) throw new Error(ResultErrorMessage.EmailIsRequired);

      if (!checkIsValidEmail(email)) {
        throw new Error(ResultErrorMessage.EmailIsNotValid);
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) throw new Error(ResultErrorMessage.UserNotFound);

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP in DB using OtpService
      await this.otpService.createOtp(email, otp, 5);

      // Send OTP email
      await this.emailService.sendOtpMail(email, otp);

      // Return structured Response including the token
      return new Response(
        JSON.stringify({ success: true, message: "OTP sent" }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
        }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };

  public validateOtp = async (email: string, otp: string) => {
    try {
      // Delegate OTP validation to otpService
      const response = await this.otpService.validateOtp(email, otp);
      return response;
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
