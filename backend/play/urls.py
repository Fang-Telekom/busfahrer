from django.urls import path

from . import views

urlpatterns = [
    path("create/", views.create, name="Create a Party"),
    #path("join/", views.users, name="Nutzer"),
]