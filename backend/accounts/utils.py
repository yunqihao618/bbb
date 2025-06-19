import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import VerificationCode

def generate_verification_code():
    """生成6位数字验证码"""
    return ''.join(random.choices(string.digits, k=6))

def send_verification_code(email=None, phone=None, code_type='email_register'):
    """发送验证码"""
    code = generate_verification_code()
    expires_at = timezone.now() + timedelta(minutes=10)  # 10分钟过期
    
    # 创建验证码记录
    verification_code = VerificationCode.objects.create(
        email=email,
        phone=phone,
        code=code,
        code_type=code_type,
        expires_at=expires_at
    )
    
    if email:
        # 发送邮件验证码
        subject = '验证码 - WritePro'
        message = f'您的验证码是: {code}，有效期10分钟。'
        
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return {'success': True, 'message': '验证码已发送到邮箱'}
        except Exception as e:
            return {'success': False, 'message': f'邮件发送失败: {str(e)}'}
    
    elif phone:
        # 发送短信验证码 (这里使用模拟发送)
        print(f"发送短信验证码到 {phone}: {code}")
        return {'success': True, 'message': '验证码已发送到手机'}
    
    return {'success': False, 'message': '发送失败'}

def verify_code(email=None, phone=None, code=None, code_type=None):
    """验证验证码"""
    if email:
        code_obj = VerificationCode.objects.filter(
            email=email,
            code=code,
            code_type=code_type,
            is_used=False
        ).first()
    elif phone:
        code_obj = VerificationCode.objects.filter(
            phone=phone,
            code=code,
            code_type=code_type,
            is_used=False
        ).first()
    else:
        return False
    
    if code_obj and not code_obj.is_expired():
        code_obj.is_used = True
        code_obj.save()
        return True
    
    return False