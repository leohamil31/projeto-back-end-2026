import { Router } from 'express';
import { listKitchenOrders, listTableOrders } from '../controllers/kitchenController';

const router = Router();

router.get('/', listKitchenOrders);
router.get('/table/:tableNumber', listTableOrders);

export default router;
