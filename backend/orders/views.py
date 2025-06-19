from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Order, OrderStatusHistory
from .serializers import OrderSerializer, OrderCreateSerializer, OrderStatusHistorySerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """创建订单"""
    serializer = OrderCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        order = serializer.save()
        
        # 记录状态变更
        OrderStatusHistory.objects.create(
            order=order,
            from_status='',
            to_status='pending',
            reason='订单创建',
            operator=request.user
        )
        
        return Response({
            'message': '订单创建成功',
            'order_number': order.order_number,
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': '订单创建失败',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    """获取用户订单列表"""
    orders = Order.objects.filter(user=request.user)
    
    # 分页
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    
    page = paginator.paginate_queryset(orders, request)
    if page is not None:
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = OrderSerializer(orders, many=True)
    return Response({
        'results': serializer.data,
        'count': orders.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_number):
    """获取订单详情"""
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    
    # 获取状态历史
    history = OrderStatusHistory.objects.filter(order=order)
    
    return Response({
        'order': OrderSerializer(order).data,
        'status_history': OrderStatusHistorySerializer(history, many=True).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_order(request, order_number):
    """支付订单"""
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    
    if order.status != 'pending':
        return Response({
            'error': '订单状态不允许支付'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 检查用户积分是否足够
    user = request.user
    if order.credits_used > 0 and user.credits < order.credits_used:
        return Response({
            'error': '积分不足'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 模拟支付成功
    order.status = 'paid'
    order.paid_at = timezone.now()
    order.save()
    
    # 扣除积分
    if order.credits_used > 0:
        user.credits -= order.credits_used
        user.save()
    
    # 记录状态变更
    OrderStatusHistory.objects.create(
        order=order,
        from_status='pending',
        to_status='paid',
        reason='支付成功',
        operator=user
    )
    
    # 开始处理文档
    from documents.utils import process_document_with_aigc
    process_document_with_aigc.delay(order.document.id)
    
    # 更新订单状态为处理中
    order.status = 'processing'
    order.save()
    
    OrderStatusHistory.objects.create(
        order=order,
        from_status='paid',
        to_status='processing',
        reason='开始处理文档',
        operator=user
    )
    
    return Response({
        'message': '支付成功，开始处理文档',
        'order': OrderSerializer(order).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_number):
    """取消订单"""
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    
    if order.status not in ['pending', 'paid']:
        return Response({
            'error': '订单状态不允许取消'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    old_status = order.status
    order.status = 'cancelled'
    order.save()
    
    # 如果已支付，退还积分
    if old_status == 'paid' and order.credits_used > 0:
        user = request.user
        user.credits += order.credits_used
        user.save()
    
    # 记录状态变更
    OrderStatusHistory.objects.create(
        order=order,
        from_status=old_status,
        to_status='cancelled',
        reason='用户取消',
        operator=request.user
    )
    
    return Response({
        'message': '订单已取消',
        'order': OrderSerializer(order).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_order_result(request, order_number):
    """下载订单处理结果"""
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    
    if order.status != 'completed':
        return Response({
            'error': '订单未完成，无法下载'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 重定向到文档下载
    from django.http import HttpResponseRedirect
    from django.urls import reverse
    
    return HttpResponseRedirect(
        reverse('download_document_type', kwargs={
            'document_id': order.document.id,
            'file_type': 'processed'
        })
    )