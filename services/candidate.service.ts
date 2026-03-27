import AWS from "aws-sdk";
import mammoth from "mammoth";
import Candidate from "@/models/candidate.model";
import { NextResponse } from "next/server";
import ResultErrorMessage from "@/common/backend/error.message";
import StatusCodes from "@/common/backend/status-codes";

export default class CandidateService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION!,
    });
  }

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

    const results: Array<Record<string, unknown>> = [];

    for (const file of uploadedFiles) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const text = await this.parseTextFromFile(fileBuffer, file.type);

      const candidateData = {
        name: this.extractName(text),
        email: this.extractEmail(text),
        phone: this.extractPhone(text),
        gender: this.extractGender(text),
        skills: this.extractSkills(text),
        education: this.extractEducation(text),
        workExperience: this.extractWorkExperience(text),
        certifications: this.extractCertifications(text),
        previousCompanies: this.extractPreviousCompanies(text),
        totalExperienceYears: 0, // will calculate next
        resumeUrl: "",
      };

      // Compute total experience
      candidateData.totalExperienceYears = this.computeTotalExperience(
        candidateData.workExperience,
      );

      // const s3Params = {
      //   Bucket: process.env.AWS_S3_BUCKET!,
      //   Key: `resumes/${Date.now()}-${file.name}`,
      //   Body: fileBuffer,
      //   ContentType: file.type,
      // };
      // const uploadResult = await this.s3.upload(s3Params).promise();
      // candidateData.resumeUrl = uploadResult.Location;

      const candidate = new Candidate(candidateData);
      await candidate.save();

      results.push(candidateData);
    }

    return NextResponse.json({ success: true, data: results });
  };

  private parseTextFromFile = async (fileBuffer: Buffer, mimeType: string) => {
    if (mimeType === "application/pdf") {
      const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      return "";
    }
  };

  // Simple parsers
  private extractEmail = (text: string) => {
    const match = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
    return match ? match[0] : "";
  };

  private extractPhone = (text: string) => {
    const match = text.match(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
    );
    return match ? match[0] : "";
  };

  private extractName = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length ? lines[0] : "";
  };

  private extractSkills = (text: string) => {
    const skillsSectionRegex =
      /(skills|technical skills|key skills|core competencies)([\s\S]*?)(\n\n|\r\n\r\n|experience|education|projects|$)/i;

    const match = text.match(skillsSectionRegex);

    let skillsText = "";

    if (match) {
      skillsText = match[2];
    } else {
      // fallback: use full text if no section found
      skillsText = text;
    }

    // Split by common separators
    const rawSkills = skillsText.split(/[\n,•|]/);

    const cleanedSkills = rawSkills
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 2 && skill.length < 50)
      .map((skill) => skill.replace(/[^a-zA-Z0-9+#.]/g, "")) // clean junk
      .filter(Boolean);

    // Remove duplicates
    return [...new Set(cleanedSkills)];
  };

  private extractEducation = (text: string) => {
    const educationRegex =
      /(education|academic background|qualifications)([\s\S]*?)(\n\n|\r\n\r\n|experience|skills|certifications|projects|$)/i;

    const match = text.match(educationRegex);
    if (!match) return [];

    const lines = match[2].split(/[\n•,-]/).map((l) => l.trim());
    return lines.filter((line) => line.length > 2);
  };

  private extractWorkExperience = (text: string) => {
    const experienceRegex =
      /(experience|professional experience|work experience|employment history)([\s\S]*?)(\n\n|\r\n\r\n|education|skills|projects|$)/i;

    const match = text.match(experienceRegex);
    if (!match) return [];

    const lines = match[2].split(/[\n•,-]/).map((l) => l.trim());
    return lines.filter((line) => line.length > 2);
  };

  private extractCertifications = (text: string) => {
    const certRegex =
      /(certifications|licenses|achievements)([\s\S]*?)(\n\n|\r\n\r\n|experience|education|skills|projects|$)/i;

    const match = text.match(certRegex);
    if (!match) return [];

    const lines = match[2].split(/[\n•,-]/).map((l) => l.trim());
    return lines.filter((line) => line.length > 2);
  };

  private extractPreviousCompanies = (text: string) => {
    const companiesRegex =
      /(experience|employment history|work experience)([\s\S]*?)(\n\n|\r\n\r\n|education|skills|projects|$)/i;

    const match = text.match(companiesRegex);
    if (!match) return [];

    // Try to extract company names from lines (often first word(s) in experience line)
    const lines = match[2]
      .split(/[\n•,-]/)
      .map((l) => l.trim())
      .filter((line) => line.length > 2);

    const companies: string[] = [];
    lines.forEach((line) => {
      const companyMatch = line.match(/at\s+([A-Za-z0-9 &.-]+)/i);
      if (companyMatch) companies.push(companyMatch[1]);
    });

    return [...new Set(companies)];
  };

  private extractGender = (text: string) => {
    const maleRegex = /\b(male|man|he|him)\b/i;
    const femaleRegex = /\b(female|woman|she|her)\b/i;

    if (maleRegex.test(text)) return "Male";
    if (femaleRegex.test(text)) return "Female";
    return ""; // unknown
  };

  // Calculate total experience in years
  private computeTotalExperience = (workExp: string[]) => {
    let totalMonths = 0;

    const dateRegex = /(\b\d{4}\b)(?:\s*-\s*(\b\d{4}\b|Present))/i; // matches "2018-2021" or "2019-Present"

    workExp.forEach((line) => {
      const match = line.match(dateRegex);
      if (match) {
        const startYear = parseInt(match[1]);
        const endYear =
          match[2].toLowerCase() === "present"
            ? new Date().getFullYear()
            : parseInt(match[2]);
        totalMonths += (endYear - startYear) * 12;
      }
    });

    return +(totalMonths / 12).toFixed(1); // years
  };
}
