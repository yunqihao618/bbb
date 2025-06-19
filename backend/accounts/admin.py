from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VerificationCode, UserProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'user_type', 'credits', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_active', 'is_email_verified', 'is_phone_verified']
    search_fields = ['email', 'name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('额外信息', {
            'fields': ('phone', 'name', 'avatar', 'user_type', 'credits', 
                      'is_email_verified', 'is_phone_verified')
        }),
    )

@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ['email', 'phone', 'code', 'code_type', 'is_used', 'expires_at', 'created_at']
    list_filter = ['code_type', 'is_used']
    search_fields = ['email', 'phone', 'code']
    ordering = ['-created_at']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'industry', 'position']
    search_fields = ['user__name', 'company_name']