import express from "express";
import products from './api/ProductManager.js';
import { __dirname } from './utils.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';

const PORT = 3000;
const WS_PORT = 3050;

const server = express();
const httpServer = server.listen(WS_PORT, () => {
    console.log(`Servidor socketio iniciado en puerto ${WS_PORT}`);
});
const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" }});


server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/api', products);

server.use('/public', express.static(`${__dirname}/public`));

server.engine('handlebars', engine());
server.set('view engine', 'handlebars');
server.set('views', './views');

server.listen(PORT, () => {
    console.log(`Servidor base API / static iniciado en puerto ${PORT}`);
});


io.on('connection', (socket) => { 
    console.log(`Cliente conectado (${socket.id})`);
    
    socket.emit('server_confirm', 'Conexión recibida');
    
    socket.on("disconnect", (reason) => {
        console.log(`Cliente desconectado (${socket.id}): ${reason}`);
    });
    
    socket.on('event_cl01', (data) => {
        console.log(data);
    });
    // Listener para agregar producto
    socket.on('addProduct', async (product) => {
        await Products.addProduct(product);
        const products = await Products.getProducts();
        io.of('/realtimeproducts').emit('productListUpdated', products);
    });

    // Listener para borrar producto
    socket.on('deleteProduct', async (productId) => {
        await Products.deleteProduct(productId);
        const products = await Products.getProducts();
        io.of('/realtimeproducts').emit('productListUpdated', products);
    });
});
