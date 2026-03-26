import ResultErrorCodes from "@/common/backend/error.message";
import StatusCodes from "@/common/backend/status-codes";
import crypto from "crypto";
import OtpRepository from "@/repositories/otp.repository";

class OtpService {
  private otpRepo: OtpRepository;

  constructor() {
    this.otpRepo = new OtpRepository();
  }

  // Create/save OTP
  public async createOtp(
    email: string,
    otp: string,
    expiryMinutes = 5,
    token?: string
  ) {
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const otpEntry = await this.otpRepo.createOtp({
      email,
      otp,
      token: token || crypto.randomBytes(32).toString("hex"),
      expiresAt,
    });

    return otpEntry;
  }

  // Validate OTP
  public async validateOtp(email: string, otp: string) {
    try {
      if (!email) {
        throw new Error(ResultErrorCodes.EmailIsRequired);
      }

      if (!otp) {
        throw new Error(ResultErrorCodes.OtpIsRequired);
      }

      const otpEntry = await this.otpRepo.findByEmailAndOtp(email, otp);

      // OTP not found or expired
      if (!otpEntry || otpEntry.expiresAt < new Date()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: ResultErrorCodes.InvalidOrExpiredToken,
          }),
          {
            status: StatusCodes.OK,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // OTP is valid → delete to prevent reuse
      await this.otpRepo.deleteOtp(otpEntry);

      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP validated successfully",
        }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        }
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