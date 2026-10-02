ARG BUILD_FROM=python:3.12-slim
FROM ${BUILD_FROM}

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DATA_DIR=/data

WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --requirement requirements.txt
COPY app ./app
COPY run.sh ./run.sh
RUN chmod a+x ./run.sh

EXPOSE 8099
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import socket; socket.create_connection(('127.0.0.1', 8099), timeout=3).close()"

CMD ["/app/run.sh"]
