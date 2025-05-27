FROM python:3.13.3

WORKDIR /src/backend
RUN python -m pip install Django
RUN python -m pip install django-cors-headers
RUN python -m pip install channels
RUN python -m pip install channels_redis
RUN python -m pip install daphne

COPY ./ ./

EXPOSE 8000

CMD daphne -b 0.0.0.0 -p 8000 main.asgi:application