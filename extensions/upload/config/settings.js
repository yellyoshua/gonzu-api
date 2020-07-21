const s3_config = {
  provider: 'aws-s3',
  providerOptions: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    params: {
      Bucket: process.env.S3_BUCKET
    }
  }
};

const development = {};

module.exports = process.env.NODE_ENV === 'production' ? s3_config : development;
