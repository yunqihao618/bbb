from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from documents.serializers import DocumentSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['name', 'description', 'quantity', 'unit_price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'document', 'status', 'total_amount', 
            'credits_used', 'service_type', 'reduction_level', 'urgency',
            'items', 'created_at', 'updated_at', 'paid_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'total_amount', 'created_at', 
            'updated_at', 'paid_at', 'completed_at'
        ]

class OrderCreateSerializer(serializers.ModelSerializer):
    document_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'document_id', 'service_type', 'reduction_level', 
            'urgency', 'credits_used'
        ]
    
    def validate_document_id(self, value):
        from documents.models import Document
        user = self.context['request'].user
        
        try:
            document = Document.objects.get(id=value, user=user)
        except Document.DoesNotExist:
            raise serializers.ValidationError("文档不存在或无权访问")
        
        # 检查文档是否已有未完成的订单
        existing_order = Order.objects.filter(
            document=document,
            status__in=['pending', 'paid', 'processing']
        ).first()
        
        if existing_order:
            raise serializers.ValidationError("该文档已有未完成的订单")
        
        return value
    
    def create(self, validated_data):
        from documents.models import Document
        
        document_id = validated_data.pop('document_id')
        user = self.context['request'].user
        
        document = Document.objects.get(id=document_id, user=user)
        
        # 计算价格
        total_amount = self.calculate_price(document, validated_data)
        
        order = Order.objects.create(
            user=user,
            document=document,
            total_amount=total_amount,
            **validated_data
        )
        
        # 创建订单项
        OrderItem.objects.create(
            order=order,
            name=f"文档处理服务 - {document.title}",
            description=f"服务类型: {validated_data.get('service_type', 'standard')}",
            quantity=1,
            unit_price=total_amount,
            total_price=total_amount
        )
        
        return order
    
    def calculate_price(self, document, order_data):
        """计算订单价格"""
        base_price = 299  # 基础价格
        
        # 根据字数调整价格
        word_count = document.word_count
        if word_count > 10000:
            base_price += (word_count - 10000) * 0.01
        
        # 根据服务类型调整价格
        service_multiplier = {
            'academic': 1.2,
            'business': 1.1,
            'creative': 1.0,
            'technical': 1.3
        }
        base_price *= service_multiplier.get(order_data.get('service_type', 'standard'), 1.0)
        
        # 根据紧急程度调整价格
        urgency_multiplier = {
            'rush': 2.0,
            'standard': 1.0,
            'economy': 0.8
        }
        base_price *= urgency_multiplier.get(order_data.get('urgency', 'standard'), 1.0)
        
        return round(base_price, 2)

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['from_status', 'to_status', 'reason', 'created_at']