from django.urls import path
from api import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # Endpoint to get access & refresh tokens
    TokenRefreshView,  # Endpoint to refresh expired access tokens
    TokenVerifyView,  # (Optional) Endpoint to verify if a token is valid
)

app_name = 'api' 

urlpatterns = [
    path('', views.index_page, name='index_page'),
    #path('books/', views.books, name='books'),
    #path('movies/', views.movies, name='movies'),
    #path('audios/', views.audios, name='audios'),
    path('test_request/', views.test_request, name='test_request'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]