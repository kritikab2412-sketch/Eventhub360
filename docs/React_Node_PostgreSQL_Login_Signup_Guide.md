React + Node.js + PostgreSQL Login & Signup Application (Complete Beginner Guide)This tutorial is designed for a student who has never built a full-stack application before.By the end, you will learn:✅ React Frontend

✅ Node.js Backend

✅ Express.js API

✅ PostgreSQL Database

✅ User Registration

✅ User Login

✅ Password Encryption using bcrypt

✅ JWT Authentication

✅ Database Connection

✅ API Testing

ArchitectureFrontend (React)

│

▼

Backend API (Node.js + Express)

│

▼

PostgreSQL Database

Step 1: Install SoftwareInstall Node.jsDownload:

HYPERLINK "https://nodejs.org?utm_source=chatgpt.com" \t "_blank"

Node.js Official Website

Verify installation:node -v

npm -v

Install PostgreSQLDownload:

HYPERLINK "https://www.postgresql.org/download/?utm_source=chatgpt.com" \t "_blank"

PostgreSQL Official Website

During installation remember:Username: postgres

Password: yourpassword

Port: 5432

Install VS CodeDownload:

HYPERLINK "https://code.visualstudio.com?utm_source=chatgpt.com" \t "_blank"

Visual Studio Code

Recommended Extensions:ES7 React Snippets

PostgreSQL

Prettier

Step 2: Create Project StructureLoginApp

├── backend

└── frontend

Step 3: Create BackendMove inside project folder:mkdir LoginApp

cd LoginApp

mkdir backend

cd backendInitialize project:npm init -yInstall packages:npm install express pg cors bcrypt jsonwebtoken dotenv

npm install nodemon --save-dev

Step 4: Backend Folder Structurebackend

├── config

│   └── db.js

├── routes

│   └── auth.js

├── .env

├── server.js

└── package.json

Step 5: Create PostgreSQL DatabaseOpen PostgreSQL Query Tool:CREATE DATABASE loginapp;Connect to database:\c loginappCreate Users Table:CREATE TABLE users (

id SERIAL PRIMARY KEY,

name VARCHAR(100),

email VARCHAR(100) UNIQUE,

password VARCHAR(255)

Step 6: Create Environment File.envPORT=5000

DB_USER=postgres

DB_HOST=localhost

DB_NAME=loginapp

DB_PASSWORD=yourpassword

DB_PORT=5432

JWT_SECRET=mysecretkey

Step 7: Database Connectionconfig/db.jsconst { Pool } = require("pg");

const pool = new Pool({

user: process.env.DB_USER,

host: process.env.DB_HOST,

database: process.env.DB_NAME,

password: process.env.DB_PASSWORD,

port: process.env.DB_PORT

module.exports = pool;

Step 8: Create Authentication Routesroutes/auth.jsconst express = require("express");

const router = express.Router();

const pool = require("../config/db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {

try {

const { name, email, password } = req.body;

const userExist = await pool.query(

"SELECT * FROM users WHERE email=$1",

[email]

);

if (userExist.rows.length > 0) {

return res.status(400).json({

message: "Email already exists"

});

}

const salt = await bcrypt.genSalt(10);

const hashedPassword = await bcrypt.hash(

password,

salt

);

const newUser = await pool.query(

`INSERT INTO users(name,email,password)

VALUES($1,$2,$3)

RETURNING *`,

[name, email, hashedPassword]

);

res.status(201).json({

message: "User Registered",

user: newUser.rows[0]

});

} catch (error) {

res.status(500).json(error.message);

router.post("/login", async (req, res) => {

try {

const { email, password } = req.body;

const user = await pool.query(

"SELECT * FROM users WHERE email=$1",

[email]

);

if (user.rows.length === 0) {

return res.status(400).json({

message: "User not found"

});

}

const validPassword =

await bcrypt.compare(

password,

user.rows[0].password

);

if (!validPassword) {

return res.status(400).json({

message: "Wrong Password"

});

}

const token = jwt.sign(

{

id: user.rows[0].id

},

process.env.JWT_SECRET,

{

expiresIn: "1d"

}

);

res.json({

message: "Login Success",

token

});

} catch (error) {

res.status(500).json(error.message);

module.exports = router;
Ȗǂ

yRz0ȗ

sv-SE

sv-SE

sv-SE

sv-SE

sv-SE

sv-SE

sv-SE

sv-SE

sv-SE

yRz]ȗ%Ř

{"ExportResponse":0,"ExportTextStreamRange":0,"ExportConcernRanges":0,"ExportTextStreamAndTypoInfo":1,"ExportPartInit":1,"ExecInitWeb":114}ȥÉȦã

{"__prepareData":0,"_OpenLoop":38,"locate":0,"_ParseMedium":0,"builtStyle._OpenLoop":8,"builtStyle._ParseMedium":0,"builtStyle.LoadMedium":60,"builtStyle":61,"LoadMedium":106,"OnAfterDocOpen":0,"__prepareDrawImp":86,"open":200}