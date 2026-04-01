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
    const match = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
    return match ? match[0].toLowerCase() : "";
  }

  public static extractPhone(text: string): string {
    const match = text.match(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
    );
    return match ? match[0] : "";
  }

  public static extractName(text: string): string {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length ? lines[0] : "";
  }

  public static extractSkills(text: string): string[] {
    const skillsSectionRegex =
      /(skills|technical skills|key skills|core competencies)([\s\S]*?)(\n\n|\r\n\r\n|experience|education|projects|$)/i;
    const match = text.match(skillsSectionRegex);
    const skillsText = match ? match[2] : text;

    const rawSkills = skillsText.split(/[\n,•|]/);
    const cleanedSkills = rawSkills
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 50)
      .map((s) => s.replace(/[^a-zA-Z0-9+#.]/g, ""))
      .filter(Boolean);

    return [...new Set(cleanedSkills)];
  }

  public static extractGender(text: string): "Male" | "Female" | "" {
    const maleRegex = /\b(male|man|he|him)\b/i;
    const femaleRegex = /\b(female|woman|she|her)\b/i;
    if (maleRegex.test(text)) return "Male";
    if (femaleRegex.test(text)) return "Female";
    return "";
  }
}
