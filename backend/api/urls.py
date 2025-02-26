from django.urls import path
from . import views
from api.views import BookView, MovieView, Test_Request, ProductView, EventView, index_page, Genre, Country

from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # Endpoint to get access & refresh tokens
    TokenRefreshView,  # Endpoint to refresh expired access tokens
    TokenVerifyView,  # (Optional) Endpoint to verify if a token is valid
)

app_name = "api"

urlpatterns = [
    path('', index_page, name='index_page'),
    path('books/', BookView.as_view(), name='books'),
    #path('audios/', views.audios, name='audios'),
    path("movies/", MovieView.as_view(), name="movies"),
    path('genre/', Genre.as_view(), name = 'genre'),
    path('country/', Country.as_view(), name = 'country'),
    path('test_request/', Test_Request.as_view(), name='test_request'),
    #path('products/', ProductView.as_view(), name='products'),
    path('events/', EventView.as_view(), name='events'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
