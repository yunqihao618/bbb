from django.contrib import admin
from .models import RechargePackage, Payment, RechargeRecord, PaymentLog

@admin.register(RechargePackage)
class RechargePackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'amount', 'credits', 'bonus_credits', 'is_popular', 'is_active', 'sort_order']
    list_filter = ['is_popular', 'is_active']
    search_fields = ['name']
    ordering = ['sort_order', 'amount']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'amount', 'payment_method', 'status', 'created_at']
    list_filter = ['payment_method', 'status']
    search_fields = ['transaction_id', 'user__name', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at']

@admin.register(RechargeRecord)
class RechargeRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'credits_received', 'bonus_credits', 'created_at']
    search_fields = ['user__name', 'user__email']
    ordering = ['-created_at']

@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = ['payment', 'action', 'status', 'created_at']
    list_filter = ['action', 'status']
    search_fields = ['payment__transaction_id', 'message']
    ordering = ['-created_at']