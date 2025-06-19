from rest_framework import serializers
from .models import Document, DocumentProcessingLog
import os

class DocumentSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    original_filename = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'original_file', 'processed_file', 
            'file_size', 'file_size_mb', 'file_type', 'word_count',
            'status', 'ai_detection_rate_before', 'ai_detection_rate_after',
            'rewrite_type', 'target_language', 'original_filename',
            'created_at', 'updated_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'file_size', 'file_type', 'word_count', 'status',
            'ai_detection_rate_before', 'ai_detection_rate_after',
            'processed_file', 'created_at', 'updated_at', 'processed_at'
        ]
    
    def get_original_filename(self, obj):
        if obj.original_file:
            return os.path.basename(obj.original_file.name)
        return None

class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    
    class Meta:
        model = Document
        fields = ['file', 'title', 'rewrite_type', 'target_language']
    
    def validate_file(self, value):
        # 检查文件大小 (50MB限制)
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("文件大小不能超过50MB")
        
        # 检查文件类型
        allowed_extensions = ['.txt', '.doc', '.docx', '.pdf']
        file_extension = os.path.splitext(value.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"不支持的文件类型。支持的格式: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def create(self, validated_data):
        file = validated_data.pop('file')
        user = self.context['request'].user
        
        # 如果没有提供标题，使用文件名
        if not validated_data.get('title'):
            validated_data['title'] = os.path.splitext(file.name)[0]
        
        document = Document.objects.create(
            user=user,
            original_file=file,
            file_size=file.size,
            file_type=os.path.splitext(file.name)[1].lower(),
            **validated_data
        )
        
        return document

class DocumentProcessingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentProcessingLog
        fields = ['step', 'status', 'message', 'details', 'created_at']