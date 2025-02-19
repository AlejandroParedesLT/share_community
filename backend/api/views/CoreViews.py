#Alejandro Paredes La Torre
#Import necessary libraries
import pickle
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import status

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from django.shortcuts import render
#import joblib
import numpy as np
import pandas as pd

from datetime import datetime, date
import logging
# Setting up logging
log_file = './mlapi_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Create your views here.
@api_view(['GET'])
def index_page(request):
    return_data = {
        "error" : "0",
        "message" : "Successfull Ok",
    } 
    logging.info("GET") 
    print("PRINT")
    return Response(return_data)

#@api_view(["POST"])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
class Test_Request(APIView):
    def get(self, request):
        try:
            request_data = request.data
            name = request_data['name']
            hello = {
                'error' : '0',
                'message': f'Hello World {name}'
            }
            return Response(hello, status=200)
        except Exception as e:
            logging.error('Error Request: %s', e)
            predictions = {
                'error' : '2',
                "message": str(e)
            }
            return Response(predictions, status=502)

    def post(self, request):
        try:
            request_data = request.data
            name = request_data['name']
            hello = {
                'error' : '0',
                'message': f'Hello World transform {name}'
            }
            return Response(hello, status=200)
        except Exception as e:
            logging.error('Error Request: %s', e)
            predictions = {
                'error' : '2',
                "message": str(e)
            }
            return Response(predictions, status=502)
    
    

# @api_view(["POST"])
# @authentication_classes([SessionAuthentication, TokenAuthentication])
# def stories(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)

# @api_view(["POST"])
# def stories(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)
    
# @api_view(["GET"])
# def books(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)
    
# @api_view(["POST"])
# def books(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)
    
# @api_view(["PUT"])
# def books(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)