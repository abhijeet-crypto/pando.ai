import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: 'http://localhost:9000', // Fake S3 like MinIO
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minio',
    secretAccessKey: 'minio123',
  },
  forcePathStyle: true,
});
