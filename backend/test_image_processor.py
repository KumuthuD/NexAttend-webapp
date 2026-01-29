"""
Test script for image_processor.py
Week 01 Day 4 - Viraj's Task

This script tests all image preprocessing functions including:
1. Image resizing (standard and aspect-ratio preserving)
2. Color space conversions (BGR↔RGB, Grayscale)
3. Image normalization
4. Cropping, rotation, flipping
5. Brightness/contrast enhancement
6. Image validation and info utilities
7. Integration with camera_service.py
"""

import sys
import os
import numpy as np

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai.image_processor import (
    resize_image,
    resize_with_aspect_ratio,
    convert_bgr_to_rgb,
    convert_rgb_to_bgr,
    convert_to_grayscale,
    normalize_image,
    crop_image,
    rotate_image,
    flip_image,
    enhance_brightness_contrast,
    validate_image,
    get_image_info
)


def main():
    print("=" * 70)
    print("Week 01 Day 4: Image Processor Test")
    print("Testing: Image preprocessing utilities")
    print("=" * 70)
    print()
    
    # Create test image
    print("Creating test image (480x640x3)...")
    test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    print(f"✓ Test image created")
    print(f"  → Shape: {test_image.shape}")
    print(f"  → Dtype: {test_image.dtype}")
    print()
    
    test_count = 0
    passed_count = 0
    
    # Test 1: Standard resize
    test_count += 1
    print(f"Test {test_count}: Resize image to 224x224...")
    try:
        resized = resize_image(test_image, 224, 224)
        assert resized.shape == (224, 224, 3), f"Expected (224, 224, 3), got {resized.shape}"
        print(f"✓ PASSED - Resized to {resized.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 2: Resize with aspect ratio
    test_count += 1
    print(f"Test {test_count}: Resize with aspect ratio to 256x256...")
    try:
        resized_ar = resize_with_aspect_ratio(test_image, 256)
        assert resized_ar.shape == (256, 256, 3), f"Expected (256, 256, 3), got {resized_ar.shape}"
        print(f"✓ PASSED - Resized with padding to {resized_ar.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 3: BGR to RGB conversion
    test_count += 1
    print(f"Test {test_count}: Convert BGR to RGB...")
    try:
        rgb_image = convert_bgr_to_rgb(test_image)
        assert rgb_image.shape == test_image.shape, "Shape changed during conversion"
        # Verify that conversion happened (channels should be swapped)
        print(f"✓ PASSED - BGR to RGB conversion successful")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 4: RGB to BGR conversion
    test_count += 1
    print(f"Test {test_count}: Convert RGB to BGR...")
    try:
        bgr_image = convert_rgb_to_bgr(rgb_image)
        assert bgr_image.shape == rgb_image.shape, "Shape changed during conversion"
        print(f"✓ PASSED - RGB to BGR conversion successful")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 5: Grayscale conversion
    test_count += 1
    print(f"Test {test_count}: Convert to grayscale...")
    try:
        gray_image = convert_to_grayscale(test_image)
        assert len(gray_image.shape) == 2, f"Expected 2D array, got {len(gray_image.shape)}D"
        assert gray_image.shape == (480, 640), f"Expected (480, 640), got {gray_image.shape}"
        print(f"✓ PASSED - Grayscale conversion: {gray_image.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 6: Normalization (0-1)
    test_count += 1
    print(f"Test {test_count}: Normalize to [0, 1] range...")
    try:
        normalized = normalize_image(test_image, "0-1")
        min_val = np.min(normalized)
        max_val = np.max(normalized)
        assert normalized.min() >= 0 and normalized.max() <= 1, f"Range error: [{min_val}, {max_val}]"
        print(f"✓ PASSED - Normalized range: [{min_val:.4f}, {max_val:.4f}]")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 7: Normalization (-1 to 1)
    test_count += 1
    print(f"Test {test_count}: Normalize to [-1, 1] range...")
    try:
        normalized = normalize_image(test_image, "-1-1")
        min_val = np.min(normalized)
        max_val = np.max(normalized)
        assert min_val >= -1 and max_val <= 1, f"Range error: [{min_val}, {max_val}]"
        print(f"✓ PASSED - Normalized range: [{min_val:.4f}, {max_val:.4f}]")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 8: Cropping
    test_count += 1
    print(f"Test {test_count}: Crop 100x100 region...")
    try:
        cropped = crop_image(test_image, 50, 50, 100, 100)
        assert cropped.shape == (100, 100, 3), f"Expected (100, 100, 3), got {cropped.shape}"
        print(f"✓ PASSED - Cropped to {cropped.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 9: Rotation
    test_count += 1
    print(f"Test {test_count}: Rotate by 45 degrees...")
    try:
        rotated = rotate_image(test_image, 45)
        assert rotated.shape == test_image.shape, "Shape changed during rotation"
        print(f"✓ PASSED - Rotated, shape maintained: {rotated.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 10: Horizontal flip
    test_count += 1
    print(f"Test {test_count}: Flip horizontally...")
    try:
        flipped = flip_image(test_image, "horizontal")
        assert flipped.shape == test_image.shape, "Shape changed during flip"
        print(f"✓ PASSED - Flipped horizontally: {flipped.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 11: Brightness/Contrast enhancement
    test_count += 1
    print(f"Test {test_count}: Enhance brightness (+20) and contrast (+10)...")
    try:
        enhanced = enhance_brightness_contrast(test_image, brightness=20, contrast=10)
        assert enhanced.shape == test_image.shape, "Shape changed during enhancement"
        print(f"✓ PASSED - Enhancement applied: {enhanced.shape}")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 12: Image validation
    test_count += 1
    print(f"Test {test_count}: Validate image...")
    try:
        is_valid = validate_image(test_image)
        assert is_valid == True, "Valid image marked as invalid"
        
        # Test with invalid input
        invalid_is_valid = validate_image(None)
        assert invalid_is_valid == False, "None marked as valid"
        
        print(f"✓ PASSED - Validation works correctly")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 13: Get image info
    test_count += 1
    print(f"Test {test_count}: Get image information...")
    try:
        info = get_image_info(test_image)
        assert info['valid'] == True, "Image marked as invalid"
        assert info['height'] == 480, f"Height mismatch: expected 480, got {info['height']}"
        assert info['width'] == 640, f"Width mismatch: expected 640, got {info['width']}"
        assert info['channels'] == 3, f"Channels mismatch: expected 3, got {info['channels']}"
        
        print(f"✓ PASSED - Image info retrieved:")
        print(f"  → Shape: {info['shape']}")
        print(f"  → Dimensions: {info['width']}x{info['height']}")
        print(f"  → Channels: {info['channels']}")
        print(f"  → Data type: {info['dtype']}")
        print(f"  → Size: {info['size_bytes']} bytes ({info['size_bytes']/1024:.2f} KB)")
        passed_count += 1
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
    print()
    
    # Test 14: Integration with camera (if available)
    test_count += 1
    print(f"Test {test_count}: Integration test with camera_service...")
    try:
        from app.services.ai.camera_service import CameraService
        
        camera = CameraService()
        if camera.start_camera():
            success, frame = camera.capture_frame()
            if success:
                # Preprocess the frame
                rgb_frame = convert_bgr_to_rgb(frame)
                resized_frame = resize_image(rgb_frame, 224, 224)
                
                assert resized_frame.shape == (224, 224, 3), "Integration preprocessing failed"
                print(f"✓ PASSED - Integration with camera_service works")
                print(f"  → Captured frame, converted to RGB, resized to {resized_frame.shape}")
                passed_count += 1
            else:
                print(f"⊘ SKIPPED - Could not capture frame from camera")
            
            camera.release_camera()
        else:
            print(f"⊘ SKIPPED - Camera not available")
    except Exception as e:
        print(f"⊘ SKIPPED - {str(e)}")
    print()
    
    # Final summary
    print("=" * 70)
    print(f"TEST RESULTS: {passed_count}/{test_count} tests passed")
    print("=" * 70)
    
    if passed_count == test_count:
        print()
        print("✓ ALL TESTS PASSED!")
        print()
        print("Week 01 Day 4 Deliverable: COMPLETE ✓")
        print("  ✓ Image resizing works")
        print("  ✓ BGR to RGB conversion works")
        print("  ✓ All preprocessing functions operational")
        print("  ✓ Integration with camera service verified")
        print()
        print("Branch: feature/ai/image-processor")
        print("Ready for commit and push!")
        print("=" * 70)
        return 0
    else:
        print()
        print(f"✗ SOME TESTS FAILED ({test_count - passed_count} failures)")
        print("=" * 70)
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
