import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { s3Config } from '../config/s3.config';

const s3 = new S3(s3Config);

export class FileService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: s3Config.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    await s3.upload(params).promise();
    return `https://${s3Config.bucketName}.s3.amazonaws.com/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<void> {
    const params = {
      Bucket: s3Config.bucketName,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
  }
}