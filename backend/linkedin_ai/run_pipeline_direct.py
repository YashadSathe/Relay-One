import asyncio
from pipeline import run_pipeline

if __name__ == "__main__":
    asyncio.run(run_pipeline(brand_brief="", manual_topic=None))