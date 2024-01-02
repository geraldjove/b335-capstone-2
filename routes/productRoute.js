const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../auth');
const { verify , verifyAdmin } = auth;

router.post('/', verify, verifyAdmin ,productController.createProduct);
router.get('/all', verify, verifyAdmin, productController.getAllProducts);
router.get('/', productController.getAllActiveProducts)
router.get('/searchByName', productController.searchProductByName);
router.get('/searchByPrice', productController.searchProductByPriceRange);
router.get('/:productId', productController.getProduct);
router.patch('/:productId/update', verify, verifyAdmin, productController.updateProductInfo);
router.patch('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);
router.patch('/:productId/activate', verify, verifyAdmin, productController.activateProduct);



module.exports = router;