from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)


class VoiceInputSerializer(serializers.Serializer):
    audio_text = serializers.CharField(max_length=2000)