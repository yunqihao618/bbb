from rest_framework import serializers
from .models import RechargePackage, Payment, RechargeRecord, PaymentLog

class RechargePackageSerializer(serializers.ModelSerializer):
    total_credits = serializers.ReadOnlyField()
    
    class Meta:
        model = RechargePackage
        fields = [
            'id', 'name', 'amount', 'credits', 'bonus_credits', 
            'total_credits', 'is_popular', 'sort_order'
        ]

class PaymentSerializer(serializers.ModelSerializer):
    package_name = serializers.CharField(source='package.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'package', 'package_name', 'payment_method', 'amount', 
            'status', 'transaction_id', 'credits_earned', 'bonus_credits_earned',
            'created_at', 'updated_at', 'paid_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'credits_earned', 'bonus_credits_earned',
            'created_at', 'updated_at', 'paid_at'
        ]

class CreateRechargeOrderSerializer(serializers.Serializer):
    package_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    
    def validate_package_id(self, value):
        try:
            package = RechargePackage.objects.get(id=value, is_active=True)
        except RechargePackage.DoesNotExist:
            raise serializers.ValidationError("充值套餐不存在或已下架")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        package = RechargePackage.objects.get(id=validated_data['package_id'])
        
        payment = Payment.objects.create(
            user=user,
            package=package,
            payment_method=validated_data['payment_method'],
            amount=package.amount,
            credits_earned=package.credits,
            bonus_credits_earned=package.bonus_credits
        )
        
        # 记录日志
        PaymentLog.objects.create(
            payment=payment,
            action='create_order',
            status='success',
            message='充值订单创建成功'
        )
        
        return payment

class RechargeRecordSerializer(serializers.ModelSerializer):
    payment_method = serializers.CharField(source='payment.payment_method', read_only=True)
    transaction_id = serializers.CharField(source='payment.transaction_id', read_only=True)
    status = serializers.CharField(source='payment.status', read_only=True)
    package_name = serializers.CharField(source='payment.package.name', read_only=True)
    total_credits = serializers.ReadOnlyField()
    
    class Meta:
        model = RechargeRecord
        fields = [
            'id', 'amount', 'credits_received', 'bonus_credits', 'total_credits',
            'payment_method', 'transaction_id', 'status', 'package_name', 'created_at'
        ]

class PaymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentLog
        fields = ['action', 'status', 'message', 'details', 'created_at']