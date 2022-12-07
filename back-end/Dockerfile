FROM python:3.10
WORKDIR /code/app
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY ./app /code/app
CMD ["uvicorn", "server.app:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "8090", "--reload"]