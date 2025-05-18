import express, { Request, Response } from "express";
import multer from "multer";
import s3 from "../utils/s3";
import { NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../interfaces/auth.interface";
import { logger } from "../utils/logger";


const router = express.Router();

const extractKeyFromUrl = (url: string): string | null => {
    const regex = /https:\/\/([^\/]+)\/(.*)/;
    const match = url.match(regex);
    return match ? match[2] : null; // Return the key if matched
};

const checkIfFileExists = async (key: string): Promise<boolean> => {
    try {
        await s3.headObject({
            Bucket: process.env.S3_BUKETNAME as string,
            Key: key,
        }).promise();
        return true; // The file exists
    } catch (error: any) {
        logger.error(`Error: ${error}`);
        if (error.code === "NotFound") {
            return false; // The file does not exist
        }
        throw error;
    }
};

interface AuthenticatedRequest extends Request {
    user?: { _id: string };
    file?: Express.Multer.File;
}

const uploadImg: RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        // if (!userId) {
        //     res.status(404).json({ message: "User Not Found" });
        //     return;
        // }
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const file = req.file;
        const fileName = `images/${Date.now()}-${file.originalname.replace(/\s/g, "-")}`;

        if (req?.query?.oldImageUrl) {
            const oldFileKey = extractKeyFromUrl(req.query.oldImageUrl as string);
            if (oldFileKey) {
                const fileExists = await checkIfFileExists(oldFileKey);
                if (fileExists) {
                    await s3.deleteObject({
                        Bucket: process.env.S3_BUKETNAME as string,
                        Key: oldFileKey,
                    }).promise();
                }
            }
        };

        const params = {
            Bucket: process.env.S3_BUKETNAME as string,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        };

        const uploadResult = await s3.upload(params).promise();
        res.status(200).json({
            message: "Profile image uploaded successfully",
            fileUrl: uploadResult.Location,
        });
    } catch (error) {
        logger.error("Upload Error:", error);
        next(error); // Pass error to Express error handler
    }
};

const deleteImg: RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            res.status(400).json({ message: "File URL is required" });
            return;
        }
        const fileKey = fileUrl.split(".com/")[1]; // Adjust if your S3 URL format is different

        const params = {
            Bucket: process.env.S3_BUKETNAME as string,
            Key: fileKey,
        };

        await s3.deleteObject(params).promise();

        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        logger.error("Delete Error:", error);
        next(error); // Pass error to Express error handler
    }
};
router.post("/remove/img", deleteImg);
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

router.post("/img",upload.single("image"), uploadImg);

export default router;