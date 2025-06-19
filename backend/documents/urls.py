from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_document, name='upload_document'),
    path('list/', views.document_list, name='document_list'),
    path('<uuid:document_id>/', views.document_detail, name='document_detail'),
    path('<uuid:document_id>/status/', views.document_status, name='document_status'),
    path('<uuid:document_id>/download/', views.download_document, name='download_document'),
    path('<uuid:document_id>/download/<str:file_type>/', views.download_document, name='download_document_type'),
    path('<uuid:document_id>/delete/', views.delete_document, name='delete_document'),
]