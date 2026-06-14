from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect
from django.views import View
from django.urls import reverse
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.cache import never_cache

from .forms import LoginForm, RegistrationForm

User = get_user_model()


@method_decorator([ensure_csrf_cookie, never_cache], name='dispatch')
class AuthPageView(View):
    template_name = 'registration/login.html'
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard:home')
        
        login_form = LoginForm()
        register_form = RegistrationForm()
        
        context = {
            'login_form': login_form,
            'register_form': register_form,
            'Error': request.GET.get('error', ''),
            'register_success': request.GET.get('registered', '') == 'true'
        }
        
        return render(request, self.template_name, context)


class LoginView(View):
    def post(self, request):
        form = LoginForm(request.POST)
        
        if not form.is_valid():
            return redirect(f"{reverse('auth_page')}?error=Invalid credentials")
        
        identifier = form.cleaned_data['login_identifier']
        password = form.cleaned_data['password']
        
        user = authenticate(request, username=identifier, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                next_url = request.GET.get('next', reverse('dashboard:home'))
                return redirect(next_url)
            else:
                return redirect(f"{reverse('auth_page')}?error=Account is disabled")
        
        return redirect(f"{reverse('auth_page')}?error=Invalid email/phone or password")


class RegisterView(View):
    def post(self, request):
        form = RegistrationForm(request.POST)
        
        if form.is_valid():
            user = form.save()
            return redirect(f"{reverse('auth_page')}?registered=true")
        
        error_message = next(iter(form.errors.values()))[0] if form.errors else 'Registration failed'
        
        context = {
            'login_form': LoginForm(),
            'register_form': form,
            'error': error_message,
        }
        
        return render(request, 'registration/login.html', context, status=400)


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('auth_page')