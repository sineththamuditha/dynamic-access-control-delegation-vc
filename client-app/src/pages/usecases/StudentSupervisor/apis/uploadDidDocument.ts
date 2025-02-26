import { DIDDocument } from "did-resolver";
import { s3Client } from "../../../../configs/s3BucketConfig";
import { CONFIG } from "../../../../constants";

export const uploadDidDocument = async (owner:string, didDocument: DIDDocument) => {

    const params = {
        Bucket: CONFIG.S3_BUCKET_NAME,
        Key: owner + "/did.json",
        Body: JSON.stringify(didDocument),
        ContentType: "application/json"
    };

    return new Promise((resolve, reject) => {
        s3Client.upload(params, (err, data) => {
            if (err) {
                console.log("Upload failed", err);
                reject(err);  // Reject the promise if there's an error
            } else {
                console.log("Did document uploaded successfully");
                resolve(data);  // Resolve the promise on success
            }
        });
    });
}