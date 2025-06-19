from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, VerificationCode, UserProfile
from .utils import send_verification_code
import re

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    verification_code = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'phone', 'name', 'password', 'confirm_password', 'verification_code', 'user_type']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("两次输入的密码不一致")
        
        # 验证验证码
        email = attrs.get('email')
        phone = attrs.get('phone')
        code = attrs['verification_code']
        
        if email:
            code_obj = VerificationCode.objects.filter(
                email=email,
                code=code,
                code_type='email_register',
                is_used=False
            ).first()
        elif phone:
            code_obj = VerificationCode.objects.filter(
                phone=phone,
                code=code,
                code_type='phone_register',
                is_used=False
            ).first()
        else:
            raise serializers.ValidationError("必须提供邮箱或手机号")
        
        if not code_obj or code_obj.is_expired():
            raise serializers.ValidationError("验证码无效或已过期")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        code = validated_data.pop('verification_code')
        
        user = User.objects.create_user(**validated_data)
        
        # 标记验证码为已使用
        email = validated_data.get('email')
        phone = validated_data.get('phone')
        
        if email:
            VerificationCode.objects.filter(
                email=email,
                code=code,
                code_type='email_register'
            ).update(is_used=True)
            user.is_email_verified = True
        elif phone:
            VerificationCode.objects.filter(
                phone=phone,
                code=code,
                code_type='phone_register'
            ).update(is_used=True)
            user.is_phone_verified = True
        
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    password = serializers.CharField(required=False)
    verification_code = serializers.CharField(required=False)
    login_type = serializers.ChoiceField(choices=['email', 'phone', 'phone_password'])
    
    def validate(self, attrs):
        login_type = attrs['login_type']
        
        if login_type == 'email':
            if not attrs.get('email') or not attrs.get('password'):
                raise serializers.ValidationError("邮箱和密码不能为空")
        elif login_type == 'phone':
            if not attrs.get('phone') or not attrs.get('verification_code'):
                raise serializers.ValidationError("手机号和验证码不能为空")
        elif login_type == 'phone_password':
            if not attrs.get('phone') or not attrs.get('password'):
                raise serializers.ValidationError("手机号和密码不能为空")
        
        return attrs
    
    def validate_and_authenticate(self):
        login_type = self.validated_data['login_type']
        
        if login_type == 'email':
            email = self.validated_data['email']
            password = self.validated_data['password']
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("邮箱或密码错误")
        
        elif login_type == 'phone':
            phone = self.validated_data['phone']
            code = self.validated_data['verification_code']
            
            # 验证验证码
            code_obj = VerificationCode.objects.filter(
                phone=phone,
                code=code,
                code_type='phone_login',
                is_used=False
            ).first()
            
            if not code_obj or code_obj.is_expired():
                raise serializers.ValidationError("验证码无效或已过期")
            
            user = User.objects.filter(phone=phone).first()
            if not user:
                raise serializers.ValidationError("用户不存在")
            
            # 标记验证码为已使用
            code_obj.is_used = True
            code_obj.save()
        
        elif login_type == 'phone_password':
            phone = self.validated_data['phone']
            password = self.validated_data['password']
            
            user = User.objects.filter(phone=phone).first()
            if not user or not user.check_password(password):
                raise serializers.ValidationError("手机号或密码错误")
        
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'name', 'avatar', 'user_type', 'credits', 
                 'is_email_verified', 'is_phone_verified', 'created_at']
        read_only_fields = ['id', 'credits', 'created_at']

class VerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    code_type = serializers.ChoiceField(choices=VerificationCode.CODE_TYPE_CHOICES)
    
    def validate(self, attrs):
        email = attrs.get('email')
        phone = attrs.get('phone')
        
        if not email and not phone:
            raise serializers.ValidationError("必须提供邮箱或手机号")
        
        if email and phone:
            raise serializers.ValidationError("只能提供邮箱或手机号中的一个")
        
        # 验证手机号格式
        if phone:
            phone_pattern = r'^(\+?86)?1[3-9]\d{9}$'
            if not re.match(phone_pattern, phone):
                raise serializers.ValidationError("手机号格式不正确")
        
        return attrs
    
    def save(self):
        email = self.validated_data.get('email')
        phone = self.validated_data.get('phone')
        code_type = self.validated_data['code_type']
        
        return send_verification_code(email=email, phone=phone, code_type=code_type)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['company_name', 'industry', 'position', 'bio', 'website', 'location']