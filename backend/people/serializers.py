from rest_framework import serializers
from .models import Contact, ContactCategory


class ContactCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactCategory
        fields = ['id', 'name', 'icon', 'is_default', 'created_at']
        read_only_fields = ['created_at']


class ContactSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    shared_groups_count = serializers.IntegerField(read_only=True)
    net_balance = serializers.SerializerMethodField()
    contact_user_email = serializers.EmailField(source='contact_user.email', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 'contact_user', 'contact_user_email', 'name', 'email', 'phone',
            'category', 'category_name', 'notes', 'photo', 'is_favorite',
            'is_active', 'shared_groups_count', 'net_balance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_net_balance(self, obj):
        return obj.net_balance

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        email = validated_data.get('email', '')
        if email:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            contact_user = User.objects.filter(email=email).first()
            if contact_user:
                validated_data['contact_user'] = contact_user
        return super().create(validated_data)