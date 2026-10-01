import { Router } from 'express';
import { destroyCategory, listCategories, showCategory, storeCategory, updateCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', listCategories);
router.get('/:id', showCategory);
router.post('/', storeCategory);
router.put('/:id', updateCategory);
router.delete('/:id', destroyCategory);

export default router;
