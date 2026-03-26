import ResultErrorMessage from "@/common/backend/error.message";
import StatusCodes from "@/common/backend/status-codes";
import jwt from "jsonwebtoken";
import OtpRepository from "@/repositories/otp.repository";

class OtpService {
  private otpRepo: OtpRepository;

  constructor() {
    this.otpRepo = new OtpRepository();
  }

  // Create/save OTP
  public async createOtp(email: string, otp: string, expiryMinutes = 5) {
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const otpEntry = await this.otpRepo.createOtp({
      email,
      otp,
      expiresAt,
    });

    return otpEntry;
  }

  // Validate OTP
  public async validateOtp(email: string, otp: string) {
    try {
      if (!email) {
        throw new Error(ResultErrorMessage.EmailIsRequired);
      }

      if (!otp) {
        throw new Error(ResultErrorMessage.OtpIsRequired);
      }

      const otpEntry = await this.otpRepo.findByEmailAndOtp(email, otp);

      // OTP not found or expired
      if (!otpEntry || otpEntry.expiresAt < new Date()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: ResultErrorMessage.InvalidOrExpiredToken,
          }),
          {
            status: StatusCodes.OK,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Step 2: Generate reset password token (valid for 5 mins)
      const resetPasswordToken = jwt.sign(
        { email },
        process.env.JWT_RESET_SECRET as string,
        { expiresIn: "5m" },
      );

      // OTP is valid → delete to prevent reuse
      await this.otpRepo.deleteOtp(otpEntry);

      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP validated successfully",
          resetPasswordToken,
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
  }

  // Force delete OTPs for an email
  public async deleteOtpByEmail(email: string) {
    return this.otpRepo.deleteByEmail(email);
  }

  // Optional: clean up expired OTPs manually
  public async deleteExpiredOtps() {
    return this.otpRepo.deleteExpired();
  }
}

export default OtpService;
