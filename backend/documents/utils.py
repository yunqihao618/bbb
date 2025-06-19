import os
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from celery import shared_task
from .models import Document, DocumentProcessingLog
import docx
import PyPDF2
import io

def extract_text_from_file(file_path):
    """从文件中提取文本内容"""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        elif file_extension in ['.doc', '.docx']:
            doc = docx.Document(file_path)
            text = []
            for paragraph in doc.paragraphs:
                text.append(paragraph.text)
            return '\n'.join(text)
        
        elif file_extension == '.pdf':
            text = []
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text.append(page.extract_text())
            return '\n'.join(text)
        
        else:
            raise ValueError(f"不支持的文件格式: {file_extension}")
    
    except Exception as e:
        raise Exception(f"文本提取失败: {str(e)}")

def call_aigc_service(text, rewrite_type='standard', language='zh'):
    """调用AIGC服务进行文本改写"""
    url = f"{settings.AIGC_SERVICE_URL}/api/rewrite/submit"
    
    data = {
        'text': text,
        'rewrite_type': rewrite_type,
        'language': language
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"AIGC服务调用失败: {str(e)}")

def check_aigc_task_status(task_id):
    """检查AIGC任务状态"""
    url = f"{settings.AIGC_SERVICE_URL}/api/rewrite/status/{task_id}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"检查AIGC任务状态失败: {str(e)}")
        return None

def download_aigc_result(task_id):
    """下载AIGC处理结果"""
    url = f"{settings.AIGC_SERVICE_URL}/api/rewrite/download/{task_id}"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        raise Exception(f"下载AIGC结果失败: {str(e)}")

@shared_task
def process_document_with_aigc(document_id):
    """异步处理文档"""
    try:
        document = Document.objects.get(id=document_id)
        
        # 记录开始处理
        DocumentProcessingLog.objects.create(
            document=document,
            step='start_processing',
            status='started',
            message='开始处理文档'
        )
        
        # 更新状态为处理中
        document.status = 'processing'
        document.save()
        
        # 提取文本内容
        text_content = extract_text_from_file(document.original_file.path)
        
        DocumentProcessingLog.objects.create(
            document=document,
            step='text_extraction',
            status='completed',
            message=f'文本提取完成，共{len(text_content)}字符'
        )
        
        # 调用AIGC服务
        aigc_result = call_aigc_service(
            text=text_content,
            rewrite_type=document.rewrite_type,
            language=document.target_language
        )
        
        if 'task_id' in aigc_result:
            document.aigc_task_id = aigc_result['task_id']
            document.save()
            
            DocumentProcessingLog.objects.create(
                document=document,
                step='aigc_submission',
                status='completed',
                message=f'已提交到AIGC服务，任务ID: {aigc_result["task_id"]}'
            )
            
            # 轮询AIGC服务状态
            import time
            max_attempts = 60  # 最多等待10分钟
            attempt = 0
            
            while attempt < max_attempts:
                time.sleep(10)  # 每10秒检查一次
                attempt += 1
                
                status_result = check_aigc_task_status(document.aigc_task_id)
                
                if status_result:
                    if status_result['status'] == 'completed':
                        # 下载处理结果
                        processed_content = download_aigc_result(document.aigc_task_id)
                        
                        # 保存处理后的文件
                        filename = f"processed_{document.title}.txt"
                        document.processed_file.save(
                            filename,
                            ContentFile(processed_content),
                            save=False
                        )
                        
                        # 更新文档状态
                        document.status = 'completed'
                        document.ai_detection_rate_after = status_result.get('ai_detection_rate', 0)
                        document.save()
                        
                        DocumentProcessingLog.objects.create(
                            document=document,
                            step='processing_completed',
                            status='completed',
                            message='文档处理完成'
                        )
                        
                        return
                    
                    elif status_result['status'] == 'failed':
                        raise Exception(f"AIGC处理失败: {status_result.get('message', '未知错误')}")
            
            # 超时处理
            raise Exception("AIGC处理超时")
        
        else:
            raise Exception("AIGC服务返回格式错误")
    
    except Exception as e:
        # 处理失败
        document.status = 'failed'
        document.save()
        
        DocumentProcessingLog.objects.create(
            document=document,
            step='processing_failed',
            status='failed',
            message=f'处理失败: {str(e)}'
        )
        
        print(f"文档处理失败: {str(e)}")