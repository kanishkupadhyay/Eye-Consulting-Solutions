import { NextResponse } from "next/server";
import StatusCodes from "@/common/backend/status-codes";
import ResultErrorMessage from "@/common/backend/error.message";
import ResumeParser from "@/common/backend/resume-parser.service";
import S3Uploader from "@/common/backend/s3-uploader";
import CandidateRepository from "@/repositories/candidate.repository";
import { Types } from "mongoose";
import { checkIsValidEmail, getDecodedToken } from "@/common/backend/utils";
import { IGetCandidatesRequest } from "@/common/backend/candidate.interface";
import ResultSuccessMessages from "@/common/backend/success.messsage";

export default class CandidateService {
  private s3Uploader = new S3Uploader();
  private candidateRepository = new CandidateRepository();

  public parseResumes = async (req: Request) => {
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

  public verifyCandidate = async (req: Request) => {
    try {
      const { email, phone } = await req.json();

      if (!email) {
        throw new Error(ResultErrorMessage.EmailIsRequired);
      }

      if (!checkIsValidEmail(email)) {
        throw new Error(ResultErrorMessage.EmailIsNotValid);
      }

      if (!phone) {
        throw new Error(ResultErrorMessage.PhoneNumberIsRequired);
      }

      if (phone.length !== 10) {
        throw new Error(ResultErrorMessage.PhoneNumberIsInvalid);
      }

      const existingCandidate = await this.candidateRepository.findOne(
        "email",
        email,
      );

      if (existingCandidate) {
        return NextResponse.json(
          {
            success: false,
            message: ResultErrorMessage.CandidateAlreadyExistsWithThisEmail,
          },
          { status: StatusCodes.CONFLICT },
        );
      }

      const existingPhone = await this.candidateRepository.findOne(
        "phone",
        phone,
      );

      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            message:
              ResultErrorMessage.CandidateAlreadyExistsWithThisPhoneNumber,
          },
          { status: StatusCodes.CONFLICT },
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          message: ResultSuccessMessages.CandidateVerifiedSuccessfully,
        }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      console.error("Verify Candidate Error:", error);
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

      // 🔹 Check if candidate already exists and delete
      const existingCandidate = await this.candidateRepository.model.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingCandidate) {
        await this.candidateRepository.model.deleteOne({
          _id: existingCandidate._id,
        });
        console.log(
          `Deleted existing candidate with email ${email} or phone ${phone}`,
        );
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

      const gender = formData.get("gender") as "Male" | "Female";
      if (gender && !["Male", "Female"].includes(gender)) {
        throw new Error(ResultErrorMessage.GenderIsInvalid);
      }

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
        if (edu.endYear && edu.endYear < 1900) {
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
      let currentlyWorkingCount = 0;

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

        if (exp.currentlyWorking) {
          currentlyWorkingCount++;

          if (exp.endDate) {
            throw new Error(
              `Experience[${index}] endDate should not exist if currentlyWorking is true`,
            );
          }
        } else {
          if (!exp.endDate) {
            throw new Error(
              `Experience[${index}] endDate is required if not currently working`,
            );
          }
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

      if (currentlyWorkingCount > 1) {
        throw new Error(
          ResultErrorMessage.OnlyOneJobCanBeMarkedAsCurrentlyWorking,
        );
      }

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
        gender,
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

  public uploadBulkResumes = async (req: Request) => {
    try {
      const authHeader = req.headers.get("Authorization");
      const token: string = authHeader?.split(" ")[1] ?? "";
      const decoded = getDecodedToken(token);

      const formData = await req.formData();
      const resumesData = formData.get("resumes"); // assume JSON array of candidates

      if (!resumesData) {
        throw new Error(ResultErrorMessage.NoResumeFilesProvided);
      }

      const candidatesInput = JSON.parse(resumesData as string);

      if (!Array.isArray(candidatesInput) || !candidatesInput.length) {
        throw new Error("Resumes data must be a non-empty array");
      }

      // 1️⃣ Collect emails and phones to delete existing candidates in one query
      const emails = candidatesInput
        .map((c: any) => c.email?.trim())
        .filter(Boolean);
      const phones = candidatesInput
        .map((c: any) => c.phone?.trim())
        .filter(Boolean);

      await this.candidateRepository.model.deleteMany({
        $or: [{ email: { $in: emails } }, { phone: { $in: phones } }],
      });

      // 2️⃣ Process candidates in parallel
      const processedCandidates = await Promise.all(
        candidatesInput.map(async (c: any, index: number) => {
          const name = c.name?.trim();
          if (!name) throw new Error(`Candidate[${index}] name is required`);

          const email = c.email?.trim();
          if (!email) throw new Error(`Candidate[${index}] email is required`);
          if (!checkIsValidEmail(email))
            throw new Error(`Candidate[${index}] email is invalid`);

          const phone = c.phone?.trim();
          if (!phone) throw new Error(`Candidate[${index}] phone is required`);
          if (phone.length !== 10)
            throw new Error(`Candidate[${index}] phone is invalid`);

          const currentLocation = c.currentLocation?.trim();
          if (!currentLocation)
            throw new Error(`Candidate[${index}] currentLocation is required`);

          const age = c.age ? Number(c.age) : undefined;
          if (age && (age < 18 || age > 65))
            throw new Error(`Candidate[${index}] age is invalid`);

          const gender = c.gender;
          if (gender && !["Male", "Female"].includes(gender))
            throw new Error(`Candidate[${index}] gender is invalid`);

          const experienceYears = Number(c.experienceYears || 0);
          const experienceMonths = Number(c.experienceMonths || 0);
          if (experienceYears < 0 || experienceYears > 50)
            throw new Error(
              `Candidate[${index}] experienceYears cannot exceed 50`,
            );
          if (experienceMonths < 0 || experienceMonths > 11)
            throw new Error(
              `Candidate[${index}] experienceMonths cannot exceed 11`,
            );

          const experienceInMonths = experienceYears * 12 + experienceMonths;

          const skills = Array.isArray(c.skills) ? c.skills : [];
          if (!skills.length)
            throw new Error(`Candidate[${index}] must have at least one skill`);

          const keywords = Array.isArray(c.keywords) ? c.keywords : [];
          const defenseBackgroundCheck = c.defenseBackgroundCheck === true;

          const education = Array.isArray(c.education) ? c.education : [];
          education.forEach((edu: any, i: number) => {
            if (!edu.degree?.trim())
              throw new Error(
                `Candidate[${index}] Education[${i}] degree required`,
              );
            if (!edu.institute?.trim())
              throw new Error(
                `Candidate[${index}] Education[${i}] institute required`,
              );
            if (
              edu.startYear &&
              (edu.startYear < 1900 || edu.startYear > new Date().getFullYear())
            )
              throw new Error(
                `Candidate[${index}] Education[${i}] startYear invalid`,
              );
            if (edu.endYear && edu.endYear < 1900)
              throw new Error(
                `Candidate[${index}] Education[${i}] endYear invalid`,
              );
            if (edu.startYear && edu.endYear && edu.startYear > edu.endYear)
              throw new Error(
                `Candidate[${index}] Education[${i}] startYear cannot be after endYear`,
              );
          });

          const experience = Array.isArray(c.experience) ? c.experience : [];
          let currentlyWorkingCount = 0;
          experience.forEach((exp: any, i: number) => {
            if (!exp.company?.trim())
              throw new Error(
                `Candidate[${index}] Experience[${i}] company required`,
              );
            if (!exp.role?.trim())
              throw new Error(
                `Candidate[${index}] Experience[${i}] role required`,
              );
            if (!exp.startDate)
              throw new Error(
                `Candidate[${index}] Experience[${i}] startDate required`,
              );

            const start = new Date(exp.startDate);
            const end = exp.endDate ? new Date(exp.endDate) : null;
            if (isNaN(start.getTime()))
              throw new Error(
                `Candidate[${index}] Experience[${i}] startDate invalid`,
              );
            if (exp.currentlyWorking) {
              currentlyWorkingCount++;
              if (exp.endDate)
                throw new Error(
                  `Candidate[${index}] Experience[${i}] endDate should not exist if currentlyWorking is true`,
                );
            } else {
              if (!exp.endDate)
                throw new Error(
                  `Candidate[${index}] Experience[${i}] endDate required if not currently working`,
                );
            }
            if (end && isNaN(end.getTime()))
              throw new Error(
                `Candidate[${index}] Experience[${i}] endDate invalid`,
              );
            if (end && start > end)
              throw new Error(
                `Candidate[${index}] Experience[${i}] startDate cannot be after endDate`,
              );
          });
          if (currentlyWorkingCount > 1)
            throw new Error(
              `Candidate[${index}] only one job can be currentlyWorking`,
            );

          const file = c.resumeFile as File | undefined;
          let resumeUrl = "";
          let resumeText = "";
          if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            resumeText = await ResumeParser.parseText(fileBuffer, file.type);
            resumeUrl = await this.s3Uploader.uploadFile(
              fileBuffer,
              file.name,
              file.type,
            );
          }

          return {
            name,
            email,
            phone,
            age,
            gender,
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
          };
        }),
      );

      const savedCandidates =
        await this.candidateRepository.model.insertMany(processedCandidates);

      return new Response(
        JSON.stringify({ success: true, data: savedCandidates }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      console.error("Upload Bulk Resumes Error:", error);

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
