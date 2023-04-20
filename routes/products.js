const express = require("express");
const router = express.Router();
const fs = require("fs");

const PRODUCTS_DB_FILE = './productos.json';

if (!fs.existsSync(PRODUCTS_DB_FILE)) {
    fs.writeFileSync(PRODUCTS_DB_FILE, '[]');
}

router.get("/", (req, res) => {
    let products = JSON.parse(fs.readFileSync(PRODUCTS_DB_FILE));

    const limit = parseInt(req.query.limit);
    if (limit && limit < products.length) {
        products = products.slice(0, limit);
    }

    res.json(products);
});

// GET product by id
router.get("/:pid", (req, res) => {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_DB_FILE));
    const product = products.find((p) => p.id === parseInt(req.params.pid));
    if (product) {
        res.json(product);
    } else {
        res.status(404).send("Product not found");
    }
});

// POST new product
router.post("/", (req, res) => {
    const newProduct = {
        id: Date.now(),
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status || true,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails || [],
    };

    const products = JSON.parse(fs.readFileSync(PRODUCTS_DB_FILE));

    if (products.some((p) => p.code === newProduct.code)) {
        return res.status(409).send("Product with same code already exists");
    }

  // Add new product to list
    products.push(newProduct);

  // Write updated products file
    fs.writeFileSync(PRODUCTS_DB_FILE, JSON.stringify(products));

    res.json(newProduct);
});

// PUT update product by id
router.put("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const products = JSON.parse(fs.readFileSync(PRODUCTS_DB_FILE));

  // Find product with given id
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) {
        return res.status(404).send("Product not found");
    }

  // Update product fields
    const updatedProduct = {
        id: productId,
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails,
    };
    products[index] = updatedProduct;

  // Write updated products file
    fs.writeFileSync(PRODUCTS_DB_FILE, JSON.stringify(products));

    res.json(updatedProduct);
});

// DELETE product by id
router.delete("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const products = JSON.parse(fs.readFileSync(PRODUCTS_DB_FILE));

  // Filter out product with given id
    const filteredProducts = products.filter((p) => p.id !== productId);

  // Check if product was actually deleted
    if (filteredProducts.length === products.length) {
        return res.status(404).send("Product not found");
    }

  // Write updated products file
    fs.writeFileSync(PRODUCTS_DB_FILE, JSON.stringify(filteredProducts));

    res.sendStatus(204);
});

module.exports = router;