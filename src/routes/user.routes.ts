import { Router, Request } from "express";
import userController from "../controllers/user.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import multer, { FileFilterCallback } from "multer";
import { getAllUsers, updateUserProfileValidation } from "../middlewares/validations/user.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { RequestHandler } from "express";
import s3 from "../utils/s3";
import { CustomRequest } from "../interfaces/auth.interface";
import userModel from "../models/user.model";
import { logger } from "../utils/logger";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

const extractKeyFromUrl = (url: string): string | null => {
  const regex = /https:\/\/([^\/]+)\/(.*)/;
  const match = url.match(regex);
  return match ? match[2] : null;
};

const checkIfFileExists = async (key: string): Promise<boolean> => {
  try {
      await s3.headObject({
          Bucket: process.env.S3_BUKETNAME as string,
          Key: key,
      }).promise();
      return true;
  } catch (error: any) {
      if (error.code === "NotFound") {
          return false;
      }
      throw error;
  }
};

const uploadImage: RequestHandler = async (req: CustomRequest, res, next) => {
  try {
      const userId = req.user?.id;
      if (!userId) {
          res.status(404).json({ message: "User Not Found" });
          return;
      }

      if (!req.file) {
          res.status(400).json({ message: "No file uploaded" });
          return;
      }

      const file = req.file;
      const fileName = `images/${Date.now()}-${file.originalname.replace(/\s/g, "-")}`;

      if (req.query.oldImageUrl) {
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
      }

      const params = {
          Bucket: process.env.S3_BUKETNAME as string,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
      };

      const uploadResult = await s3.upload(params).promise();
      
      // Update user profile picture
      await userModel.findByIdAndUpdate(userId, { avatarUrl: uploadResult.Location });
      
      res.status(200).json({
          message: "Profile image updated successfully",
          avatarUrl: uploadResult.Location,
      });
  } catch (error) {
    logger.error("Upload Error:", error);
      next(error);
  }
};

const storage = multer.memoryStorage(); // Use memory storage for file uploads

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

router.patch("/update/profile-image", authenticateRequest, upload.single("image"), uploadImage);
router.put(
  "/update/profile",
  authenticateRequest,
  updateUserProfileValidation,
  validateRequest,
  userController.updateUserProfile
);
router.put(
  "/update/status/",
  // authenticateRequest,
  // updateUserProfileValidation,
  // validateRequest,
  userController.updateUserStatus
);

router.delete("/:id", authenticateRequest,authorizeRoles(['superAdmin','admin']) ,userController.deleteUser);
router.get("/get/:id", authenticateRequest, userController.getUserById);
router.get("/get-all", authenticateRequest,authorizeRoles(['admin','superAdmin']) ,userController.getUsers);
router.get("/referred/:referralCode", authenticateRequest, userController.getAllReferredUsers);
// get admin users for superadmin
router.get("/get-sub-admins", authenticateRequest,authorizeRoles(['admin','superAdmin']) ,userController.getAllAdmins);
// router.get("/wallet",authenticateRequest, userController.getWalletDetails);
// router.get("/networks",authenticateRequest, userController.getNetwork);
// router.get("/coins",authenticateRequest, userController.getTokens);
export default router;
