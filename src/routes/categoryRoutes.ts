import { Router } from 'express';
import { listCategories, storeCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', listCategories);
router.post('/', storeCategory);

export default router;
