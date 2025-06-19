from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'service_type', 'urgency']
    search_fields = ['order_number', 'user__name', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['order_number', 'created_at', 'updated_at']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'name', 'quantity', 'unit_price', 'total_price']
    search_fields = ['order__order_number', 'name']

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'from_status', 'to_status', 'operator', 'created_at']
    list_filter = ['from_status', 'to_status']
    search_fields = ['order__order_number', 'reason']
    ordering = ['-created_at']