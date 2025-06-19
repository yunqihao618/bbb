from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import RechargePackage, Payment, RechargeRecord, PaymentLog
from .serializers import (
    RechargePackageSerializer, 
    PaymentSerializer, 
    CreateRechargeOrderSerializer,
    RechargeRecordSerializer,
    PaymentLogSerializer
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def package_list(request):
    """获取充值套餐列表"""
    packages = RechargePackage.objects.filter(is_active=True)
    serializer = RechargePackageSerializer(packages, many=True)
    
    return Response({
        'results': serializer.data,
        'count': packages.count()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_recharge_order(request):
    """创建充值订单"""
    serializer = CreateRechargeOrderSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        payment = serializer.save()
        
        return Response({
            'message': '充值订单创建成功',
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'amount': payment.amount,
            'package': {
                'name': payment.package.name,
                'credits': payment.credits_earned,
                'bonus_credits': payment.bonus_credits_earned
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': '订单创建失败',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mock_payment_success(request, payment_id):
    """模拟支付成功"""
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    
    if payment.status != 'pending':
        return Response({
            'error': '支付状态不允许此操作'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 更新支付状态
    payment.status = 'completed'
    payment.paid_at = timezone.now()
    payment.save()
    
    # 增加用户积分
    user = request.user
    user.credits += payment.credits_earned + payment.bonus_credits_earned
    user.save()
    
    # 创建充值记录
    recharge_record = RechargeRecord.objects.create(
        user=user,
        payment=payment,
        amount=payment.amount,
        credits_received=payment.credits_earned,
        bonus_credits=payment.bonus_credits_earned
    )
    
    # 记录日志
    PaymentLog.objects.create(
        payment=payment,
        action='payment_success',
        status='success',
        message='支付成功，积分已到账',
        details={
            'credits_earned': payment.credits_earned,
            'bonus_credits': payment.bonus_credits_earned,
            'total_credits': payment.credits_earned + payment.bonus_credits_earned
        }
    )
    
    return Response({
        'message': '支付成功',
        'payment_id': payment.id,
        'credits_earned': payment.credits_earned + payment.bonus_credits_earned,
        'current_credits': user.credits
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """查询支付状态"""
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    serializer = PaymentSerializer(payment)
    
    # 获取支付日志
    logs = PaymentLog.objects.filter(payment=payment)
    log_serializer = PaymentLogSerializer(logs, many=True)
    
    return Response({
        'payment': serializer.data,
        'logs': log_serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recharge_history(request):
    """获取充值历史"""
    records = RechargeRecord.objects.filter(user=request.user)
    
    # 分页
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    
    page = paginator.paginate_queryset(records, request)
    if page is not None:
        serializer = RechargeRecordSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = RechargeRecordSerializer(records, many=True)
    return Response({
        'results': serializer.data,
        'count': records.count()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_payment(request, payment_id):
    """取消支付"""
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    
    if payment.status not in ['pending', 'processing']:
        return Response({
            'error': '支付状态不允许取消'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    payment.status = 'cancelled'
    payment.save()
    
    # 记录日志
    PaymentLog.objects.create(
        payment=payment,
        action='cancel_payment',
        status='success',
        message='用户取消支付'
    )
    
    return Response({
        'message': '支付已取消',
        'payment_id': payment.id
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_credits(request):
    """获取用户积分信息"""
    user = request.user
    
    # 获取最近的充值记录
    recent_recharges = RechargeRecord.objects.filter(user=user)[:5]
    
    return Response({
        'current_credits': user.credits,
        'recent_recharges': RechargeRecordSerializer(recent_recharges, many=True).data
    })