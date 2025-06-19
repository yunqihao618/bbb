from django.contrib import admin
from .models import Document, DocumentProcessingLog

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'word_count', 'file_size_mb', 'created_at']
    list_filter = ['status', 'file_type', 'rewrite_type']
    search_fields = ['title', 'user__name', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['id', 'file_size', 'word_count', 'created_at', 'updated_at']

@admin.register(DocumentProcessingLog)
class DocumentProcessingLogAdmin(admin.ModelAdmin):
    list_display = ['document', 'step', 'status', 'created_at']
    list_filter = ['status', 'step']
    search_fields = ['document__title', 'message']
    ordering = ['-created_at']