const { fromEnv } = require("@aws-sdk/credential-providers");
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const awsCredentials = {
    region: process.env.S3_REGION || "us-east-2",
    credentials: fromEnv(),
};

exports.invalidateCache = async (distributionId, paths) => {
    const cloudFrontClient = new CloudFrontClient(awsCredentials);

    const params = {
        DistributionId: distributionId,
        InvalidationBatch: {
            CallerReference: new Date().getTime().toString(),
            Paths: {
                Quantity: paths.length,
                Items: paths,
            },
        },
    };

    const command = new CreateInvalidationCommand(params);

    try {
        const response = await cloudFrontClient.send(command);
        console.log('Invalidation created:', response.Invalidation.Id);
    } catch (error) {
        console.error('Error creating invalidation:', error);
    }
}