import { Router } from 'express';
import newsController from '../controllers/news.controller';


const router = Router();

router.post("/create", newsController.createItem);
router.get("/", newsController.getItems);
router.get("/:id", newsController.getNewsById);
router.delete("/:id", newsController.deleteItem);
router.post("/update/:id", newsController.updateItem);


export default router;

