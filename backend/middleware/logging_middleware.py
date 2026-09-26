import time
import logging
from fastapi import Request

logger = logging.getLogger(__name__)

async def logging_middleware (request: Request, call_next):
    start_time = time.time()
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    end_time = time.time()
    execution_time = end_time - start_time
    logger.info (
        f"Status: {response.status_code} | Time Taken: {execution_time:.4f} seconds"
    )
    return response