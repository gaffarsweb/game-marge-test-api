import { Router } from 'express';
import notificationController from '../controllers/notifications.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';


const router = Router();

router.post("/create", notificationController.createNotification);
router.get("/", authenticateRequest,notificationController.getNotifications);
router.get("/:id", notificationController.getNotificationById);
router.delete("/:id", notificationController.deleteNotification);
router.post("/update/:id", notificationController.updateNotificaton);
router.get("/get/unread-count", authenticateRequest,notificationController.getUnreadCount);
router.patch("/mark-all-as-read",authenticateRequest ,notificationController.markAllAsRead);


export default router;

