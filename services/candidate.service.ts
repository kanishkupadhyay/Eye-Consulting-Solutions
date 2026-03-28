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
    try {
      const authHeader = req.headers.get("Authorization");
      const token: string = authHeader?.split(" ")[1] ?? "";

      const decoded = getDecodedToken(token);
      const formData = await req.formData();

      // 🔹 name
      const name = (formData.get("name") as string)?.trim();
      if (!name) throw new Error(ResultErrorMessage.NameIsRequired);

      // 🔹 email
      const email = (formData.get("email") as string)?.trim();
      if (!email) throw new Error(ResultErrorMessage.EmailIsRequired);

      if (!checkIsValidEmail(email)) {
        throw new Error(ResultErrorMessage.EmailIsNotValid);
      }

      // 🔹 phone
      const phone = (formData.get("phone") as string)?.trim();
      if (!phone) {
        throw new Error(ResultErrorMessage.PhoneNumberIsRequired);
      }

      if (phone.length < 7 || phone.length > 15) {
        throw new Error(ResultErrorMessage.PhoneNumberIsInvalid);
      }

      // 🔥 FIX: currentLocation validation (your issue)
      const currentLocation = (
        formData.get("currentLocation") as string
      )?.trim();
      if (!currentLocation) {
        throw new Error(ResultErrorMessage.CurrentLocationIsRequired);
      }

      // 🔹 age
      const age = formData.get("age") ? Number(formData.get("age")) : undefined;
      if (age && (age < 18 || age > 65)) {
        throw new Error(ResultErrorMessage.AgeIsInvalid);
      }

      // 🔹 gender
      const gender = formData.get("gender") as "Male" | "Female";
      if (gender && !["Male", "Female"].includes(gender)) {
        throw new Error(ResultErrorMessage.GenderIsInvalid);
      }

      // 🔹 experience
      const experienceYears = Number(formData.get("experienceYears") || 0);
      if (experienceYears < 0) {
        throw new Error(ResultErrorMessage.ExperienceYearsCannotBeNegative);
      }
      if (experienceYears > 50) {
        throw new Error(ResultErrorMessage.ExperienceYearsCannotExceed50);
      }

      const experienceMonths = Number(formData.get("experienceMonths") || 0);
      if (experienceMonths < 0) {
        throw new Error(ResultErrorMessage.ExperienceMonthsCannotBeNegative);
      }
      if (experienceMonths >= 12) {
        throw new Error(ResultErrorMessage.ExperienceMonthsCannotExceed11);
      }

      // 🔹 skills
      const skills = formData.get("skills")
        ? JSON.parse(formData.get("skills") as string)
        : [];

      if (!skills.length) {
        throw new Error(ResultErrorMessage.AtLeastOneSkillIsRequired);
      }

      // 🔹 keywords
      const keywords = formData.get("keywords")
        ? JSON.parse(formData.get("keywords") as string)
        : [];

      const defenseBackgroundCheck =
        formData.get("defenseBackgroundCheck") === "true";

      const experienceInMonths = experienceYears * 12 + experienceMonths;

      // 🔹 resume file
      const file = formData.get("resume") as File | null;
      if (!file) {
        throw new Error(ResultErrorMessage.NoResumeFilesProvided);
      }

      let resumeUrl = "";
      let resumeText = "";

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      resumeText = await ResumeParser.parseText(fileBuffer, file.type);

      resumeUrl = await this.s3Uploader.uploadFile(
        fileBuffer,
        file.name,
        file.type,
      );

      // 🔹 DB save
      const candidate = await this.candidateRepository.create({
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
      });

      // 🔹 success response
      return new Response(
        JSON.stringify({
          success: true,
          data: candidate,
        }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      console.error("Upload Resume Error:", error);

      // 🔹 ALL validation errors come here as 400 (NOT 500)
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

  public getCandidatesCount = async () => {
    try {
      const count = await this.candidateRepository.count({});
      return new Response(
        JSON.stringify({
          success: true,
          data: { count },
        }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      console.error("Get Candidates Count Error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
        }),
        {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}
