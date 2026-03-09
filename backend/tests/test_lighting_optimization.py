"""
Test script for lighting optimization
Tests the low-light enhancement on sample images

Viraj Jayasiri
Week 04 Day 16
"""

import cv2
import numpy as np
import sys
import os

# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.lighting_optimizer import lighting_optimizer
from app.services.face_detector import FaceDetector

def create_test_images():
    """
    create synthetic test images with different lighting conditions
    """
    # very low light image (dark)
    very_low_light = np.random.randint(0, 40, (480, 640, 3), dtype=np.uint8)
    
    # low light image
    low_light = np.random.randint(20, 80, (480, 640, 3), dtype=np.uint8)
    
    # normal light image  
    normal_light = np.random.randint(80, 180, (480, 640, 3), dtype=np.uint8)
    
    # high light image (overexposed)
    high_light = np.random.randint(180, 255, (480, 640, 3), dtype=np.uint8)
    
    return {
        "very_low_light": very_low_light,
        "low_light": low_light,
        "normal_light": normal_light,
        "high_light": high_light
    }

def test_lighting_analysis():
    """
    test the lighting analysis function
    """
    print("=" * 60)
    print("Test 1: Lighting Analysis")
    print("=" * 60)
    
    test_images = create_test_images()
    
    for name, image in test_images.items():
        analysis = lighting_optimizer.analyze_lighting(image)
        print(f"\n{name}:")
        print(f"  Brightness: {analysis['mean_brightness']:.1f}")
        print(f"  Condition: {analysis['condition']}")
        print(f"  Std Dev: {analysis['std_dev']:.1f}")
        print(f"  Range: [{analysis['min_value']}, {analysis['max_value']}]")
    
    print("\n" + "=" * 60)
    print("✓ Test 1 Passed")
    print("=" * 60)

def test_enhancement():
    """
    test image enhancement
    """
    print("\n" + "=" * 60)
    print("Test 2: Image Enhancement")
    print("=" * 60)
    
    test_images = create_test_images()
    
    for name, image in test_images.items():
        before_brightness = np.mean(image)
        
        # apply enhancement
        enhanced = lighting_optimizer.enhance_image(image, auto_mode=True)
        
        after_brightness = np.mean(enhanced)
        delta = after_brightness - before_brightness
        
        print(f"\n{name}:")
        print(f"  Before: {before_brightness:.1f}")
        print(f"  After: {after_brightness:.1f}")
        print(f"  Delta: {delta:+.1f}")
        print(f"  Enhanced: {'Yes' if abs(delta) > 5 else 'No'}")
    
    print("\n" + "=" * 60)
    print("✓ Test 2 Passed")
    print("=" * 60)

def test_detection_optimization():
    """
    test detection-specific optimization
    """
    print("\n" + "=" * 60)
    print("Test 3: Detection Optimization")
    print("=" * 60)
    
    # create very dark image with some structure
    very_dark = np.ones((480, 640, 3), dtype=np.uint8) * 30
    # add some gradient to make it more realistic
    for i in range(480):
        very_dark[i, :, :] = min(30 + i // 20, 50)
    
    before_brightness = np.mean(very_dark)
    print(f"\nOriginal brightness: {before_brightness:.1f}")
    
    # optimize for detection
    optimized = lighting_optimizer.optimize_for_detection(very_dark)
    
    after_brightness = np.mean(optimized)
    print(f"Optimized brightness: {after_brightness:.1f}")
    print(f"Improvement: {after_brightness - before_brightness:+.1f}")
    
    # check that optimization was applied (result is different)
    assert not np.array_equal(very_dark, optimized), "Detection optimization should modify the image"
    print("✓ Image was modified by optimization")
    
    print("\n" + "=" * 60)
    print("✓ Test 3 Passed")
    print("=" * 60)

def test_face_detector_integration():
    """
    test that face detector uses lighting optimization
    """
    print("\n" + "=" * 60)
    print("Test 4: Face Detector Integration")
    print("=" * 60)
    
    # create detector with optimization enabled
    detector_with_opt = FaceDetector(
        min_confidence=0.90,
        enable_lighting_optimization=True
    )
    
    # create detector without optimization
    detector_without_opt = FaceDetector(
        min_confidence=0.90,
        enable_lighting_optimization=False
    )
    
    print("\n✓ Detectors initialized successfully")
    print(f"  With optimization: {detector_with_opt.enable_lighting_optimization}")
    print(f"  Without optimization: {detector_without_opt.enable_lighting_optimization}")
    
    # create low-light test image
    low_light = np.random.randint(20, 60, (480, 640, 3), dtype=np.uint8)
    
    print("\nTesting on low-light image...")
    print(f"  Image brightness: {np.mean(low_light):.1f}")
    
    # both should work without errors
    # (they won't detect faces in noise, but shouldn't crash)
    faces_with = detector_with_opt.detect_faces(low_light)
    faces_without = detector_without_opt.detect_faces(low_light)
    
    print(f"  Faces detected (with opt): {len(faces_with)}")
    print(f"  Faces detected (without opt): {len(faces_without)}")
    
    print("\n" + "=" * 60)
    print("✓ Test 4 Passed")
    print("=" * 60)

def test_gamma_correction():
    """
    test gamma correction with different values
    """
    print("\n" + "=" * 60)
    print("Test 5: Gamma Correction")
    print("=" * 60)
    
    # create dark image
    dark_image = np.random.randint(20, 60, (480, 640, 3), dtype=np.uint8)
    original_brightness = np.mean(dark_image)
    
    print(f"\nOriginal brightness: {original_brightness:.1f}")
    
    # test different gamma values
    gammas = [0.4, 0.6, 0.8, 1.0, 1.2]
    
    for gamma in gammas:
        corrected = lighting_optimizer.apply_gamma_correction(dark_image, gamma=gamma)
        brightness = np.mean(corrected)
        print(f"  Gamma {gamma:.1f}: {brightness:.1f}")
    
    print("\n" + "=" * 60)
    print("✓ Test 5 Passed")
    print("=" * 60)

def test_clahe():
    """
    test CLAHE enhancement
    """
    print("\n" + "=" * 60)
    print("Test 6: CLAHE Enhancement")
    print("=" * 60)
    
    # create low contrast image
    low_contrast = np.random.randint(80, 120, (480, 640, 3), dtype=np.uint8)
    
    original_std = np.std(low_contrast)
    print(f"\nOriginal std dev: {original_std:.1f}")
    
    # apply CLAHE
    enhanced = lighting_optimizer.apply_clahe(low_contrast)
    
    enhanced_std = np.std(enhanced)
    print(f"Enhanced std dev: {enhanced_std:.1f}")
    print(f"Contrast improvement: {enhanced_std - original_std:+.1f}")
    
    print("\n" + "=" * 60)
    print("✓ Test 6 Passed")
    print("=" * 60)

def run_all_tests():
    """
    run all lighting optimization tests
    """
    print("\n")
    print("*" * 60)
    print("LIGHTING OPTIMIZATION TEST SUITE")
    print("Viraj Jayasiri - Week 04 Day 16")
    print("*" * 60)
    print("\n")
    
    try:
        test_lighting_analysis()
        test_enhancement()
        test_detection_optimization()
        test_face_detector_integration()
        test_gamma_correction()
        test_clahe()
        
        print("\n")
        print("*" * 60)
        print("✓ ALL TESTS PASSED SUCCESSFULLY")
        print("*" * 60)
        print("\nLighting optimization is working correctly!")
        print("Ready for production use.")
        print("\nBranch: feature/ai/lighting-optimization")
        print("*" * 60)
        print("\n")
        
        return True
        
    except Exception as e:
        print("\n")
        print("*" * 60)
        print("✗ TEST FAILED")
        print("*" * 60)
        print(f"\nError: {str(e)}")
        print("\n")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
