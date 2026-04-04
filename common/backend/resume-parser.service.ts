import mammoth from "mammoth";

export default class ResumeParser {
  public static async parseText(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    try {
      if (mimeType === "application/pdf") {
        const { default: pdfParse } =
          await import("pdf-parse/lib/pdf-parse.js");
        const data = await pdfParse(fileBuffer);
        return data?.text || "";
      } else if (
        mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result?.value || "";
      }
    } catch (err) {
      console.warn("Failed to parse file:", err);
      return "";
    }

    return "";
  }

  public static extractEmail(text: string): string {
    // Match emails, including ones split across lines or with surrounding whitespace
    const normalized = text.replace(/[\r\n]+/g, " ");
    const match = normalized.match(
      /\b[A-Z0-9](?:[A-Z0-9._%+-]*[A-Z0-9])?@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}\b/i,
    );
    if (!match) return "";
    const email = match[0].toLowerCase().trim();
    // Reject obvious non-emails (e.g., version numbers that accidentally match)
    if (email.endsWith(".") || email.startsWith(".")) return "";
    return email;
  }

  public static extractPhone(text: string): string {
    const normalized = text.replace(/[\r\n]+/g, " ");
    // Ordered from most specific to least specific
    const phonePatterns = [
      // International: +91-9876543210, +1 (234) 567-8901, +44 20 7946 0958
      /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{0,4}/,
      // With country code no plus: 91-9876543210
      /\b\d{1,3}[-.\s]\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/,
      // US/India style: (234) 567-8901 or 9876543210
      /\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/,
      // 10-digit continuous: 9876543210
      /\b\d{10,13}\b/,
    ];

    for (const pattern of phonePatterns) {
      const match = normalized.match(pattern);
      if (match) {
        const phone = match[0].trim();
        // Must have at least 7 digits to be a real phone number
        const digitCount = phone.replace(/\D/g, "").length;
        if (digitCount >= 7 && digitCount <= 15) return phone;
      }
    }
    return "";
  }

  public static extractName(text: string): string {
    const lines = text
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    // 1) Check for explicit "Name:" label first (most reliable)
    for (const line of lines) {
      const labelMatch = line.match(/^name\s*[:\-–]\s*(.+)/i);
      if (labelMatch) {
        const nameVal = labelMatch[1].trim();
        // Make sure it's not "Father's Name:" or similar
        if (!/father|mother|spouse|husband|wife/i.test(line)) {
          return this.titleCase(nameVal);
        }
      }
    }

    // 2) Heuristic: scan lines for a likely name
    const skipPatterns =
      /^(curriculum vitae|resume|cv|objective|summary|profile|contact|address|phone|email|mobile|tel|educational|experience|internship|skills|hobbies|signature|declaration|strengths|languages)/i;
    const emailPattern = /\S+@\S+/;
    const phonePattern = /(\+?\d[\d\s.()\-]{6,})/;
    const urlPattern = /https?:\/\/|www\.|linkedin\.com|github\.com/i;
    const labelledLinePattern = /^(father'?s?\s*name|mother'?s?\s*name|spouse|husband|wife|address|phone|email|mobile|date of birth|dob|marital status|nationality|gender|sex|designation|duration|department|work|qualification)\s*[:\-–]/i;

    // Date patterns
    const months = "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec";
    const datePattern = new RegExp(
      `(\\b(${months})\\b|\\b\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{2,4}\\b|\\b\\d{4}\\s*[-–—]\\s*(\\d{4}|present|current|till date)|currently working)`,
      "i",
    );
    const junkPattern = /^[\d%\s/\-.,;:|]+$/;

    for (const line of lines) {
      if (junkPattern.test(line)) continue;
      if (datePattern.test(line)) continue;
      if (skipPatterns.test(line)) continue;
      if (labelledLinePattern.test(line)) continue;
      if (emailPattern.test(line)) continue;
      if (phonePattern.test(line) && line.replace(/[\d\s+.()\-]/g, "").length < 3) continue;
      if (urlPattern.test(line)) continue;
      if (/\b(s\/o|d\/o|w\/o|c\/o|vpo|tehsil|district|pin\s*code|colony|nagar|street|sector)\b/i.test(line)) continue;

      // Clean the line
      const cleaned = line.replace(/[^a-zA-Z\s.\-']/g, "").trim();
      const nameOnly = cleaned.replace(/^[\s.\-]+|[\s.\-]+$/g, "").trim();

      const words = nameOnly.split(/\s+/).filter((w) => /^[a-zA-Z'.\-]+$/.test(w) && w.length > 0);
      if (words.length >= 2 && words.length <= 5 && nameOnly.length >= 3 && nameOnly.length <= 60) {
        if (/^[A-Z]/i.test(words[0])) {
          return this.titleCase(nameOnly);
        }
      }
    }

    return lines.length ? lines[0] : "";
  }

  private static titleCase(name: string): string {
    return name
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .map((w) =>
        w.length > 1
          ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          : w.toUpperCase(),
      )
      .join(" ");
  }

  public static extractSkills(text: string): string[] {
    const allSkills: string[] = [];

    // Section headers to look for (ordered: most specific first, "skills" last)
    const sectionHeaders = [
      "it skill set",
      "technical skill set",
      "skill set",
      "technical skills",
      "it skills",
      "key skills",
      "core competencies",
      "skills & expertise",
      "skills and expertise",
      "professional skills",
      "skills summary",
      "areas of expertise",
      "competencies",
      "technologies",
      "tools & technologies",
      "tools and technologies",
      "tech stack",
      "skills",
    ];

    // Section end boundaries
    const endBoundaries =
      "experience|education|projects|work history|employment|certifications|certification|publications|awards|references|hobbies|interests|objective|summary|profile|personal details|declaration|languages|languages known|strengths|signature|internship|achievements|extracurricular|co-curricular";

    const headerPattern = new RegExp(
      `(?:^|\\n)\\s*(?:${sectionHeaders.join("|")})\\s*[:\\-–]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:${endBoundaries})\\s*[:\\-–\\n]|$)`,
      "im",
    );

    const match = text.match(headerPattern);
    if (match) {
      allSkills.push(...this.splitSkills(match[1]));
    }

    // Also extract from inline patterns: "Tools used: X, Y, Z" / "Operating systems: X, Y"
    const inlinePatterns = [
      /tools\s*(?:used|&\s*technologies)?\s*:\s*(.+)/gi,
      /(?:operating\s*systems?|os|platforms?|languages?|frameworks?|databases?)\s*:\s*(.+)/gi,
    ];

    for (const pattern of inlinePatterns) {
      let inlineMatch;
      while ((inlineMatch = pattern.exec(text)) !== null) {
        const captured = inlineMatch[1] || inlineMatch[2] || "";
        allSkills.push(...this.splitSkills(captured));
      }
    }

    // Fallback: colon-based skills line
    if (allSkills.length === 0) {
      const colonMatch = text.match(
        /(?:skills|technologies)\s*:\s*(.+)/i,
      );
      if (colonMatch) {
        allSkills.push(...this.splitSkills(colonMatch[1]));
      }
    }

    return [...new Set(allSkills)];
  }

  private static splitSkills(skillsText: string): string[] {
    // Normalize whitespace
    const normalized = skillsText.replace(/[\r\n]+/g, "\n");

    // Split by common delimiters: comma, pipe, bullet, semicolon, tabs, newlines
    const rawSkills = normalized.split(/[,•·|;\t\n●▪►◆–—]/);
    return rawSkills
      .map((s) => s.trim())
      // Remove surrounding colons, dashes, dots
      .map((s) => s.replace(/^[\s:.\-–—]+|[\s:.\-–—]+$/g, "").trim())
      // Keep skills with reasonable length (2–60 chars)
      .filter((s) => s.length >= 2 && s.length <= 60)
      // Remove entries that are obviously not skills (full sentences)
      .filter((s) => {
        const wordCount = s.split(/\s+/).length;
        return wordCount <= 6;
      })
      // Must contain at least one letter
      .filter((s) => /[a-zA-Z]/.test(s))
      // Remove lines that are just junk (%, numbers only, dates)
      .filter((s) => !/^[\d%\s/\-.,]+$/.test(s));
  }

  public static extractGender(text: string): "Male" | "Female" | "" {
    // Look for explicit gender declarations near common labels
    const normalized = text.replace(/[\r\n]+/g, " ");

    // Check for explicit label patterns first (most reliable)
    const explicitPatterns = [
      { regex: /\b(?:gender|sex)\s*[:\-–]\s*(male|female)\b/i, capture: true },
      { regex: /\b(male|female)\s*(?:gender|sex)\b/i, capture: true },
      { regex: /\bgender\s*[:\-–]?\s*[(\[]?\s*(male|female|m|f)\s*[)\]]?\b/i, capture: true },
      { regex: /\bsex\s*[:\-–]?\s*[(\[]?\s*(male|female|m|f)\s*[)\]]?\b/i, capture: true },
    ];

    for (const { regex } of explicitPatterns) {
      const match = normalized.match(regex);
      if (match && match[1]) {
        const val = match[1].toLowerCase();
        if (val === "male" || val === "m") return "Male";
        if (val === "female" || val === "f") return "Female";
      }
    }

    // Check for salutation-based hints (Mr./Mrs./Ms.)
    const lines = text.split(/[\r\n]+/).slice(0, 10); // Only check top of resume
    const topText = lines.join(" ");
    if (/\b(Mr\.?|Shri)\b/.test(topText)) return "Male";
    if (/\b(Mrs\.?|Ms\.?|Miss|Smt\.?)\b/.test(topText)) return "Female";

    return "";
  }
}
