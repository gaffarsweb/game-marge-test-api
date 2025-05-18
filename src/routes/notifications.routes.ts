import { Router } from 'express';
import notificationController from '../controllers/notifications.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRole';


const router = Router();

router.post("/create",authenticateRequest,authorizeRoles(['superAdmin','admin']), notificationController.createNotification);
router.get("/", authenticateRequest,notificationController.getNotifications);
router.get("/:id",authenticateRequest, notificationController.getNotificationById);
router.delete("/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), notificationController.deleteNotification);
router.post("/update/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), notificationController.updateNotificaton);
router.get("/get/unread-count", authenticateRequest,notificationController.getUnreadCount);
router.patch("/mark-all-as-read",authenticateRequest ,notificationController.markAllAsRead);


export default router;

