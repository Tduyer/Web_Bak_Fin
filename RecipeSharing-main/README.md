```md
# Recipe Sharing App (Node.js + Express + MongoDB)
Team: Akhmet Z., Batyrkhan K., Yerulan T.  
Topic: **Recipe Sharing Website**.  
Users can register/login, create recipes, and admin can approve/reject recipes.  
Frontend is simple HTML/CSS/JS.

---

## 1) Project Overview

The app lets users:
- register and login (JWT auth)
- create recipes (new recipes are **pending**)
- view approved public recipes on the Home page
- search recipes on Home
- open recipe details by clicking a card
- edit/delete their own recipes in Profile

Admin can:
- see all recipes
- approve/reject pending recipes (admin panel inside Profile)
- edit/delete any recipe

Also I added email notifications using Nodemailer + SendGrid SMTP:
- when admin approves/rejects a recipe, the owner gets an email

---

## 2) Tech Stack

- Backend: Node.js, Express
- Database: MongoDB Atlas
- Auth: JWT + bcrypt
- Validation: Joi
- Email: Nodemailer (SMTP SendGrid)
- Frontend: HTML, CSS, Vanilla JS

---

## 3) Project Structure

```

recipe-sharing-app/
config/
db.js
controllers/
userController.js
recipeController.js
middleware/
authMiddleware.js
errorMiddleware.js
models/
User.js
Recipe.js
routes/
userRoutes.js
recipeRoutes.js
publicRoutes.js
utils/
sendEmail.js
validators/
authValidators.js
recipeValidators.js
public/
home.html
create.html
profile.html
index.html
styles.css
js/
common.js
home.js
create.js
profilePage.js
server.js
package.json

````

---

## 4) Setup Instructions (Local)

### 4.1 Install dependencies
```bash
npm install
````

### 4.2 Create `.env` file (LOCAL ONLY)

Create a file named `.env` in the project root:

⚠️ Important:

* `MONGO_URI` must be from **MongoDB Atlas** (not localhost)
* For SendGrid, you must verify Sender Identity, otherwise it gives 550 error.

### 4.3 Run the project

```bash
npm start
```

Server will run on:

* http://localhost:5000

Frontend pages:

* `/index.html` (login/register)
* `/home.html` (public recipes)
* `/create.html` (create recipe)
* `/profile.html` (profile + admin panel)

---

## 5) Deployment (Render)

Project is deployed on Render as a Web Service.
<img width="952" height="178" alt="image" src="https://github.com/user-attachments/assets/a0b443ba-5555-454a-8bd8-36fd80ad8a5d" />


### Environment Variables (Render)

On Render → Service → Environment:

* `MONGO_URI`
* `JWT_SECRET`
* SMTP vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
* <img width="2008" height="993" alt="image" src="https://github.com/user-attachments/assets/1ad34b1a-54f0-46b2-926a-338ed389a70e" />


`.env` file is NOT uploaded to GitHub and not used in production.
Sensitive values are stored only in Render environment variables.

Live URL:

* (https://recipesharing-x19y.onrender.com)

---

## 6) API Documentation

Base URL:

* Local: `http://localhost:5000`
* Deployed: `https://recipesharing-x19y.onrender.com`

### Auth (Public)

#### POST `/api/register`

Register new user.

Body:

```json
{
  "username": "testuser",
  "email": "testuser@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "JWT_TOKEN",
  "user": { "id": "...", "username": "...", "email": "...", "role": "user" }
}
```

#### POST `/api/login`

Login user.

Body:

```json
{
  "email": "testuser@gmail.com",
  "password": "123456"
}
```

Response: same format with token.

---

### User (Private)

#### GET `/api/users/profile`

Requires JWT.

Headers:

```
Authorization: Bearer <token>
```

#### PUT `/api/users/profile`

Update username/email.

Body:

```json
{
  "username": "newname",
  "email": "newemail@gmail.com"
}
```

---

### Recipes (Private)

#### POST `/api/recipes`

Create recipe (**status is set to pending by server**).

Body:

```json
{
  "title": "Creamy Chicken Pasta",
  "description": "Nice pasta for dinner",
  "ingredients": ["pasta", "chicken", "cream"],
  "steps": ["Boil pasta", "Cook chicken", "Mix everything"],
  "tags": ["dinner", "pasta"],
  "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
  "isPublic": true
}
```

#### GET `/api/recipes`

Get recipes of logged-in user.

#### GET `/api/recipes?all=true`

Admin only: get all recipes.

#### GET `/api/recipes/:id`

Get one recipe (owner/admin only).

#### PUT `/api/recipes/:id`

Update recipe (owner/admin only).
Note: status can’t be changed here.

#### DELETE `/api/recipes/:id`

Delete recipe (owner/admin only).

---

### Admin Moderation (Private)

#### PUT `/api/recipes/:id/approve`

Admin only.
Sets status to `approved` and sends email to recipe owner.

#### PUT `/api/recipes/:id/reject`

Admin only.
Sets status to `rejected`, saves reason, and sends email.

Body:

```json
{ "reason": "Not enough details" }
```

---

### Public Recipes (Public)

#### GET `/api/public/recipes?q=...`

Get approved public recipes.
Optional search query `q`.

#### GET `/api/public/recipes/:id`

Get details of one approved recipe.

---

## 7) Screenshots (Features)

1. **Login/Register page** — user can register or login
<img width="2859" height="1330" alt="image" src="https://github.com/user-attachments/assets/64fa097f-183d-4732-81d7-d6ff99e9cfcf" />
2. **Home page** — catalog grid + search + top 10 recipes + “Show all”
<img width="2850" height="1335" alt="image" src="https://github.com/user-attachments/assets/cf8c72af-7bfd-44ea-b4ab-7ac9b932bd7a" />
3. **Recipe details modal** — click a recipe card to view full details
<img width="1643" height="1131" alt="image" src="https://github.com/user-attachments/assets/de901ca8-13af-48a0-943f-62d992d53b0a" />
4. **Create page** — create new recipe, image preview
<img width="2477" height="1328" alt="image" src="https://github.com/user-attachments/assets/3ba04775-780e-4897-a892-c5920ebf1589" />
5. **Profile page** — edit/delete your recipes in catalog view
<img width="2842" height="1331" alt="image" src="https://github.com/user-attachments/assets/649c4fe9-a86d-41c0-9148-31e1a7293525" />
6. **Admin panel in Profile** — approve/reject pending recipes (only admin sees it)
7. **Email notification** — screenshot of email received after approve/reject


---

## 8) Notes / Rules

* Passwords are hashed with bcrypt.
* JWT is used to protect private routes.
* Recipe status is controlled by backend (users can’t set status manually).
* SMTP sender must be verified in SendGrid (Sender Identity).

---

## 9) Example Test Accounts

You can create users via `/index.html`.

Admin account:

* create user normally, then in MongoDB Atlas set role to `"admin"` for that user.

Example user:

* email: user1@gmail.com
* password: 123456Aa

