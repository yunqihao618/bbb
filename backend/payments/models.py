from django.db import models
from django.conf import settings
import uuid

class RechargePackage(models.Model):
    """充值套餐"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # 价格
    credits = models.IntegerField()  # 积分数量
    bonus_credits = models.IntegerField(default=0)  # 赠送积分
    is_popular = models.BooleanField(default=False)  # 是否热门
    sort_order = models.IntegerField(default=0)  # 排序
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['sort_order', 'amount']
    
    def __str__(self):
        return f"{self.name} - ¥{self.amount}"
    
    @property
    def total_credits(self):
        return self.credits + self.bonus_credits

class Payment(models.Model):
    """支付记录"""
    PAYMENT_METHOD_CHOICES = [
        ('alipay', '支付宝'),
        ('wechat', '微信支付'),
        ('bank', '银行卡'),
        ('mock', '模拟支付'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('processing', '支付中'),
        ('completed', '已完成'),
        ('failed', '支付失败'),
        ('cancelled', '已取消'),
        ('refunded', '已退款'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    package = models.ForeignKey(RechargePackage, on_delete=models.CASCADE, related_name='payments')
    
    # 支付信息
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # 第三方支付信息
    transaction_id = models.CharField(max_length=100, unique=True)
    external_transaction_id = models.CharField(max_length=100, null=True, blank=True)
    
    # 积分信息
    credits_earned = models.IntegerField(default=0)
    bonus_credits_earned = models.IntegerField(default=0)
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"支付 {self.transaction_id} - {self.user.name}"
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self.generate_transaction_id()
        super().save(*args, **kwargs)
    
    def generate_transaction_id(self):
        """生成交易ID"""
        import time
        import random
        timestamp = str(int(time.time()))
        random_str = ''.join(random.choices('0123456789ABCDEF', k=8))
        return f"PAY{timestamp}{random_str}"

class PaymentLog(models.Model):
    """支付日志"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    message = models.TextField()
    details = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.payment.transaction_id} - {self.action}"

class RechargeRecord(models.Model):
    """充值记录"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recharge_records')
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='recharge_record')
    
    # 充值信息
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    credits_received = models.IntegerField()
    bonus_credits = models.IntegerField(default=0)
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"充值 {self.amount} - {self.user.name}"
    
    @property
    def total_credits(self):
        return self.credits_received + self.bonus_credits