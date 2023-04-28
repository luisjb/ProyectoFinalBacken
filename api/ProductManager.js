import { Router } from "express";
import Products from './products.js';
import { __dirname } from '../utils.js';
import fs from "fs";

const router = Router();
const manager = new Products(`${__dirname}/productos.json`);

const PRODUCTS_DB_FILE = './productos.json';

if (!fs.existsSync(PRODUCTS_DB_FILE)) {
    fs.writeFileSync(PRODUCTS_DB_FILE, '[]');
}

router.get("/", async (req, res) => {
    
    const products = await manager.getProducts();
    res.render('index_products', {
        products: products
    });
    
});

router.get("/:pid", async (req, res) => {
    try{
        const product = await manager.getProductById(req.body);    
        //const products = products.find((p) => p.id === parseInt(req.params.pid));
        if (product) {
            res.json(product);
        } else {
            res.status(404).send("Product not found");
        }
        res.status(200).send({ status: 'OK', data: products });
    }catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

router.post("/", async (req, res) => {
    try {
        await manager.addProduct(req.body);

        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

router.put("/:pid", async (req, res) => {
    try {
        const { id, field, data } = req.body;
        await manager.updateProduct(id, field, data);
    
        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

router.delete("/:pid", async (req, res) => {
    try {
        await manager.deleteProduct(req.body.id);
    
        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

export default router;