import { S3 } from 'aws-sdk';
import { config } from './env.config';

const s3 = new S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
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
  return `https://${bucket}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;
};