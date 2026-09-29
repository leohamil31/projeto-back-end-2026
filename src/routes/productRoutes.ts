import { Router } from 'express';
import { listProducts, showProduct, storeProduct, updateProductController } from '../controllers/productController';

const router = Router();

router.get('/', listProducts);
router.get('/:id', showProduct);
router.post('/', storeProduct);
router.put('/:id', updateProductController);

export default router;
