from django.contrib import admin

# Register your models here.

#Into the Django administration Page
from .models import User

admin.site.register(User)