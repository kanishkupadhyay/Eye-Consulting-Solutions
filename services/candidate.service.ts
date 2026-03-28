import Candidate from "@/models/candidate.model";
import { NextResponse } from "next/server";
import StatusCodes from "@/common/backend/status-codes";
import ResultErrorMessage from "@/common/backend/error.message";
import ResumeParser from "@/common/backend/resume-parser.service";
import S3Uploader from "@/common/backend/s3-uploader";
import CandidateRepository from "@/repositories/candidate.repository";
import { Types } from "mongoose";
import { checkIsValidEmail, getDecodedToken } from "@/common/backend/utils";

export default class CandidateService {
  private s3Uploader = new S3Uploader();
  private candidateRepository = new CandidateRepository();

  public uploadResumes = async (req: Request) => {
    const formData = await req.formData();
    const uploadedFiles = Array.from(formData.values()).filter(
      (value): value is File => value instanceof File,
    );

    if (!uploadedFiles.length) {
      return NextResponse.json(
        { success: false, message: ResultErrorMessage.NoResumeFilesProvided },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const results = [];

    for (const file of uploadedFiles) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const text = await ResumeParser.parseText(fileBuffer, file.type);

      const candidateData = {
        name: ResumeParser.extractName(text),
        email: ResumeParser.extractEmail(text),
        phone: ResumeParser.extractPhone(text),
        gender: ResumeParser.extractGender(text),
        skills: ResumeParser.extractSkills(text),
        resumeUrl: "", // will be set after S3 upload
      };

      // Upload to S3
      candidateData.resumeUrl = await this.s3Uploader.uploadFile(
        fileBuffer,
        file.name,
        file.type,
      );

      const candidate = new Candidate(candidateData);
      await candidate.save();
      results.push(candidateData);
    }

    return NextResponse.json({ success: true, data: results });
  };

  public uploadResume = async (req: Request) => {
    const authHeader = req.headers.get("Authorization");
    const token: string = authHeader?.split(" ")[1] ?? "";

    const decoded = getDecodedToken(token);
    const formData = await req.formData();

    // Extract frontend fields
    const name = formData.get("name") as string;
    if (!name) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.NameIsRequired,
      });
    }
    const email = formData.get("email") as string;
    if (!email) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.EmailIsRequired,
      });
    }

    if (checkIsValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.EmailIsNotValid,
      });
    }

    const phone = formData.get("phone") as string;

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.PhoneNumberIsRequired,
      });
    }

    if (phone.length < 7 || phone.length > 15) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.PhoneNumberIsInvalid,
      });
    }
    const age = formData.get("age") ? Number(formData.get("age")) : undefined;
    if (age && (age < 18 || age > 65)) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.AgeIsInvalid,
      });
    }

    const gender = formData.get("gender") as "Male" | "Female";
    if (gender && !["Male", "Female"].includes(gender)) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.GenderIsInvalid,
      });
    }

    const currentLocation = formData.get("currentLocation") as string;
    if (!currentLocation) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.CurrentLocationIsRequired,
      });
    }
    const experienceYears = Number(formData.get("experienceYears") || 0);
    if (!isNaN(experienceYears) && experienceYears < 0) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.ExperienceYearsCannotBeNegative,
      });
    }
    if (!isNaN(experienceYears) && experienceYears > 50) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.ExperienceYearsCannotExceed50,
      });
    }
    const experienceMonths = Number(formData.get("experienceMonths") || 0);
    if (!isNaN(experienceMonths) && experienceMonths < 0) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.ExperienceMonthsCannotBeNegative,
      });
    }
    if (!isNaN(experienceMonths) && experienceMonths >= 12) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.ExperienceMonthsCannotExceed11,
      });
    }
    const skills =
      (formData.get("skills") as string)?.split(",").map((s) => s.trim()) || [];
    if (!skills || !skills.length) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.AtLeastOneSkillIsRequired,
      });
    }
    const keywords =
      (formData.get("keywords") as string)?.split(",").map((s) => s.trim()) ||
      [];
    const defenseBackgroundCheck =
      formData.get("defenseBackgroundCheck") === "true";

    // Convert experience to months
    const experienceInMonths = experienceYears * 12 + experienceMonths;

    // Handle resume file
    const file = formData.get("resume") as File | null;
    if(!file) {
      return NextResponse.json({
        success: false,
        message: ResultErrorMessage.NoResumeFilesProvided,
      });
    }
    let resumeUrl = "";
    let resumeText = "";

    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Parse resume text for search
      resumeText = await ResumeParser.parseText(fileBuffer, file.type);

      // Upload resume to S3
      resumeUrl = await this.s3Uploader.uploadFile(
        fileBuffer,
        file.name,
        file.type,
      );
    }

    // Prepare candidate data
    const candidateData = {
      name,
      email,
      phone,
      age,
      gender,
      currentLocation,
      experienceInMonths,
      skills,
      keywords,
      defenseBackgroundCheck,
      resumeUrl,
      resumeText,
      createdBy: new Types.ObjectId(decoded.userId),
    };

    // Save using repository
    const candidate = await this.candidateRepository.create(candidateData);

    return NextResponse.json({ success: true, data: candidate });
  };
}
