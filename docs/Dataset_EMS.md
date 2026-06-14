1. DepartmentsINSERT INTO departments (department_name)

VALUES

('Software Development'),

('Quality Assurance'),

('Human Resources'),

('Finance'),

('Digital Marketing'),

('Sales'),

('Operations'),

('Technical Support');

2. UsersINSERT INTO users

(name,email,password,role)

VALUES

('Pranay Gupta','pranay@isoftzone.com','123456','admin'),

('Rahul Sharma','rahul@isoftzone.com','123456','manager'),

('Priya Verma','priya@isoftzone.com','123456','hr'),

('Amit Patel','amit@isoftzone.com','123456','employee'),

('Neha Jain','neha@isoftzone.com','123456','employee'),

('Rohit Singh','rohit@isoftzone.com','123456','employee'),

('Anjali Gupta','anjali@isoftzone.com','123456','employee'),

('Vikas Mehta','vikas@isoftzone.com','123456','employee'),

('Pooja Shah','pooja@isoftzone.com','123456','employee'),

('Sandeep Kumar','sandeep@isoftzone.com','123456','employee');

3. Employee ProfilesINSERT INTO employee_profiles

user_id,

department_id,

phone,

address,

designation,

salary

VALUES

(1,1,'9876543210','Indore','Director',150000),

(2,1,'9876543211','Indore','Project Manager',85000),

(3,3,'9876543212','Indore','HR Manager',70000),

(4,1,'9876543213','Indore','React Developer',45000),

(5,1,'9876543214','Indore','Node Developer',50000),

(6,2,'9876543215','Indore','QA Engineer',40000),

(7,5,'9876543216','Indore','Marketing Executive',35000),

(8,6,'9876543217','Indore','Sales Executive',38000),

(9,8,'9876543218','Indore','Support Engineer',32000),

(10,4,'9876543219','Indore','Accountant',42000);

4. SkillsINSERT INTO skills(skill_name)

VALUES

('React'),

('NodeJS'),

('PostgreSQL'),

('JavaScript'),

('HTML'),

('CSS'),

('MongoDB'),

('Python'),

('Testing'),

('Salesforce');

5. Employee SkillsINSERT INTO employee_skills

(employee_id,skill_id)

VALUES

(4,1),

(4,4),

(4,5),

(5,2),

(5,3),

(5,4),

(6,9),

(7,4),

(8,10),

(9,2),

(9,3),

(10,8);

6. Leave TypesINSERT INTO leave_types

(leave_name,total_days)

VALUES

('Casual Leave',12),

('Sick Leave',10),

('Earned Leave',15),

('Maternity Leave',90);

7. Leave BalanceINSERT INTO leave_balance

employee_id,

leave_type_id,

available_days

VALUES

(4,1,10),

(4,2,8),

(5,1,12),

(5,2,10),

(6,1,8),

(6,2,6),

(7,1,10),

(7,2,7),

(8,1,12),

(8,2,10);

8. Leave ApplicationsINSERT INTO leave_applications

employee_id,

leave_type_id,

from_date,

to_date,

total_days,

reason,

status

VALUES

(4,1,'2026-06-01','2026-06-03',3,'Family Function','Approved'),

(5,2,'2026-06-10','2026-06-11',2,'Fever','Pending'),

(6,1,'2026-05-20','2026-05-21',2,'Personal Work','Approved'),

(7,1,'2026-06-15','2026-06-17',3,'Travel','Pending'),

(8,2,'2026-06-18','2026-06-20',3,'Medical','Rejected');

9. Approval HistoryINSERT INTO approval_history

leave_id,

approved_by,

action,

remarks

VALUES

(1,2,'Approved','Manager Approved'),

(1,3,'Approved','HR Approved'),

(3,2,'Approved','Manager Approved'),

(3,3,'Approved','HR Approved'),

(5,2,'Rejected','Insufficient Reason');
ȏŪ

y3z	Ȑ

y
zgȐ%Œ

yszȐ%Œ

{"ExportResponse":0,"ExportTextStreamRange":0,"ExportConcernRanges":0,"ExportTextStreamAndTypoInfo":0,"ExportPartInit":0,"ExecInitWeb":104}ȞLȟá

{"__prepareData":0,"_OpenLoop":12,"locate":0,"_ParseMedium":0,"builtStyle._OpenLoop":5,"builtStyle._ParseMedium":0,"builtStyle.LoadMedium":26,"builtStyle":26,"LoadMedium":42,"OnAfterDocOpen":0,"__prepareDrawImp":29,"open":76}