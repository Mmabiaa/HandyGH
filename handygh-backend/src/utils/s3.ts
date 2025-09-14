import AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';
import { s3Config } from '../config/s3.config';

const s3 = new S3({
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region,
});

export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
  const params = {
    Bucket: s3Config.bucketName,
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
    Bucket: s3Config.bucketName,
    Key: filePath,
  };

  await s3.deleteObject(params).promise();
};

export const getFileUrl = (filePath: string): string => {
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${filePath}`;
};