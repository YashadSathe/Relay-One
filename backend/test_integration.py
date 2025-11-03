import asyncio
import logging
import traceback

# --- 1. Configure logging ---
# This ensures we see *all* error messages in the terminal
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# This is mock data, just like the pipeline would create
mock_result = {
    "topic": "My Test Topic from Script (Notion)",
    "original_post": "This was the first draft.",
    "final_post": "This is the final, much improved post.",
    "score": 9,
    "feedback": "The post was excellent.",
    "loops": 2
}

async def main():
    print("--- Testing Integrations ---")

    # We import here so logging is already configured
    from linkedin_ai.integration import save_to_notion, send_to_make

    # --- 2. Test Notion ---
    try:
        logging.info("Attempting to save to Notion...")
        notion_success = await save_to_notion(mock_result, is_manual=True)

        if notion_success:
            logging.info("✅✅✅ Notion test SUCCESSFUL. ✅✅✅")
        else:
            logging.error("❌❌❌ Notion test FAILED. See error log above. ❌❌❌")

    except Exception as e:
        logging.error(f"--- Notion CRASHED --- {e}")
        traceback.print_exc()

    print("-" * 30)

    # --- 3. Test Make ---
    try:
        logging.info("Attempting to send to Make...")
        make_success = await send_to_make(mock_result)

        if Make_success:
            logging.info("✅✅✅ Make test SUCCESSFUL. ✅✅✅")
        else:
            logging.error("❌❌❌ Make test FAILED. See error log above. ❌❌❌")

    except Exception as e:
        logging.error(f"--- Make CRASHED --- {e}")
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())