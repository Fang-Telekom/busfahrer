from django.urls import path

from . import views

urlpatterns = [
    #Hauptspeise Menü Liste
    path("", views.verify, name="Verifizierung"),
#    path("verify/", views.set_csrf_token, name="Cross Site"),
    path("users/", views.users, name="Nutzer"),
    path("registry/", views.addUser, name="Regristrierung"),
    path("purge/", views.removeUser, name="Löschung von Nutzern"),
    path("adjust/", views.adjustUser, name="Anpassung von Nutzerdaten"),
    path("<pic_name>/", views.profilePic, name="Profil"),
]