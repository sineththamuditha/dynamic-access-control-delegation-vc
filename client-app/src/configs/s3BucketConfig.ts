import AWS from 'aws-sdk';
import { CONFIG } from '../constants';

export const s3Client = new AWS.S3({
    region: CONFIG.S3_BUCKET_CONFIG.region,
    credentials: CONFIG.S3_BUCKET_CONFIG.credentials
})