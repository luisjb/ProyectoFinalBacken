import express from 'express';
import fs  from 'fs';
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();


const CARTS_DB = './carrito.json';
const PRODUCTS_DB = './productos.json';

router.post('/', async (req, res) => {
    try {
        const carrito = {
            id: uuidv4(),
            timestamp: Date.now(),
            products: []
        };
        await fs.writeFile(CARTS_DB, JSON.stringify([carrito]), 'utf-8');
        res.status(201).json(carrito);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const carts = JSON.parse(await fs.readFile(CARTS_DB, 'utf-8'));
        const cart = carts.find((c) => c.id === req.params.cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        const products = await fs.readFile(PRODUCTS_DB, 'utf-8');
        const parsedProducts = JSON.parse(products);
        const cartProducts = cart.products.map((p) => {
            const product = parsedProducts.find((pr) => pr.id === p.id);
            return { ...product, quantity: p.quantity };
        });
        res.json(cartProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const carts = JSON.parse(await fs.readFile(CARTS_DB, 'utf-8'));
        const cart = carts.find((c) => c.id === req.params.cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        const products = JSON.parse(await fs.readFile(PRODUCTS_DB, 'utf-8'));
        const product = products.find((p) => p.id === req.params.pid);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        const existingProduct = cart.products.find((p) => p.id === product.id);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.products.push({ id: product.id, quantity: 1 });
        }
        await fs.writeFile(CARTS_DB, JSON.stringify(carts), 'utf-8');
        res.status(201).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

export default router;