from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Contact, ContactCategory
from .serializers import ContactSerializer, ContactCategorySerializer


@method_decorator(csrf_exempt, name='dispatch')
class ContactListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        contacts = Contact.objects.filter(owner=request.user, is_active=True)
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        favorite = request.query_params.get('favorite')

        if category:
            contacts = contacts.filter(category__name=category)
        if search:
            contacts = contacts.filter(
                models.Q(name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(phone__icontains=search)
            )
        if favorite == 'true':
            contacts = contacts.filter(is_favorite=True)

        serializer = ContactSerializer(contacts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = ContactSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            contact = serializer.save()
            return Response(ContactSerializer(contact, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ContactDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Contact, pk=pk, owner=user, is_active=True)

    def get(self, request, pk):
        contact = self.get_object(pk, request.user)
        serializer = ContactSerializer(contact, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        contact = self.get_object(pk, request.user)
        serializer = ContactSerializer(contact, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        contact = self.get_object(pk, request.user)
        contact.is_active = False
        contact.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(csrf_exempt, name='dispatch')
class ToggleFavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        contact = get_object_or_404(Contact, pk=pk, owner=request.user)
        contact.is_favorite = not contact.is_favorite
        contact.save()
        return Response({'is_favorite': contact.is_favorite})


@method_decorator(csrf_exempt, name='dispatch')
class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = ContactCategory.objects.all()
        serializer = ContactCategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ContactCategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.db import models as django_models