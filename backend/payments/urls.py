from django.urls import path
from . import views

urlpatterns = [
    path('api/packages/', views.package_list, name='package_list'),
    path('api/payments/create_recharge_order/', views.create_recharge_order, name='create_recharge_order'),
    path('api/payments/<uuid:payment_id>/mock_payment_success/', views.mock_payment_success, name='mock_payment_success'),
    path('api/payments/<uuid:payment_id>/status/', views.payment_status, name='payment_status'),
    path('api/payments/<uuid:payment_id>/cancel/', views.cancel_payment, name='cancel_payment'),
    path('api/recharges/', views.recharge_history, name='recharge_history'),
    path('api/credits/', views.user_credits, name='user_credits'),
]