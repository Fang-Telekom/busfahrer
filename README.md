# Busfahrer

## Technology Stack
* [Frontend: Angular](https://angular.dev/)
* [Backnend: Django](https://www.djangoproject.com/)
* [Extras: Tailwind](https://tailwindcss.com)

**[1]** Angular configuration: Stylesheet from: CSS; enabled SSR and SSG (Prerendering)

## Install and Run

### First time

1. Navigate to the **frontend** directory
2. Run `npm install`
3. If on Linux/macOS Run `python -m pip install Django`
4. If on Windows Run `py -m pip install Django`

### Serve Angular application on local machine

1. Run `ng serve` within the **frontend** directory
2. Navigate to the browser `http://localhost:4200`

### Serve Django application on local machine

1. Run `python manage.py runserver` within the **backend** directory
2. Navigate to the browser `http://localhost:8000`


## Introduction

### create Angular Project

1. Run `ng new [Project name]` | "ng new frontend"

### create Django Project

1. Create the Project Environment
* Run `django-admin startproject [Project name] [directory]` | "django-admin startproject main backend/"
2. Create App
* Run `python manage.py startapp [name]` within in the Django Projectfolder, e.g. **backend** | "python manage.py startapp user"
3. Write & Activate models in App in /backend/main/settings.py [Installed_App] 

4. Migrate it to the db 
* Run `python manage.py makemigrations [app]`| "python manage.py makemigrations user"
* **optionaly**: Run `python manage.py sqlmigrate [app] [sequence]` to see SQL commands
* Run `python manage.py migrate`

5. Add App to the Django Administration Page in `[app]/admin.py`

6. Add Routing in main/urls.py

7. Playing in the DB
* Run `python manage.py shell`

* [Django Administration Page](http://localhost:8000/admin)
**[Superuser]** admin : valorant 

* CORS: add 'corsheaders' in /backend/main/settings.py [Installed_App]
* Run `python -m pip install django-cors-headers`
* Add localhost to [Allowed_Hosts]
* add `corsheaders.middleware.CorsMiddleware` to [Middleware]
