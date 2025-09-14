import { S3 } from 'aws-sdk';
import envConfig from './env.config';

const s3 = new S3({
  accessKeyId: envConfig.S3_ACCESS_KEY,
  secretAccessKey: envConfig.S3_SECRET_KEY,
  region: envConfig.S3_REGION,
});

export const uploadFile = async (file: Express.Multer.File, bucket: string): Promise<S3.ManagedUpload.SendData> => {
  const params = {
    Bucket: bucket,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};

export const getFileUrl = (bucket: string, key: string): string => {
  return `https://${bucket}.s3.${envConfig.S3_REGION}.amazonaws.com/${key}`;
};