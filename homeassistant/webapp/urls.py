from django.urls import path
from .views import IndexView, get_user_profile, update_user_profile, get_profile_choices

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('api/profile/', get_user_profile, name='get_user_profile'),
    path('api/profile/update/', update_user_profile, name='update_user_profile'),
    path('api/profile/choices/', get_profile_choices, name='get_profile_choices'),
]
