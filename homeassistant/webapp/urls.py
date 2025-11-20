from django.urls import path
from .views import IndexView, get_user_profile, update_user_profile, get_profile_choices
from .views_dashboard import dashboard_action, dashboard_initial

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('api/profile/', get_user_profile, name='get_user_profile'),
    path('api/profile/update/', update_user_profile, name='update_user_profile'),
    path('api/profile/choices/', get_profile_choices, name='get_profile_choices'),
    path('api/dashboard/', dashboard_initial, name='dashboard_initial'),
    path('api/dashboard/action/', dashboard_action, name='dashboard_action'),
]
