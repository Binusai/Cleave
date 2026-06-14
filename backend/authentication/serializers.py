from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'is_email_verified', 'date_joined']
        read_only_fields = ['id', 'is_email_verified', 'date_joined']


class LoginSerializer(serializers.Serializer):
    login_identifier = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=15)
    password = serializers.CharField(required=True, min_length=8)
    
    def validate_email(self, value):
        if User.objects.filter(email=value.lower().strip()).exists():
            raise serializers.ValidationError('An account with this email already exists')
        return value.lower().strip()
    
    def validate_phone_number(self, value):
        if value:
            value = value.strip()
            if User.objects.filter(phone_number=value).exists():
                raise serializers.ValidationError('An account with this phone number already exists')
        return value or None
    
    def validate_password(self, value):
        import re
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', value):
            raise serializers.ValidationError('Password must contain at least one number')
        return value


class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField(required=True)