import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import envConfig from '../config/env.config';

const s3 = new S3({
  accessKeyId: envConfig.S3_ACCESS_KEY,
  secretAccessKey: envConfig.S3_SECRET_KEY,
  region: envConfig.S3_REGION,
});

export class FileService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: envConfig.S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    await s3.upload(params).promise();
    return `https://${envConfig.S3_BUCKET}.s3.amazonaws.com/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<void> {
    const params = {
      Bucket: envConfig.S3_BUCKET,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
  }
}