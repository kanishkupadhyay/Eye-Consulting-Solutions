/* eslint-disable @typescript-eslint/no-explicit-any */
import { Otp } from "@/models/otp.model";
import { BaseRepository } from "./base.repository";

class OtpRepository extends BaseRepository<any> {
  constructor() {
    super(Otp);
  }

  // Create/save OTP
  public async createOtp(data: {
    email: string;
    otp: string;
    expiresAt: Date;
  }) {
    const otpEntry = new this.model(data);
    await otpEntry.save();
    return otpEntry;
  }

  // Find OTP by email & otp
  public async findByEmailAndOtp(email: string, otp: string) {
    return this.model.findOne({ email, otp });
  }

  // Delete OTP by ID or document
  public async deleteOtp(otpEntry: any) {
    return otpEntry.deleteOne();
  }

  // Delete all OTPs for an email
  public async deleteByEmail(email: string) {
    return this.model.deleteMany({ email });
  }

  // Optional: clean up expired OTPs manually
  public async deleteExpired() {
    return this.model.deleteMany({ expiresAt: { $lte: new Date() } });
  }
}

export default OtpRepository;