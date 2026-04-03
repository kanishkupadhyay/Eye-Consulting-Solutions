import { NextResponse } from "next/server";
import StatusCodes from "@/common/backend/status-codes";
import ResultErrorMessage from "@/common/backend/error.message";
import ResumeParser from "@/common/backend/resume-parser.service";
import S3Uploader from "@/common/backend/s3-uploader";
import CandidateRepository from "@/repositories/candidate.repository";
import { Types } from "mongoose";
import { checkIsValidEmail, getDecodedToken } from "@/common/backend/utils";
import { IGetCandidatesRequest } from "@/common/backend/candidate.interface";
import ResultSuccessMessages from "@/common/backend/success.message";
import StateRepository from "@/repositories/state.repository";
import CityRepository from "@/repositories/city.repository";

export default class CandidateService {
  private s3Uploader = new S3Uploader();
  private candidateRepository = new CandidateRepository();
  private stateRepository = new StateRepository();
  private cityRepository = new CityRepository();

  public parseResumes = async (req: Request) => {
    try {
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
        try {
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const text = await ResumeParser.parseText(fileBuffer, file.type);

          results.push({
            name: ResumeParser.extractName(text),
            email: ResumeParser.extractEmail(text),
            phone: ResumeParser.extractPhone(text),
            gender: ResumeParser.extractGender(text),
            skills: ResumeParser.extractSkills(text),
            resumeUrl: file.name,
          });
        } catch (fileErr) {
          console.warn(`Failed to parse file ${file.name}:`, fileErr);
          // Push empty/default values instead of failing
          results.push({
            name: "",
            email: "",
            phone: "",
            gender: "",
            skills: [],
            resumeUrl: file.name,
          });
        }
      }

      return NextResponse.json({ success: true, data: results });
    } catch (err) {
      console.error("Error parsing resumes:", err);
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while parsing resumes",
          error: (err as Error).message,
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }
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

      const stateId = (formData.get("state") as string)?.trim();
      if (!stateId) throw new Error(ResultErrorMessage.StateIsRequired);

      // Check if state exists by ID
      const isValidState = await this.stateRepository.model.findById(stateId);
      if (!isValidState) {
        throw new Error(ResultErrorMessage.InvalidState);
      }

      const cityId = (formData.get("city") as string)?.trim();
      if (!cityId) {
        throw new Error(ResultErrorMessage.CityIsRequired);
      }

      // Check if city exists by ID and belongs to the given state
      const isValidCity = await this.cityRepository.model.findOne({
        _id: cityId,
        state: stateId,
      });
      if (!isValidCity) {
        throw new Error(ResultErrorMessage.InvalidCity);
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

      // 🔹 skills
      const skills = formData.get("skills")
        ? JSON.parse(formData.get("skills") as string)
        : [];

      if (!Array.isArray(skills) || !skills.length) {
        throw new Error(ResultErrorMessage.AtLeastOneSkillIsRequired);
      }

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
        state: new Types.ObjectId(stateId),
        city: new Types.ObjectId(cityId),
        experienceInMonths,
        education,
        experience,
        skills,
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

      const resumesData = formData.get("resumes");
      if (!resumesData) {
        throw new Error(ResultErrorMessage.NoResumeFilesProvided);
      }

      const candidatesInput = JSON.parse(resumesData as string);
      if (!Array.isArray(candidatesInput) || !candidatesInput.length)
        throw new Error("Resumes data must be a non-empty array");

      // ✅ Get all files from frontend
      const files = formData.getAll("files") as File[];
      if (files.length !== candidatesInput.length) {
        throw new Error(
          `Number of uploaded files (${files.length}) does not match number of candidates (${candidatesInput.length})`,
        );
      }

      // Delete existing candidates by email/phone
      const emails = candidatesInput
        .map((c: any) => c.email?.trim())
        .filter(Boolean);
      const phones = candidatesInput
        .map((c: any) => c.phone?.trim())
        .filter(Boolean);

      await this.candidateRepository.model.deleteMany({
        $or: [{ email: { $in: emails } }, { phone: { $in: phones } }],
      });

      // ✅ Process candidates
      const processedCandidates = await Promise.all(
        candidatesInput.map(async (c: any, index: number) => {
          const name = c.name?.trim();
          if (!name)
            throw new Error(`Candidate[${index + 1}] name is required`);

          const email = c.email?.trim();
          if (!email)
            throw new Error(`Candidate[${index + 1}] email is required`);
          if (!checkIsValidEmail(email))
            throw new Error(`Candidate[${index + 1}] email is invalid`);

          const phone = c.phone?.trim();
          if (!phone)
            throw new Error(`Candidate[${index + 1}] phone is required`);
          if (phone.length !== 10)
            throw new Error(`Candidate[${index + 1}] phone is invalid`);

          const stateId = c.state;
          if (!stateId)
            throw new Error(`Candidate[${index + 1}] state is required`);

          // Check if state exists by ID
          const isValidState =
            await this.stateRepository.model.findById(stateId);
          if (!isValidState)
            throw new Error(`Candidate[${index + 1}] state is invalid`);

          const cityId = c.city;
          if (!cityId)
            throw new Error(`Candidate[${index + 1}] city is required`);

          // Check if city exists by ID and belongs to the given state
          const isValidCity = await this.cityRepository.model.findOne({
            _id: cityId,
            state: stateId,
          });
          if (!isValidCity)
            throw new Error(`Candidate[${index + 1}] city is invalid`);

          const file = files[index];
          if (!file)
            throw new Error(`Candidate[${index + 1}] resume file is required`);

          const age = Number(c.age || 0);
          if (age && (age < 18 || age > 65))
            throw new Error(`Candidate[${index + 1}] age is invalid`);

          const gender = c.gender;
          if (gender && !["Male", "Female"].includes(gender))
            throw new Error(`Candidate[${index + 1}] gender is invalid`);

          const experienceYears = Number(c.experienceYears || 0);
          const experienceMonths = Number(c.experienceMonths || 0);
          if (experienceYears < 0 || experienceYears > 50)
            throw new Error(
              `Candidate[${index + 1}] experienceYears cannot exceed 50`,
            );
          if (experienceMonths < 0 || experienceMonths > 11)
            throw new Error(
              `Candidate[${index + 1}] experienceMonths cannot exceed 11`,
            );

          const experienceInMonths = experienceYears * 12 + experienceMonths;

          const skills = Array.isArray(c.skills) ? c.skills : [];
          if (!skills.length)
            throw new Error(
              `Candidate[${index + 1}] must have at least one skill`,
            );

          const defenseBackgroundCheck = c.defenseBackgroundCheck === true;

          const education = Array.isArray(c.education) ? c.education : [];
          education.forEach((edu: any, i: number) => {
            if (!edu.degree?.trim())
              throw new Error(
                `Candidate[${index + 1}] Education[${i}] degree required`,
              );
            if (!edu.institute?.trim())
              throw new Error(
                `Candidate[${index + 1}] Education[${i}] institute required`,
              );
            if (
              edu.startYear &&
              (edu.startYear < 1900 || edu.startYear > new Date().getFullYear())
            )
              throw new Error(
                `Candidate[${index + 1}] Education[${i}] startYear invalid`,
              );
            if (edu.endYear && edu.endYear < 1900)
              throw new Error(
                `Candidate[${index + 1}] Education[${i}] endYear invalid`,
              );
            if (edu.startYear && edu.endYear && edu.startYear > edu.endYear)
              throw new Error(
                `Candidate[${index + 1}] Education[${i}] startYear cannot be after endYear`,
              );
          });

          const experience = Array.isArray(c.experience) ? c.experience : [];
          let currentlyWorkingCount = 0;
          experience.forEach((exp: any, i: number) => {
            if (!exp.company?.trim())
              throw new Error(
                `Candidate[${index + 1}] Experience[${i}] company required`,
              );
            if (!exp.role?.trim())
              throw new Error(
                `Candidate[${index + 1}] Experience[${i}] role required`,
              );
            if (!exp.startDate)
              throw new Error(
                `Candidate[${index + 1}] Experience[${i}] startDate required`,
              );

            const start = new Date(exp.startDate);
            const end = exp.endDate ? new Date(exp.endDate) : null;
            if (isNaN(start.getTime()))
              throw new Error(
                `Candidate[${index + 1}] Experience[${i}] startDate invalid`,
              );
            if (exp.currentlyWorking) {
              currentlyWorkingCount++;
              if (exp.endDate)
                throw new Error(
                  `Candidate[${index + 1}] Experience[${i}] endDate should not exist if currentlyWorking is true`,
                );
            } else {
              if (!exp.endDate)
                throw new Error(
                  `Candidate[${index + 1}] Experience[${i}] endDate required if not currently working`,
                );
            }
            if (end && isNaN(end.getTime()))
              throw new Error(
                `Candidate[${index + 1}] Experience[${i}] endDate invalid`,
              );
            if (end && start > end)
              throw new Error(
                `Candidate[${index + 1}] Experience[${i}] startDate cannot be after endDate`,
              );
          });
          if (currentlyWorkingCount > 1)
            throw new Error(
              `Candidate[${index + 1}] only one job can be currentlyWorking`,
            );

          // ✅ Parse and upload resume
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const resumeText = await ResumeParser.parseText(
            fileBuffer,
            file.type,
          );
          const resumeUrl = await this.s3Uploader.uploadFile(
            fileBuffer,
            file.name,
            file.type,
          );

          return {
            name,
            email,
            phone,
            ...(age && { age }),
            gender,
            state: new Types.ObjectId(stateId),
            city: new Types.ObjectId(cityId),
            experienceInMonths,
            education,
            experience,
            skills,
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
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error";

      console.error("Upload Bulk Resumes Error:", error);

      return new Response(JSON.stringify({ success: false, message }), {
        status: StatusCodes.BAD_REQUEST,
        headers: { "Content-Type": "application/json" },
      });
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
        gender,
        state,
        city,
        defenseBackgroundCheck,
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
        ];
      }

      if (gender) {
        const normalizedGender =
          gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

        if (["Male", "Female"].includes(normalizedGender)) {
          filter.gender = normalizedGender;
        } else {
          throw new Error(ResultErrorMessage.GenderIsInvalid);
        }
      }

      if (state) {
        const isValidState = await this.stateRepository.model.findById(state);
        if (!isValidState) {
          throw new Error(ResultErrorMessage.InvalidState);
        }
        filter.state = new Types.ObjectId(state);
      }

      if (city) {
        const isValidCity = await this.cityRepository.model.findById(city);
        if (!isValidCity) {
          throw new Error(ResultErrorMessage.InvalidCity);
        }
        filter.city = new Types.ObjectId(city);
      }

      if (defenseBackgroundCheck !== undefined) {
        filter.defenseBackgroundCheck = defenseBackgroundCheck;
      }

      // Sorting - map sortOrder to 1 or -1
      const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
      const sortOptions: Record<string, number> = {
        [sortBy]: sortDirection,
      };

      // 🔥 Updated query with populate
      const [candidates, total] = await Promise.all([
        this.candidateRepository.findWithPagination(
          filter,
          skip,
          limit,
          sortOptions,
          [
            { path: "state", select: "_id name" },
            { path: "city", select: "_id name" },
          ],
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

  public getCandidateById = async (id: string | null) => {
    try {
      if (!id) throw new Error(ResultErrorMessage.UserIdIsRequired);
      let candidateDoc = await this.candidateRepository.findById(id);

      if (!candidateDoc) {
        throw new Error(ResultErrorMessage.CandidateNotFound);
      }

      // Populate state and city on the retrieved document
      candidateDoc = await candidateDoc.populate({
        path: "state",
        select: "name",
      });
      candidateDoc = await candidateDoc.populate({
        path: "city",
        select: "name",
      });

      return new Response(
        JSON.stringify({ success: true, data: candidateDoc }),
        {
          status: StatusCodes.OK,
          headers: { "Content-Type": "application/json" },
        },
      );
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
