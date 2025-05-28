# analytics/Dockerfile
FROM python:3.10

WORKDIR /app

COPY analyze.py .
RUN pip install pandas

CMD ["tail", "-f", "/dev/null"]
