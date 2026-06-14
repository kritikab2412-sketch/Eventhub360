DAY 3 ADVANCED TASKEmployee Profile Management SystemObjectiveAfter Login, students should be able to:Login

Dashboard

Create Employee Profile

Upload Multiple Images

Assign Department

Assign Skills

View Employee List

Perform SQL JOIN Queries

Database DesignTable 1: UsersCREATE TABLE users (

id SERIAL PRIMARY KEY,

name VARCHAR(100),

email VARCHAR(100),

password VARCHAR(255),

role VARCHAR(20) DEFAULT 'user'

Table 2: DepartmentsCREATE TABLE departments(

id SERIAL PRIMARY KEY,

department_name VARCHAR(100)

);Sample DataINSERT INTO departments(department_name)

VALUES

('IT'),

('HR'),

('Finance'),

('Marketing');

Table 3: Employee ProfileCREATE TABLE employee_profiles(

id SERIAL PRIMARY KEY,

user_id INT REFERENCES users(id),

department_id INT REFERENCES departments(id),

phone VARCHAR(20),

address TEXT,

designation VARCHAR(100),

salary NUMERIC(10,2),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Table 4: Employee ImagesMultiple ImagesCREATE TABLE employee_images(

id SERIAL PRIMARY KEY,

employee_id INT REFERENCES employee_profiles(id),

image_url TEXT

Table 5: SkillsCREATE TABLE skills(

id SERIAL PRIMARY KEY,

skill_name VARCHAR(100)

);Sample DataINSERT INTO skills(skill_name)

VALUES

('React'),

('NodeJS'),

('PostgreSQL'),

('Python'),

('Java');

Table 6: Employee SkillsMany-to-Many RelationshipCREATE TABLE employee_skills(

id SERIAL PRIMARY KEY,

employee_id INT REFERENCES employee_profiles(id),

skill_id INT REFERENCES skills(id)

What Students LearnOne To Many

Employee

↓

Multiple Images

Many To Many

Employee

↔

Skills

Required APIsDepartment APIsGET /api/departments

POST /api/departments

Skills APIsGET /api/skills

POST /api/skills

Employee APIsPOST /api/employees

GET /api/employees

GET /api/employees/:id

PUT /api/employees/:id

DELETE /api/employees/:id

Image UploadInstallnpm install multerFolderbackend

uploads

employee1.jpg

employee2.jpg

Upload APIPOST /api/employees/uploadAllowProfile Photo

Aadhar Card

Resume

CertificateMax Files5 Images

Dashboard StatisticsShowTotal Employees

Total Departments

Total Skills

Total Uploaded Images

SQL JOIN AssignmentJoin 1SELECT

u.name,

d.department_name

FROM employee_profiles ep

INNER JOIN users u

ON ep.user_id = u.id

INNER JOIN departments d

ON ep.department_id = d.id;

Join 2SELECT

u.name,

s.skill_name

FROM employee_skills es

INNER JOIN employee_profiles ep

ON es.employee_id = ep.id

INNER JOIN users u

ON ep.user_id = u.id

INNER JOIN skills s

ON es.skill_id = s.id;

React Pages RequiredLogin

Signup

Dashboard

Employee List

Create Employee

Edit Employee

Department Master

Skills Master

Profile

Dashboard Cards+----------------+

| Employees 150 |

+----------------+

+----------------+

| Departments 5 |

+----------------+

+----------------+

| Skills 20 |

+----------------+

+----------------+

| Images 300 |

+----------------+
ȖƟ

y7z	ȗƺ밁ā

yAz(ȗ

ytz	ȗ

y7z
ȗ%Ř

yAz)ȗ%Ř

{"ExportResponse":0,"ExportTextStreamRange":0,"ExportConcernRanges":0,"ExportTextStreamAndTypoInfo":0,"ExportPartInit":0,"ExecInitWeb":105}ȥ7Ȧá

{"__prepareData":0,"_OpenLoop":10,"locate":0,"_ParseMedium":0,"builtStyle._OpenLoop":4,"builtStyle._ParseMedium":0,"builtStyle.LoadMedium":25,"builtStyle":26,"LoadMedium":39,"OnAfterDocOpen":0,"__prepareDrawImp":11,"open":55}