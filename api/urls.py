"""
URL routing for the Sign Language API.
"""
from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    # Auth
    path('auth/login/', views.auth_login, name='auth-login'),
    path('auth/signup/', views.auth_signup, name='auth-signup'),

    # Text → Sign Language gloss
    path('text-to-gloss/', views.text_to_gloss, name='text-to-gloss'),

    # Sign → Text (landmark prediction)
    path('predict-sign/', views.predict_sign, name='predict-sign'),

    # Signs dictionary
    path('signs/', views.signs_list, name='signs-list'),
    path('signs/<str:word>/', views.sign_detail, name='sign-detail'),
]
