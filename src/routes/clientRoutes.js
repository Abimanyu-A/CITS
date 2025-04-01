import express from "express";
import { createClient, deleteClient, getClientById, getClients, updateClient } from "../controllers/clientController.js";
import { authenticate } from "../middleware/authMiddleware.js";


const clientRouter = express.Router();

clientRouter.get("/",authenticate, getClients); 
clientRouter.get("/:id",authenticate, getClientById); 
clientRouter.post("/",authenticate, createClient); 
clientRouter.put("/:id",authenticate, updateClient); 
clientRouter.delete("/:id",authenticate, deleteClient); 

export default clientRouter;
