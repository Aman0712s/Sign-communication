from django.urls import path, include
from . import views

urlpatterns = [
    # Legacy template views (kept for backward compat)
    path('', views.home_view, name='home'),
    path('animation/', views.animation_view, name='animation'),
    path('sign-to-text/', views.sign_to_text_view, name='sign_to_text'),
    path('predict-sign/', views.predict_sign_api, name='predict_sign_api'),
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # REST API (consumed by React frontend & mobile app)
    path('api/', include('api.urls')),
]