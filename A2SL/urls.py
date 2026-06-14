from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('animation/', views.animation_view, name='animation'),
    path('sign-to-text/', views.sign_to_text_view, name='sign_to_text'),      # NEW
    path('predict-sign/', views.predict_sign_api, name='predict_sign_api'),    # NEW (AJAX)
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
]