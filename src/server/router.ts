import {Router, Request, Response} from "express";
import * as express from 'express';
import path = require("path");
const router = Router();

router.get('/', (req:Request, res: Response)=> {
    res.sendFile(path.join(__dirname,'..','..','client','index.html'))
});

router.use('/client', express.static(path.join(__dirname,'..','..','client')));


export default router;