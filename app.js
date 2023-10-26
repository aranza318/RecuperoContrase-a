import express from "express";
import Handlebars from "handlebars";
import expressHandlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import cartsRouter from "./src/routes/cart.routes.js";
import productsRouter from "./src/routes/product.routes.js";
import serviceRouter from "./src/routes/sessions.routes.js";
import viewsRouter from "./src/routes/views.routes.js";
import emailRouter from "./src/routes/email.routes.js";
import smsRouter from "./src/routes/sms.router.js";
import mockingRouter from "./src/moking/mock.router.js";
import logRouter from "./src/routes/log.routes.js";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import initializePassport from "./src/midsIngreso/passport.js"
import initializeGitHubPassport from "./src/midsIngreso/github.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import { MONGODB_CNX_STR, PORT, SECRET_SESSIONS} from "./src/config/configs.js"
import "./src/dao/dbConfig.js"
import Logger from "./src/config/logger.js";

const log = new Logger();
const app = express();

//Server
const httpServer = app.listen(PORT, () => {log.logger.info(`conectado a ${PORT}`)})
export const socketServer = new Server(httpServer);

//Socket Server
app.set("socketServer", socketServer);

//Engine, rutas y mids
app.engine(
  "handlebars",
  expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname));
app.use(cors({
  credentials:true,
  method: ["GET", "POST", "PUT", "DELETE"]
}))
app.use(cookieParser());

app.use(session({
  store: new MongoStore({
      mongoUrl: MONGODB_CNX_STR,
      collectionName:"sessions"
  }),
  secret: SECRET_SESSIONS,
  resave: false,
  saveUninitialized: false,
  cookie: {secure:false}
}))
initializeGitHubPassport();    initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname+"/src/public"));
app.use("/images", express.static(__dirname+ "/src/public/images"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(log.addLogger);
app.use(morgan('dev'))
app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/api/sessions/", serviceRouter);
app.use("/api/email", emailRouter);
app.use("/api/sms", smsRouter);
app.use('/mockingproducts', mockingRouter);
app.use("/", viewsRouter);
app.use('/loggerTest', logRouter)


//Managers
import ProductManager from "./src/dao/ProductManager.js";
const PM = new ProductManager();

import MessagesManager from "./src/dao/messagesmanager.js";
const MM = new MessagesManager();

import CartManager from "./src/dao/cartManager.js";
const CM = new CartManager();


//Sockets on 
socketServer.on("connection", async (socket) => {
  log.logger.info("Un cliente se ha conectado");

  const allProducts = await PM.getProducts();
  socket.emit("initial_products", allProducts);

  socket.on("addProduct", async(obj)=>{
    await PM.addProduct(obj);
    const listadeproductos = await PM.getProductsViews();
    socketServer.emit("envioDeProductos", listadeproductos);    
});

  socket.on("deleteProduct",async(id)=>{
    log.logger.info(id);
    const listadeproductos=await PM.getProductsViews();
    
    await PM.deleteProduct(id);
    
    socketServer.emit("envioDeProducts", listadeproductos);
    });

  socket.on("eliminarProducto", (data)=>{
    PM.deleteProduct(parseInt(data));
    const listadeproductos = PM.getProducts();
    socketServer.emit("envioDeProducts", listadeproductos);
  });

  socket.on("nuevoUsuario",(usuario)=>{
    log.logger.info("usuario", usuario);
    socket.broadcast.emit("broadcast", usuario);
    });

  socket.on("disconnect", ()=>{
    log.logger.info("Usuario desconectado");
    });

  socket.on("mensaje", async (info) =>{
    log.logger.info(info);
    await MM.createMessage(info);
    socketServer.emit("chat", await MM.getMessages());
});
});



