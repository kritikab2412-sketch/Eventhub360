Phase 2: Protected RoutesProblemUser can open:localhost:3000/dashboardWithout login.This is insecure.

Create ProtectedRouteimport { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

const token = localStorage.getItem("token");

return token

? children

: <Navigate to="/" />;

export default ProtectedRoute;

Use Route Protection<Route

path="/dashboard"

element={

<ProtectedRoute>

<Dashboard />

</ProtectedRoute>

Student LearningUnderstand:Authentication

Authorization

Session Control

Phase 3: User DashboardObjectiveAfter Login:Welcome JohnDisplay:Name

Email

Role

Last Login

Backend APIGET /api/user/profile

Token Verification Middlewareconst jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

const token =

req.header("Authorization");

if(!token)

return res.status(401).json({

message:"Unauthorized"

});

const decoded =

jwt.verify(

token,

process.env.JWT_SECRET

req.user = decoded;

next();

Dashboard Requestaxios.get(

"http://localhost:5000/api/user/profile",

headers:{

Authorization: token

}

Phase 4: Forgot PasswordReal World FlowUser Forgot Password

↓

Enter Email

↓

Generate Reset Token

↓

Send Email

↓

Reset Password

New TableCREATE TABLE password_reset (

id SERIAL PRIMARY KEY,

user_id INT,

token TEXT,

expires_at TIMESTAMP

APIPOST /forgot-password

POST /reset-password

Student TaskImplement:Token Expiry = 15 Minutes

Phase 5: Email VerificationWhy?Prevent fake accounts.

Registration FlowSignup

Email Sent

Verification Link

Account Activated

Add ColumnALTER TABLE users

ADD COLUMN verified BOOLEAN

DEFAULT FALSE;

Verification Linkhttp://localhost:3000/verify/xyz123

APIsPOST /register

GET /verify-email/:token

Email ServiceUse:BrevoorSendGrid

Phase 6: Refresh TokensCurrent ProblemJWT expires.Login

Token expires

User logged out

Industry SolutionTwo Tokens:Access Token

Refresh Token

ExampleAccess Token

Expiry = 15 min

Refresh Token

Expiry = 30 days
Ȗƫ

y=z
ȗ

yfz ȗ%Ř

{"ExportResponse":0,"ExportTextStreamRange":0,"ExportConcernRanges":0,"ExportTextStreamAndTypoInfo":0,"ExportPartInit":1,"ExecInitWeb":111}ȥhȦâ

{"__prepareData":0,"_OpenLoop":23,"locate":0,"_ParseMedium":0,"builtStyle._OpenLoop":6,"builtStyle._ParseMedium":0,"builtStyle.LoadMedium":42,"builtStyle":43,"LoadMedium":70,"OnAfterDocOpen":0,"__prepareDrawImp":26,"open":104}