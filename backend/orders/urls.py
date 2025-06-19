from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_order, name='create_order'),
    path('list/', views.order_list, name='order_list'),
    path('<str:order_number>/', views.order_detail, name='order_detail'),
    path('<str:order_number>/pay/', views.pay_order, name='pay_order'),
    path('<str:order_number>/cancel/', views.cancel_order, name='cancel_order'),
    path('<str:order_number>/download/', views.download_order_result, name='download_order_result'),
]