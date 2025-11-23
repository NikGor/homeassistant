import base64
import logging
import os
from typing import Any, Literal
from io import BytesIO
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

logger = logging.getLogger(__name__)
load_dotenv()


async def fast_image_generation_tool(
    prompt: str,
    aspect_ratio: Literal["1:1", "3:4", "4:3", "9:16", "16:9"] = "1:1",
    number_of_images: int = 1,
) -> dict[str, Any]:
    """
    Fast image generation using Imagen 4 Fast model for quick, simple images.
    Optimized for speed with smaller image sizes. Best for icons, simple graphics, quick previews.

    Args:
        prompt: Text description of the image to generate
        aspect_ratio: Image aspect ratio (1:1, 3:4, 4:3, 9:16, 16:9)
        number_of_images: Number of images to generate (1-4)

    Returns:
        Dict with generated images as base64 strings and metadata
    """
    logger.info(
        f"fast_image_gen_001: Fast generation requested for: \033[36m{prompt[:50]}...\033[0m"
    )
    logger.info(
        f"fast_image_gen_002: Parameters - ratio: \033[33m{aspect_ratio}\033[0m, count: \033[33m{number_of_images}\033[0m"
    )

    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error(
                "fast_image_gen_error_001: \033[31mGEMINI_API_KEY not found\033[0m"
            )
            return {
                "success": False,
                "message": "GEMINI_API_KEY not configured",
                "prompt": prompt,
            }

        if number_of_images < 1 or number_of_images > 4:
            logger.warning(
                f"fast_image_gen_warning_001: Invalid count \033[33m{number_of_images}\033[0m, using 1"
            )
            number_of_images = 1

        client = genai.Client(api_key=api_key)

        config = types.GenerateImagesConfig(
            number_of_images=number_of_images,
            aspect_ratio=aspect_ratio,
            person_generation="allow_adult",
        )

        logger.info("fast_image_gen_003: Calling \033[36mImagen 4 Fast\033[0m")
        response = client.models.generate_images(
            model="imagen-4.0-fast-generate-001",
            prompt=prompt,
            config=config,
        )

        if not response or not response.generated_images:
            logger.warning("fast_image_gen_warning_002: Empty response from API")
            return {
                "success": False,
                "message": "No images generated",
                "prompt": prompt,
            }

        images_data = []
        for idx, generated_image in enumerate(response.generated_images):
            try:
                image_obj = generated_image.image._pil_image
                img_byte_arr = BytesIO()
                image_obj.save(img_byte_arr, format="PNG")
                img_byte_arr.seek(0)
                image_bytes = img_byte_arr.read()

                image_base64 = base64.b64encode(image_bytes).decode("utf-8")

                images_data.append(
                    {
                        "index": idx + 1,
                        "base64": image_base64,
                        "format": "PNG",
                        "size": {
                            "width": image_obj.width,
                            "height": image_obj.height,
                        },
                    }
                )

                logger.info(
                    f"fast_image_gen_004: Image {idx + 1} - \033[33m{image_obj.width}x{image_obj.height}\033[0m"
                )

            except Exception as img_error:
                logger.error(
                    f"fast_image_gen_error_003: Failed to process image {idx + 1}: \033[31m{img_error!s}\033[0m"
                )
                continue

        if not images_data:
            return {
                "success": False,
                "message": "Failed to process generated images",
                "prompt": prompt,
            }

        logger.info(
            f"fast_image_gen_005: Successfully generated \033[33m{len(images_data)}\033[0m images"
        )

        return {
            "success": True,
            "prompt": prompt,
            "images": images_data,
            "count": len(images_data),
            "aspect_ratio": aspect_ratio,
            "model": "imagen-4.0-fast",
            "message": f"Successfully generated {len(images_data)} image(s) using fast model",
        }

    except Exception as e:
        logger.error(f"fast_image_gen_error_002: \033[31m{e!s}\033[0m")
        return {
            "success": False,
            "message": f"Fast image generation failed: {e!s}",
            "prompt": prompt,
        }
