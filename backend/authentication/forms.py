from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import re

User = get_user_model()


class LoginForm(forms.Form):
    login_identifier = forms.CharField(max_length=255)
    password = forms.CharField(widget=forms.PasswordInput())
    
    def clean_login_identifier(self):
        identifier = self.cleaned_data['login_identifier'].strip()
        if not identifier:
            raise ValidationError('Email or phone number is required')
        return identifier


class RegistrationForm(forms.Form):
    email = forms.EmailField(required=True)
    phone_number = forms.CharField(required=False, max_length=15)
    password = forms.CharField(min_length=8)
    
    def clean_email(self):
        email = self.cleaned_data['email'].strip().lower()
        if User.objects.filter(email=email).exists():
            raise ValidationError('An account with this email already exists')
        return email
    
    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number', '').strip()
        if phone:
            phone = re.sub(r'[^\d]', '', phone)
            if len(phone) < 10 or len(phone) > 15:
                raise ValidationError('Enter a valid phone number')
            if User.objects.filter(phone_number=phone).exists():
                raise ValidationError('An account with this phone number already exists')
        return phone if phone else None
    
    def clean_password(self):
        password = self.cleaned_data['password']
        if not re.search(r'[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', password):
            raise ValidationError('Password must contain at least one number')
        return password