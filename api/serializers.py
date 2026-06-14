"""
DRF Serializers for the Sign Language Communication Platform API.
"""
from rest_framework import serializers


class TextToGlossSerializer(serializers.Serializer):
    """Accept text input, optionally with language, and return gloss sequence."""
    text = serializers.CharField(
        max_length=2000,
        help_text="The sentence to convert to sign language gloss."
    )
    language = serializers.ChoiceField(
        choices=[('en', 'English'), ('hi', 'Hindi')],
        default='en',
        help_text="Input language: 'en' for English, 'hi' for Hindi."
    )


class GlossResponseSerializer(serializers.Serializer):
    """Response schema for text-to-gloss conversion."""
    original_text = serializers.CharField()
    language = serializers.CharField()
    gloss = serializers.ListField(child=serializers.CharField())
    available_signs = serializers.ListField(child=serializers.CharField())
    fingerspell = serializers.ListField(child=serializers.CharField())


class PredictSignSerializer(serializers.Serializer):
    """Accept hand landmarks and return predicted sign label."""
    landmarks = serializers.ListField(
        child=serializers.DictField(child=serializers.FloatField()),
        min_length=21,
        max_length=21,
        help_text="List of 21 hand landmarks, each with x, y, z coordinates."
    )
    language = serializers.ChoiceField(
        choices=[('en', 'English'), ('hi', 'Hindi')],
        default='en',
        help_text="Sign language mode: 'en' for ASL, 'hi' for ISL."
    )


class PredictSignResponseSerializer(serializers.Serializer):
    """Response schema for sign prediction."""
    label = serializers.CharField()
    confidence = serializers.FloatField()
    language = serializers.CharField()


class SignDictionarySerializer(serializers.Serializer):
    """Schema for a single sign entry in the dictionary."""
    word = serializers.CharField()
    has_video = serializers.BooleanField()
    has_animation = serializers.BooleanField()
    video_url = serializers.CharField(allow_blank=True)
    category = serializers.CharField(allow_blank=True)


class SignDetailSerializer(serializers.Serializer):
    """Detailed sign info including animation data."""
    word = serializers.CharField()
    has_video = serializers.BooleanField()
    has_animation = serializers.BooleanField()
    video_url = serializers.CharField(allow_blank=True)
    animation_data = serializers.DictField(required=False)
