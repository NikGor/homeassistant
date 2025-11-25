import asyncio
import logging
from typing import Any
from homeassistant.webapp.tools.fast_image_generation_tool import fast_image_generation_tool
from homeassistant.webapp.tools.profi_image_generation_tool import profi_image_generation_tool

logger = logging.getLogger(__name__)


def infer_aspect_ratio(item: dict[str, Any]) -> str:
    """Infer aspect ratio from layout_hint for profi image generation"""
    layout_hint = item.get("layout_hint", "full_width")
    
    if layout_hint == "emphasis":
        return "16:9"
    elif layout_hint == "half_width":
        return "4:3"
    elif layout_hint == "inline":
        return "1:1"
    else:
        return "16:9"


async def process_images_in_ui_answer(ui_answer: dict[str, Any]) -> dict[str, Any]:
    """
    Process all image_prompt fields in UIAnswer structure.
    Generates images and replaces image_prompt values with base64 strings.
    
    - Fast model: for Card.image_prompt (parallel generation)
    - Profi model: for type:image items (sequential generation)
    
    Args:
        ui_answer: UIAnswer dict from AI Agent response
        
    Returns:
        Modified ui_answer dict with image_prompt replaced by base64
    """
    if not ui_answer or "items" not in ui_answer:
        return ui_answer
    
    logger.info("image_proc_001: Starting image generation for UIAnswer")
    
    fast_prompts = []
    profi_prompts = []
    
    for item in ui_answer["items"]:
        item_type = item.get("type")
        
        if item_type == "image":
            content = item.get("content", {})
            prompt = content.get("image_prompt")
            if prompt:
                profi_prompts.append({
                    "prompt": prompt,
                    "item": item,
                    "content": content,
                    "aspect_ratio": infer_aspect_ratio(item)
                })
                logger.info(f"image_proc_002: Found profi image prompt: \033[36m{prompt[:50]}...\033[0m")
        
        elif item_type == "card_grid":
            content = item.get("content", {})
            cards = content.get("cards", [])
            for card in cards:
                if card.get("type") == "card" and card.get("image_prompt"):
                    prompt = card["image_prompt"]
                    fast_prompts.append({
                        "prompt": prompt,
                        "card": card
                    })
                    logger.info(f"image_proc_003: Found fast card prompt: \033[36m{prompt[:50]}...\033[0m")
    
    logger.info(f"image_proc_004: Collected \033[33m{len(fast_prompts)}\033[0m fast + \033[33m{len(profi_prompts)}\033[0m profi prompts")
    
    if fast_prompts:
        logger.info("image_proc_005: Starting parallel fast image generation")
        fast_tasks = [
            fast_image_generation_tool(p["prompt"]) 
            for p in fast_prompts
        ]
        fast_results = await asyncio.gather(*fast_tasks, return_exceptions=True)
        
        for prompt_info, result in zip(fast_prompts, fast_results):
            if isinstance(result, Exception):
                logger.error("image_proc_error_001: Fast generation failed")
                continue
            
            if result.get("success") and result.get("image"):
                base64_img = result["image"]["base64"]
                prompt_info["card"]["image_prompt"] = base64_img
                logger.info("image_proc_006: Replaced fast card prompt")
            else:
                logger.warning("image_proc_warning_001: Fast generation unsuccessful")
    
    if profi_prompts:
        logger.info("image_proc_007: Starting sequential profi image generation")
        for prompt_info in profi_prompts:
            try:
                result = await profi_image_generation_tool(
                    prompt=prompt_info["prompt"],
                    aspect_ratio=prompt_info["aspect_ratio"],
                    image_size="1K"
                )
                
                if result.get("success") and result.get("images"):
                    base64_img = result["images"][0]["base64"]
                    prompt_info["content"]["image_prompt"] = base64_img
                    logger.info("image_proc_008: Replaced profi image prompt")
                else:
                    logger.warning("image_proc_warning_002: Profi generation unsuccessful")
            except Exception as e:
                logger.error("image_proc_error_002: Profi generation failed")
    
    logger.info("image_proc_009: Image generation complete")
    return ui_answer
