from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('individual', '个人用户'),
        ('enterprise', '企业用户'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='individual')
    credits = models.IntegerField(default=0)  # 积分
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.email})"

class VerificationCode(models.Model):
    CODE_TYPE_CHOICES = [
        ('email_register', '邮箱注册'),
        ('email_login', '邮箱登录'),
        ('phone_register', '手机注册'),
        ('phone_login', '手机登录'),
        ('password_reset', '密码重置'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    code = models.CharField(max_length=6)
    code_type = models.CharField(max_length=20, choices=CODE_TYPE_CHOICES)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def __str__(self):
        target = self.email or self.phone
        return f"{target} - {self.code_type} - {self.code}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    company_name = models.CharField(max_length=200, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.name} Profile"