from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('send-code/', views.send_code, name='send_code'),
    path('send-email-code/', views.send_code, name='send_email_code'),
    path('send-phone-code/', views.send_code, name='send_phone_code'),
    path('user-info/', views.user_info, name='user_info'),
    path('profile/', views.update_profile, name='update_profile'),
    path('wechat/qrcode/', views.wechat_qrcode, name='wechat_qrcode'),
]