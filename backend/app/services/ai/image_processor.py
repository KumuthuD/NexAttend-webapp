"""
Image Processor - Image Preprocessing Utilities
-----------------------------------------------
Provides essential image preprocessing functions for the AI pipeline.
Used by face detection and face recognition modules to prepare images.

Functions:
- Image resizing (with/without aspect ratio)
- Color space conversions (BGR↔RGB, Grayscale)
- Image cropping and rotation
- Normalization and enhancement
- Validation utilities

Author: Viraj
Date: Week 01 Day 4
"""

import cv2
import numpy as np
from typing import Tuple, Optional, Union, Literal


def resize_image(
    image: np.ndarray, 
    width: int, 
    height: int,
    interpolation: int = cv2.INTER_AREA
) -> np.ndarray:
    """
    Resize image to specified dimensions
    
    Args:
        image (np.ndarray): Input image
        width (int): Target width
        height (int): Target height
        interpolation (int): Interpolation method (default: INTER_AREA for downscaling)
    
    Returns:
        np.ndarray: Resized image
    """
    try:
        if not validate_image(image):
            raise ValueError("Invalid image array")
        
        resized = cv2.resize(image, (width, height), interpolation=interpolation)
        return resized
    
    except Exception as e:
        print(f"Error resizing image: {str(e)}")
        return image


def resize_with_aspect_ratio(
    image: np.ndarray,
    target_size: int,
    pad_color: Tuple[int, int, int] = (0, 0, 0)
) -> np.ndarray:
    """
    Resize image maintaining aspect ratio with padding
    
    Args:
        image (np.ndarray): Input image
        target_size (int): Target size (square output)
        pad_color (Tuple[int, int, int]): Padding color (default: black)
    
    Returns:
        np.ndarray: Resized image with padding
    """
    try:
        h, w = image.shape[:2]
        
        # Calculate scaling factor
        scale = min(target_size / w, target_size / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        
        # Resize image
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        # Create blank canvas
        if len(image.shape) == 3:
            canvas = np.full((target_size, target_size, image.shape[2]), pad_color, dtype=image.dtype)
        else:
            canvas = np.full((target_size, target_size), pad_color[0], dtype=image.dtype)
        
        # Calculate position to paste resized image
        x_offset = (target_size - new_w) // 2
        y_offset = (target_size - new_h) // 2
        
        # Paste resized image onto canvas
        if len(image.shape) == 3:
            canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
        else:
            canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
        
        return canvas
    
    except Exception as e:
        print(f"Error resizing with aspect ratio: {str(e)}")
        return image


def convert_bgr_to_rgb(image: np.ndarray) -> np.ndarray:
    """
    Convert BGR image to RGB format
    OpenCV uses BGR by default, but most AI models (DeepFace, MTCNN) expect RGB
    
    Args:
        image (np.ndarray): BGR image
    
    Returns:
        np.ndarray: RGB image
    """
    try:
        if len(image.shape) != 3 or image.shape[2] != 3:
            print("Warning: Image is not in BGR format (expected 3 channels)")
            return image
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return rgb_image
    
    except Exception as e:
        print(f"Error converting BGR to RGB: {str(e)}")
        return image


def convert_rgb_to_bgr(image: np.ndarray) -> np.ndarray:
    """
    Convert RGB image to BGR format
    Used when saving with OpenCV after processing
    
    Args:
        image (np.ndarray): RGB image
    
    Returns:
        np.ndarray: BGR image
    """
    try:
        if len(image.shape) != 3 or image.shape[2] != 3:
            print("Warning: Image is not in RGB format (expected 3 channels)")
            return image
        
        bgr_image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return bgr_image
    
    except Exception as e:
        print(f"Error converting RGB to BGR: {str(e)}")
        return image


def convert_to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Convert color image to grayscale
    
    Args:
        image (np.ndarray): Color image
    
    Returns:
        np.ndarray: Grayscale image
    """
    try:
        if len(image.shape) == 2:
            # Already grayscale
            return image
        
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return gray_image
    
    except Exception as e:
        print(f"Error converting to grayscale: {str(e)}")
        return image


def normalize_image(
    image: np.ndarray,
    method: Literal["0-1", "-1-1", "standardize"] = "0-1"
) -> np.ndarray:
    """
    Normalize pixel values
    
    Args:
        image (np.ndarray): Input image
        method (str): Normalization method
            - "0-1": Scale to [0, 1]
            - "-1-1": Scale to [-1, 1]
            - "standardize": Zero mean, unit variance
    
    Returns:
        np.ndarray: Normalized image
    """
    try:
        image_float = image.astype(np.float32)
        
        if method == "0-1":
            normalized = image_float / 255.0
        elif method == "-1-1":
            normalized = (image_float / 127.5) - 1.0
        elif method == "standardize":
            mean = np.mean(image_float)
            std = np.std(image_float)
            normalized = (image_float - mean) / (std + 1e-7)
        else:
            print(f"Unknown normalization method: {method}")
            normalized = image_float / 255.0
        
        return normalized
    
    except Exception as e:
        print(f"Error normalizing image: {str(e)}")
        return image


def crop_image(
    image: np.ndarray,
    x: int,
    y: int,
    width: int,
    height: int
) -> np.ndarray:
    """
    Crop image to specified region
    Used with face detection bounding boxes
    
    Args:
        image (np.ndarray): Input image
        x (int): X coordinate (left)
        y (int): Y coordinate (top)
        width (int): Width of crop region
        height (int): Height of crop region
    
    Returns:
        np.ndarray: Cropped image
    """
    try:
        img_height, img_width = image.shape[:2]
        
        # Ensure coordinates are within bounds
        x = max(0, min(x, img_width - 1))
        y = max(0, min(y, img_height - 1))
        
        # Ensure crop region is within image
        x2 = min(x + width, img_width)
        y2 = min(y + height, img_height)
        
        cropped = image[y:y2, x:x2]
        return cropped
    
    except Exception as e:
        print(f"Error cropping image: {str(e)}")
        return image


def rotate_image(
    image: np.ndarray,
    angle: float,
    scale: float = 1.0
) -> np.ndarray:
    """
    Rotate image by specified angle
    
    Args:
        image (np.ndarray): Input image
        angle (float): Rotation angle in degrees (positive = counter-clockwise)
        scale (float): Scaling factor (default: 1.0)
    
    Returns:
        np.ndarray: Rotated image
    """
    try:
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        
        # Get rotation matrix
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, scale)
        
        # Perform rotation
        rotated = cv2.warpAffine(image, rotation_matrix, (w, h))
        return rotated
    
    except Exception as e:
        print(f"Error rotating image: {str(e)}")
        return image


def flip_image(
    image: np.ndarray,
    direction: Literal["horizontal", "vertical", "both"] = "horizontal"
) -> np.ndarray:
    """
    Flip image horizontally, vertically, or both
    Useful for data augmentation
    
    Args:
        image (np.ndarray): Input image
        direction (str): Flip direction ("horizontal", "vertical", "both")
    
    Returns:
        np.ndarray: Flipped image
    """
    try:
        if direction == "horizontal":
            flipped = cv2.flip(image, 1)
        elif direction == "vertical":
            flipped = cv2.flip(image, 0)
        elif direction == "both":
            flipped = cv2.flip(image, -1)
        else:
            print(f"Unknown flip direction: {direction}")
            return image
        
        return flipped
    
    except Exception as e:
        print(f"Error flipping image: {str(e)}")
        return image


def enhance_brightness_contrast(
    image: np.ndarray,
    brightness: int = 0,
    contrast: int = 0
) -> np.ndarray:
    """
    Adjust brightness and contrast
    Useful for improving image quality in poor lighting
    
    Args:
        image (np.ndarray): Input image
        brightness (int): Brightness adjustment (-100 to 100)
        contrast (int): Contrast adjustment (-100 to 100)
    
    Returns:
        np.ndarray: Enhanced image
    """
    try:
        # Convert to float for calculations
        image_float = image.astype(np.float32)
        
        # Apply brightness
        if brightness != 0:
            if brightness > 0:
                shadow = brightness
                highlight = 255
            else:
                shadow = 0
                highlight = 255 + brightness
            alpha_b = (highlight - shadow) / 255
            gamma_b = shadow
            
            image_float = cv2.addWeighted(image_float, alpha_b, image_float, 0, gamma_b)
        
        # Apply contrast
        if contrast != 0:
            f = 131 * (contrast + 127) / (127 * (131 - contrast))
            alpha_c = f
            gamma_c = 127 * (1 - f)
            
            image_float = cv2.addWeighted(image_float, alpha_c, image_float, 0, gamma_c)
        
        # Clip values to valid range
        enhanced = np.clip(image_float, 0, 255).astype(image.dtype)
        return enhanced
    
    except Exception as e:
        print(f"Error enhancing brightness/contrast: {str(e)}")
        return image


def validate_image(image: np.ndarray) -> bool:
    """
    Validate if input is a valid image array
    
    Args:
        image (np.ndarray): Image to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        if image is None:
            return False
        
        if not isinstance(image, np.ndarray):
            return False
        
        if image.size == 0:
            return False
        
        if len(image.shape) not in [2, 3]:
            return False
        
        if len(image.shape) == 3 and image.shape[2] not in [1, 3, 4]:
            return False
        
        return True
    
    except:
        return False


def get_image_info(image: np.ndarray) -> dict:
    """
    Get detailed information about an image
    Useful for debugging
    
    Args:
        image (np.ndarray): Input image
    
    Returns:
        dict: Image information
    """
    try:
        if not validate_image(image):
            return {"valid": False, "error": "Invalid image"}
        
        h, w = image.shape[:2]
        channels = image.shape[2] if len(image.shape) == 3 else 1
        
        info = {
            "valid": True,
            "shape": image.shape,
            "height": h,
            "width": w,
            "channels": channels,
            "dtype": str(image.dtype),
            "min_value": np.min(image),
            "max_value": np.max(image),
            "mean_value": np.mean(image),
            "size_bytes": image.nbytes
        }
        
        return info
    
    except Exception as e:
        return {"valid": False, "error": str(e)}


# Test function for standalone testing
def test_image_processor():
    """
    Test all image processor functions
    """
    print("=" * 60)
    print("Testing Image Processor Functions")
    print("=" * 60)
    print()
    
    # Create a test image
    print("Creating test image (480x640x3)...")
    test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    print(f"✓ Test image created: {test_image.shape}")
    print()
    
    # Test 1: Resize
    print("Test 1: Resize image to 224x224...")
    resized = resize_image(test_image, 224, 224)
    print(f"✓ Resized shape: {resized.shape}")
    assert resized.shape == (224, 224, 3), "Resize failed"
    print()
    
    # Test 2: Resize with aspect ratio
    print("Test 2: Resize with aspect ratio (256x256)...")
    resized_ar = resize_with_aspect_ratio(test_image, 256)
    print(f"✓ Resized with AR shape: {resized_ar.shape}")
    assert resized_ar.shape == (256, 256, 3), "Aspect ratio resize failed"
    print()
    
    # Test 3: BGR to RGB
    print("Test 3: Convert BGR to RGB...")
    rgb_image = convert_bgr_to_rgb(test_image)
    print(f"✓ RGB image shape: {rgb_image.shape}")
    assert rgb_image.shape == test_image.shape, "BGR to RGB conversion failed"
    print()
    
    # Test 4: RGB to BGR
    print("Test 4: Convert RGB to BGR...")
    bgr_image = convert_rgb_to_bgr(rgb_image)
    print(f"✓ BGR image shape: {bgr_image.shape}")
    assert bgr_image.shape == test_image.shape, "RGB to BGR conversion failed"
    print()
    
    # Test 5: Grayscale
    print("Test 5: Convert to grayscale...")
    gray_image = convert_to_grayscale(test_image)
    print(f"✓ Grayscale shape: {gray_image.shape}")
    assert len(gray_image.shape) == 2, "Grayscale conversion failed"
    print()
    
    # Test 6: Normalize
    print("Test 6: Normalize image (0-1)...")
    normalized = normalize_image(test_image, "0-1")
    print(f"✓ Normalized range: [{np.min(normalized):.4f}, {np.max(normalized):.4f}]")
    assert normalized.max() <= 1.0, "Normalization failed"
    print()
    
    # Test 7: Crop
    print("Test 7: Crop image (100x100 region)...")
    cropped = crop_image(test_image, 50, 50, 100, 100)
    print(f"✓ Cropped shape: {cropped.shape}")
    assert cropped.shape[0] == 100 and cropped.shape[1] == 100, "Crop failed"
    print()
    
    # Test 8: Rotate
    print("Test 8: Rotate image by 45 degrees...")
    rotated = rotate_image(test_image, 45)
    print(f"✓ Rotated shape: {rotated.shape}")
    assert rotated.shape == test_image.shape, "Rotation failed"
    print()
    
    # Test 9: Flip
    print("Test 9: Flip image horizontally...")
    flipped = flip_image(test_image, "horizontal")
    print(f"✓ Flipped shape: {flipped.shape}")
    assert flipped.shape == test_image.shape, "Flip failed"
    print()
    
    # Test 10: Brightness/Contrast
    print("Test 10: Enhance brightness/contrast...")
    enhanced = enhance_brightness_contrast(test_image, brightness=20, contrast=10)
    print(f"✓ Enhanced shape: {enhanced.shape}")
    assert enhanced.shape == test_image.shape, "Enhancement failed"
    print()
    
    # Test 11: Validate
    print("Test 11: Validate image...")
    is_valid = validate_image(test_image)
    print(f"✓ Image is valid: {is_valid}")
    assert is_valid == True, "Validation failed"
    print()
    
    # Test 12: Get info
    print("Test 12: Get image info...")
    info = get_image_info(test_image)
    print(f"✓ Image info:")
    print(f"  - Shape: {info['shape']}")
    print(f"  - Channels: {info['channels']}")
    print(f"  - Dtype: {info['dtype']}")
    print(f"  - Size: {info['size_bytes']} bytes")
    print()
    
    print("=" * 60)
    print("✓ ALL TESTS PASSED!")
    print("=" * 60)
    print()
    print("Image Processor is ready for use!")
    print("Branch: feature/ai/image-processor")
    print("=" * 60)


if __name__ == "__main__":
    # Run tests if executed directly
    test_image_processor()
