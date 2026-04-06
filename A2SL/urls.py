from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('animation/', views.animation_view, name='animation'),
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
]