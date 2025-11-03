from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Single OpenAI client instance
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))