from django.db import models
from django.conf import settings
import uuid
import os

def document_upload_path(instance, filename):
    """文档上传路径"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('documents', str(instance.user.id), filename)

def processed_document_upload_path(instance, filename):
    """处理后文档上传路径"""
    ext = filename.split('.')[-1]
    filename = f"processed_{uuid.uuid4()}.{ext}"
    return os.path.join('documents', 'processed', str(instance.user.id), filename)

class Document(models.Model):
    STATUS_CHOICES = [
        ('uploaded', '已上传'),
        ('processing', '处理中'),
        ('completed', '已完成'),
        ('failed', '处理失败'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    original_file = models.FileField(upload_to=document_upload_path)
    processed_file = models.FileField(upload_to=processed_document_upload_path, null=True, blank=True)
    
    # 文档信息
    file_size = models.BigIntegerField()  # 文件大小（字节）
    file_type = models.CharField(max_length=50)  # 文件类型
    word_count = models.IntegerField(default=0)  # 字数
    
    # 处理状态
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    ai_detection_rate_before = models.FloatField(null=True, blank=True)  # 处理前AI检测率
    ai_detection_rate_after = models.FloatField(null=True, blank=True)   # 处理后AI检测率
    
    # AIGC服务任务ID
    aigc_task_id = models.CharField(max_length=255, null=True, blank=True)
    
    # 处理参数
    rewrite_type = models.CharField(max_length=50, default='standard')
    target_language = models.CharField(max_length=10, default='zh')
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.name}"
    
    @property
    def file_size_mb(self):
        """文件大小（MB）"""
        return round(self.file_size / (1024 * 1024), 2)

class DocumentProcessingLog(models.Model):
    """文档处理日志"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='processing_logs')
    step = models.CharField(max_length=100)  # 处理步骤
    status = models.CharField(max_length=20)  # 步骤状态
    message = models.TextField()  # 日志消息
    details = models.JSONField(null=True, blank=True)  # 详细信息
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.document.title} - {self.step}"