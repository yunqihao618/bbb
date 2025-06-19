from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from .models import Document, DocumentProcessingLog
from .serializers import DocumentSerializer, DocumentUploadSerializer, DocumentProcessingLogSerializer
from .utils import extract_text_from_file, process_document_with_aigc
import os
import mimetypes

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    """上传文档"""
    serializer = DocumentUploadSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        document = serializer.save()
        
        # 异步处理文档
        try:
            # 提取文本和字数统计
            text_content = extract_text_from_file(document.original_file.path)
            document.word_count = len(text_content.replace(' ', ''))
            document.save()
            
            # 提交到AIGC服务进行处理
            process_document_with_aigc.delay(document.id)
            
            return Response({
                'message': '文档上传成功，正在处理中',
                'document_id': document.id,
                'document': DocumentSerializer(document).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            document.status = 'failed'
            document.save()
            
            DocumentProcessingLog.objects.create(
                document=document,
                step='upload_processing',
                status='failed',
                message=f'文档处理失败: {str(e)}'
            )
            
            return Response({
                'error': '文档处理失败',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': '上传失败',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_list(request):
    """获取用户的文档列表"""
    documents = Document.objects.filter(user=request.user)
    serializer = DocumentSerializer(documents, many=True)
    return Response({
        'documents': serializer.data,
        'count': documents.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_detail(request, document_id):
    """获取文档详情"""
    document = get_object_or_404(Document, id=document_id, user=request.user)
    serializer = DocumentSerializer(document)
    
    # 获取处理日志
    logs = DocumentProcessingLog.objects.filter(document=document)
    log_serializer = DocumentProcessingLogSerializer(logs, many=True)
    
    return Response({
        'document': serializer.data,
        'processing_logs': log_serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_document(request, document_id, file_type='processed'):
    """下载文档"""
    document = get_object_or_404(Document, id=document_id, user=request.user)
    
    if file_type == 'original':
        file_field = document.original_file
        filename_prefix = 'original_'
    elif file_type == 'processed':
        if not document.processed_file:
            return Response({
                'error': '处理后的文件不存在'
            }, status=status.HTTP_404_NOT_FOUND)
        file_field = document.processed_file
        filename_prefix = 'processed_'
    else:
        return Response({
            'error': '无效的文件类型'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not file_field or not os.path.exists(file_field.path):
        raise Http404("文件不存在")
    
    # 准备文件响应
    with open(file_field.path, 'rb') as f:
        file_data = f.read()
    
    # 设置响应头
    content_type, _ = mimetypes.guess_type(file_field.path)
    if not content_type:
        content_type = 'application/octet-stream'
    
    filename = f"{filename_prefix}{document.title}{document.file_type}"
    
    response = HttpResponse(file_data, content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Content-Length'] = len(file_data)
    
    return response

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_document(request, document_id):
    """删除文档"""
    document = get_object_or_404(Document, id=document_id, user=request.user)
    
    # 删除文件
    if document.original_file and os.path.exists(document.original_file.path):
        os.remove(document.original_file.path)
    
    if document.processed_file and os.path.exists(document.processed_file.path):
        os.remove(document.processed_file.path)
    
    document.delete()
    
    return Response({
        'message': '文档删除成功'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_status(request, document_id):
    """获取文档处理状态"""
    document = get_object_or_404(Document, id=document_id, user=request.user)
    
    # 如果有AIGC任务ID，查询AIGC服务状态
    if document.aigc_task_id and document.status == 'processing':
        from .utils import check_aigc_task_status
        aigc_status = check_aigc_task_status(document.aigc_task_id)
        
        if aigc_status:
            if aigc_status['status'] == 'completed':
                # 更新文档状态
                document.status = 'completed'
                document.ai_detection_rate_after = aigc_status.get('ai_detection_rate', 0)
                document.save()
            elif aigc_status['status'] == 'failed':
                document.status = 'failed'
                document.save()
    
    return Response({
        'document_id': document.id,
        'status': document.status,
        'progress': 100 if document.status == 'completed' else (50 if document.status == 'processing' else 0),
        'ai_detection_rate_before': document.ai_detection_rate_before,
        'ai_detection_rate_after': document.ai_detection_rate_after,
        'word_count': document.word_count,
        'created_at': document.created_at,
        'updated_at': document.updated_at
    })