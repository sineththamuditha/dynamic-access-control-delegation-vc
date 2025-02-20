import { DIDDocument } from "did-resolver";
import { s3Client } from "../../../../configs/s3BucketConfig";
import { CONFIG } from "../../../../constants";

export const uploadDidDocument = (owner:string, didDocument: DIDDocument) => {

    s3Client.upload({
        Bucket: CONFIG.S3_BUCKET_NAME,
        Key: owner + "/did.json",
        Body: JSON.stringify(didDocument),
        ContentType: "application/json"
    }, (err, data) => {

        if (err) {
            console.log("Upload failed", err)
        }

        if (data) {
            console.log("Did document uploaded successfully")
        }
    });
}