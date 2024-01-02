const Product = require('../models/Product');

module.exports.createProduct = (req, res) =>{
    const {name, description, price, isActive} = req.body;
    return Product.findOne({name: {$regex: new RegExp(req.body.name, 'i')}})
    .then((result)=>{
        if(result){
            res.status(403).send({message: 'Duplicated product name found.'})
        } else {
            let newProduct = new Product({
                name: name,
                description: description,
                price: price,
                isActive: isActive
            })
            return newProduct.save()
            .then((savedProduct, err) => {
                if(err){
                    return res.status(400).send({message: 'Product not saved'});
                } else {
                    return res.status(200).send({message: savedProduct})
                }
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).send({ message: 'Internal server error.' });
              });
        }
    })
    .catch((error) => {
		console.error(error);
		return res.status(500).send({ message: 'Internal server error.' });
	  });
};

module.exports.getAllProducts = (req, res) =>{
    return Product.find({})
    .then((result)=>{
        if(!result){
            return res.status(404).send({message: 'No products found'})
        } else {
            return res.status(200).send({products: result})
        }
    })
    .catch((error) => {
		console.error(error);
		return res.status(500).send({ message: 'Internal server error.' });
	  });
}

module.exports.getAllActiveProducts = (req, res) =>{
    return Product.find({isActive: true})
    .then((result)=>{
        if(!result){
            return res.status(404).send({message: 'No products found'})
        } else {
            return res.status(200).send({products: result})
        }
    })
    .catch((error) => {
		console.error(error);
		return res.status(500).send({ message: 'Internal server error.' });
	  });
};

module.exports.getProduct = (req, res) =>{
    return Product.findById(req.params.productId)
    .then((result)=>{
        if(!result || result == null){
           return res.status(404).send({message: 'No products found'})
        } else {
            return res.status(200).send({products: result})
        }
    })
    .catch((error) => {
		console.error(error);
		return res.status(404).send({ message: 'Product does not exist' });
	  });
};

module.exports.updateProductInfo = (req, res) => {
    return Product.findById(req.params.productId)
    .then((result)=>{
        if(!result){
            return res.status(400).send({message: 'No product found'})
        } else {
            return Product.findByIdAndUpdate(req.params.productId, {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                isActive: req.body.isActive,
                new: true
            })
            .then((updatedProduct)=>{
                if(!updatedProduct){
                    return res.status(400).send({message: `Error updating product ${updatedProduct.id}`})
                } else {
                    return res.status(200).send({message: `Successfully updated product ${updatedProduct.id}`})
                }
            })
        };
    });
};

module.exports.archiveProduct = (req, res) => {
    return Product.findById(req.params.productId)
    .then((result)=>{
        if (result.isActive == false){
            res.status(403).send({message: 'Product is already archived'})
        } else {
            return Product.findByIdAndUpdate(req.params.productId, {
                isActive: false, 
                new: true
            })
            .then((archivedProduct)=>{
                if(!archivedProduct){
                    return res.status(400).send({message: 'Error archiving product'})
                } else {
                    return res.status(200).send({message: 'Successfully archived product'})
                }
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).send({ message: 'Internal server error' });
              });
        }
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error' });
      });
};

module.exports.activateProduct = (req, res) => {
    return Product.findById(req.params.productId)
    .then((result)=>{
        if (result.isActive == true){
            res.status(403).send({message: 'Product is already activated'})
        } else {
            return Product.findByIdAndUpdate(req.params.productId, {isActive: true, new: true})
            .then((activatedProduct)=>{
                if(!activatedProduct){
                    return res.status(400).send({message: 'Error activating product'})
                } else {
                    return res.status(200).send({message: 'Successfully activated product'})
                }
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).send({ message: 'Internal server error' });
              });
        }
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error' });
      });
};

module.exports.searchProductByName = (req, res) => {
    console.log('test');
    const productName = req.body.name;

    if (!productName) {
        return res.status(400).send({ message: 'Product name is required in the request body' });
    }

    Product.findOne({ name: { $regex: new RegExp(productName, 'i') } })
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: 'No product found' });
            } else {
                return res.status(200).send({ product: result });
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).send({ message: 'Internal server error.' });
        });
};


module.exports.searchProductByPriceRange = (req, res) => {
    console.log('Test');
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;

    Product.find({ price: { $gte: minPrice, $lte: maxPrice } })
        .then((results) => {
            if (!results || results.length === 0) {
                return res.status(404).send({ message: 'No products found in the specified price range' });
            } else {
                return res.status(200).send({ products: results });
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).send({ message: 'Internal server error.' + error });
        });
};