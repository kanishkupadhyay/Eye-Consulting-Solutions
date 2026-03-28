import AWS from "aws-sdk";

export default class S3Uploader {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION!,
      endpoint: "http://localhost:4566",
      s3ForcePathStyle: true, // needed for LocalStack
    });
  }

  public async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `resumes/${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }
}