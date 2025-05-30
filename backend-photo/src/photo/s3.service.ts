import { Injectable } from '@nestjs/common';
import { s3Client } from '../config/config';
import {
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const BUCKET_NAME = 'photo-bucket';
const S3_BASE_URL = 'http://localhost:9000';

@Injectable()
export class S3Service {
  private bucketEnsured = false;

  async ensureBucketExists() {
    if (this.bucketEnsured) return;

    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    } catch (err: any) {
      if (err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound') {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`✅ Bucket "${BUCKET_NAME}" created`);
      } else {
        console.error('❌ Failed to ensure bucket:', err);
        throw err;
      }
    }

    this.bucketEnsured = true;
  }

  async uploadPhoto(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
    await this.ensureBucketExists();

    const safeFilename = filename.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
    const key = `${randomUUID()}-${safeFilename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return `${S3_BASE_URL}/${BUCKET_NAME}/${encodeURIComponent(key)}`;
  }
}
