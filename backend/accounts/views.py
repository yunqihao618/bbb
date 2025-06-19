from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import User, UserProfile
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer,
    VerificationCodeSerializer,
    UserProfileSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """用户注册"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': '注册成功',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': token.key,
                'refresh': token.key  # 简化处理，实际项目中应使用JWT
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': '注册失败',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """用户登录"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.validate_and_authenticate()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': '登录成功',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': token.key,
                    'refresh': token.key
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': '登录失败',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_code(request):
    """发送验证码"""
    serializer = VerificationCodeSerializer(data=request.data)
    if serializer.is_valid():
        result = serializer.save()
        if result['success']:
            return Response({
                'message': result['message']
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result['message']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': '参数错误',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """获取用户信息"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """更新用户资料"""
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': '资料更新成功',
            'profile': serializer.data
        })
    
    return Response({
        'error': '更新失败',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def wechat_qrcode(request):
    """获取微信登录二维码"""
    # 这里应该调用微信API生成二维码
    # 为了演示，返回一个模拟的二维码URL
    import uuid
    qr_id = str(uuid.uuid4())
    
    return Response({
        'qr_code': f'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=wechat_login_{qr_id}',
        'qr_id': qr_id,
        'expires_in': 300  # 5分钟过期
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """用户登出"""
    try:
        # 删除用户的token
        Token.objects.filter(user=request.user).delete()
        return Response({
            'message': '登出成功'
        })
    except Exception as e:
        return Response({
            'error': '登出失败'
        }, status=status.HTTP_400_BAD_REQUEST)