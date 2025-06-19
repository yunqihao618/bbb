from django.db import models
from django.conf import settings
from documents.models import Document
import uuid

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('processing', '处理中'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
        ('refunded', '已退款'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=32, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='orders')
    
    # 订单信息
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    credits_used = models.IntegerField(default=0)  # 使用的积分
    
    # 服务参数
    service_type = models.CharField(max_length=50, default='standard')
    reduction_level = models.CharField(max_length=20, default='under-10')
    urgency = models.CharField(max_length=20, default='standard')
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"订单 {self.order_number} - {self.user.name}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        """生成订单号"""
        import time
        import random
        timestamp = str(int(time.time()))
        random_str = ''.join(random.choices('0123456789ABCDEF', k=6))
        return f"WP{timestamp}{random_str}"

class OrderItem(models.Model):
    """订单项目"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.order.order_number} - {self.name}"

class OrderStatusHistory(models.Model):
    """订单状态历史"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    reason = models.TextField(null=True, blank=True)
    operator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number}: {self.from_status} -> {self.to_status}"