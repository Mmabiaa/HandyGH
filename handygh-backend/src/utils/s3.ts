import AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';
import envConfig from '../config/env.config';

const s3 = new S3({
  accessKeyId: envConfig.S3_ACCESS_KEY,
  secretAccessKey: envConfig.S3_SECRET_KEY,
  region: envConfig.S3_REGION,
});

export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
  const params = {
    Bucket: envConfig.S3_BUCKET,
    Key: `${folder}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  const params = {
    Bucket: envConfig.S3_BUCKET,
    Key: filePath,
  };

  await s3.deleteObject(params).promise();
};

export const getFileUrl = (filePath: string): string => {
  return `https://${envConfig.S3_BUCKET}.s3.${envConfig.S3_REGION}.amazonaws.com/${filePath}`;
};