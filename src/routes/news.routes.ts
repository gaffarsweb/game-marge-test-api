import { Router } from 'express';
import newsController from '../controllers/news.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRole';


const router = Router();

router.post("/create",authenticateRequest,authorizeRoles(['superAdmin','admin']), newsController.createItem);
router.get("/", newsController.getItems);
router.get("/:id", newsController.getNewsById);
router.delete("/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), newsController.deleteItem);
router.post("/update/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), newsController.updateItem);


export default router;

