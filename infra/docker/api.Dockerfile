FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/workspace/backend:/workspace/apps/api/src:/workspace/apps/worker/src

WORKDIR /workspace
COPY apps/api /workspace/apps/api
COPY apps/worker /workspace/apps/worker
COPY backend /workspace/backend
RUN pip install --no-cache-dir /workspace/apps/api /workspace/apps/worker

RUN useradd --create-home --uid 10001 sara && chown -R sara:sara /workspace
USER sara
EXPOSE 8000
CMD ["fastapi", "run", "apps/api/src/sara_api/main.py", "--port", "8000"]
