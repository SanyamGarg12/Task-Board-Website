# Task Board Application

A full-stack task management application built with React, FastAPI, and MySQL.

## Features

- User authentication (sign up/sign in)
- Create, read, update, and delete tasks
- Drag and drop tasks between different status columns (Todo, In Progress, Done)
- Responsive design with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MySQL (v8.0 or higher)

## Setup

### Database Setup

1. Create a MySQL database using the provided schema:
```bash
mysql -u root -p < database.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with the following content:
```
DATABASE_URL=mysql+pymysql://root:your_password@localhost/taskboard
```

5. Start the backend server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Sign up for a new account or sign in with existing credentials
3. Start managing your tasks by creating new ones and dragging them between columns

## API Endpoints

- POST `/api/register` - Register a new user
- POST `/api/login` - Login user
- GET `/api/tasks` - Get all tasks for a user
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/{task_id}` - Update a task
- DELETE `/api/tasks/{task_id}` - Delete a task 