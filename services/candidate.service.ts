import { NextResponse } from "next/server";
import StatusCodes from "@/common/backend/status-codes";
import ResultErrorMessage from "@/common/backend/error.message";
import ResumeParser from "@/common/backend/resume-parser.service";
import S3Uploader from "@/common/backend/s3-uploader";
import CandidateRepository from "@/repositories/candidate.repository";
import { Types } from "mongoose";
import { checkIsValidEmail, getDecodedToken } from "@/common/backend/utils";
import { IGetCandidatesRequest } from "@/common/backend/candidate.interface";

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

      // Parse text
      const text = await ResumeParser.parseText(fileBuffer, file.type);

      const candidateData = {
        name: ResumeParser.extractName(text),
        email: ResumeParser.extractEmail(text),
        phone: ResumeParser.extractPhone(text),
        gender: ResumeParser.extractGender(text),
        skills: ResumeParser.extractSkills(text),

        // Return file reference instead of uploading
        resumeUrl: file.name, // or you can pass a temp URL if frontend sends one
      };

      results.push(candidateData);
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
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

      const currentLocation = (
        formData.get("currentLocation") as string
      )?.trim();
      if (!currentLocation) {
        throw new Error(ResultErrorMessage.CurrentLocationIsRequired);
      }

      const age = formData.get("age") ? Number(formData.get("age")) : undefined;
      if (age && (age < 18 || age > 65)) {
        throw new Error(ResultErrorMessage.AgeIsInvalid);
      }

      // const gender = formData.get("gender") as "Male" | "Female";
      // if (gender && !["Male", "Female"].includes(gender)) {
      //   throw new Error(ResultErrorMessage.GenderIsInvalid);
      // }

      const experienceYears = Number(formData.get("experienceYears") || 0);
      if (experienceYears < 0 || experienceYears > 50) {
        throw new Error(ResultErrorMessage.ExperienceYearsCannotExceed50);
      }

      const experienceMonths = Number(formData.get("experienceMonths") || 0);
      if (experienceMonths < 0 || experienceMonths > 11) {
        throw new Error(ResultErrorMessage.ExperienceMonthsCannotExceed11);
      }

      const experienceInMonths = experienceYears * 12 + experienceMonths;

      // 🔹 skills / keywords
      const skills = formData.get("skills")
        ? JSON.parse(formData.get("skills") as string)
        : [];

      if (!Array.isArray(skills) || !skills.length) {
        throw new Error(ResultErrorMessage.AtLeastOneSkillIsRequired);
      }

      const keywords = formData.get("keywords")
        ? JSON.parse(formData.get("keywords") as string)
        : [];

      const defenseBackgroundCheck =
        formData.get("defenseBackgroundCheck") === "true";

      let education = [];
      try {
        education = formData.get("education")
          ? JSON.parse(formData.get("education") as string)
          : [];
      } catch {
        throw new Error(ResultErrorMessage.InvalidEducationFormat);
      }

      if (!Array.isArray(education)) {
        throw new Error(ResultErrorMessage.InvalidEducationFormat);
      }

      education.forEach((edu, index: number) => {
        if (!edu.degree?.trim()) {
          throw new Error(`Education[${index}] degree is required`);
        }
        if (!edu.institute?.trim()) {
          throw new Error(`Education[${index}] institute is required`);
        }
        if (
          edu.startYear &&
          (edu.startYear < 1900 || edu.startYear > new Date().getFullYear())
        ) {
          throw new Error(`Education[${index}] startYear is invalid`);
        }
        if (
          edu.endYear &&
          (edu.endYear < 1900 || edu.endYear > new Date().getFullYear())
        ) {
          throw new Error(`Education[${index}] endYear is invalid`);
        }
        if (edu.startYear && edu.endYear && edu.startYear > edu.endYear) {
          throw new Error(
            `Education[${index}] startYear cannot be greater than endYear`,
          );
        }
      });

      let experience = [];
      try {
        experience = formData.get("experience")
          ? JSON.parse(formData.get("experience") as string)
          : [];
      } catch {
        throw new Error(ResultErrorMessage.InvalidExperienceFormat);
      }

      if (!Array.isArray(experience)) {
        throw new Error(ResultErrorMessage.InvalidExperienceFormat);
      }

      experience.forEach((exp, index: number) => {
        if (!exp.company?.trim()) {
          throw new Error(`Experience[${index}] company is required`);
        }
        if (!exp.role?.trim()) {
          throw new Error(`Experience[${index}] role is required`);
        }
        if (!exp.startDate) {
          throw new Error(`Experience[${index}] startDate is required`);
        }

        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : null;

        if (isNaN(start.getTime())) {
          throw new Error(`Experience[${index}] startDate is invalid`);
        }

        if (end && isNaN(end.getTime())) {
          throw new Error(`Experience[${index}] endDate is invalid`);
        }

        if (end && start > end) {
          throw new Error(
            `Experience[${index}] startDate cannot be after endDate`,
          );
        }
      });

      const file = formData.get("resume") as File | null;

      if (!file) {
        throw new Error(ResultErrorMessage.NoResumeFilesProvided);
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const resumeText = await ResumeParser.parseText(fileBuffer, file.type);

      const resumeUrl = await this.s3Uploader.uploadFile(
        fileBuffer,
        file.name,
        file.type,
      );

      // 🔹 save candidate
      const candidate = await this.candidateRepository.create({
        name,
        email,
        phone,
        age,
        gender: 'Male',
        currentLocation,
        experienceInMonths,
        education,
        experience,
        skills,
        keywords,
        defenseBackgroundCheck,
        resumeUrl,
        resumeText,
        createdBy: new Types.ObjectId(decoded.userId),
      });

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

  public getCandidates = async (body: IGetCandidatesRequest) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = body;

      const skip = (page - 1) * limit;

      // Build search filters
      const filter: any = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { currentLocation: { $regex: search, $options: "i" } },
          { skills: { $regex: search, $options: "i" } },
          { keywords: { $regex: search, $options: "i" } },
        ];
      }

      // Sorting - map sortOrder to 1 or -1
      const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
      const sortOptions: Record<string, number> = {};
      sortOptions[sortBy] = sortDirection;

      // Query candidates with pagination and sorting
      const [candidates, total] = await Promise.all([
        this.candidateRepository.findWithPagination(
          filter,
          skip,
          limit,
          sortOptions,
        ),
        this.candidateRepository.count(filter),
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          data: candidates,
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

  public getCandidateById = async (id: string | null) => {
    try {
      if (!id) throw new Error(ResultErrorMessage.UserIdIsRequired);
      const candidate = await this.candidateRepository.findById(id);
      if (!candidate) {
        return new Response(
          JSON.stringify({
            success: false,
            message: ResultErrorMessage.CandidateNotFound,
          }),
          {
            status: StatusCodes.NOT_FOUND,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ success: true, data: candidate }), {
        status: StatusCodes.OK,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}
