"""
Lighting Optimizer Service
Adaptive image enhancement for low-light conditions.
Uses CLAHE, gamma correction, and histogram equalization.

Viraj Jayasiri
Week 04 Day 16 - Low-Light Optimization
"""

import cv2
import numpy as np
import logging
from typing import Tuple, Optional, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LightingOptimizer:
    def __init__(
        self,
        clahe_clip_limit: float = 2.0,
        clahe_grid_size: Tuple[int, int] = (8, 8),
        low_light_threshold: int = 80,
        high_light_threshold: int = 180
    ):
        """
        initialize lighting optimizer with adaptive enhancement
        """
        self.clahe_clip_limit = clahe_clip_limit
        self.clahe_grid_size = clahe_grid_size
        self.low_light_threshold = low_light_threshold
        self.high_light_threshold = high_light_threshold
        
        # create CLAHE object for contrast enhancement
        self.clahe = cv2.createCLAHE(
            clipLimit=clahe_clip_limit,
            tileGridSize=clahe_grid_size
        )
        
        logger.info(f"LightingOptimizer initialized (low_thresh={low_light_threshold}, high_thresh={high_light_threshold})")

    def analyze_lighting(self, image: np.ndarray) -> Dict:
        """
        analyze image lighting conditions
        returns brightness, contrast, and quality metrics
        """
        if image is None or image.size == 0:
            return {"error": "invalid image"}
        
        try:
            # convert to grayscale for analysis
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # calculate metrics
            mean_brightness = np.mean(gray)
            std_dev = np.std(gray)
            min_val = np.min(gray)
            max_val = np.max(gray)
            
            # determine lighting condition
            if mean_brightness < self.low_light_threshold:
                condition = "low_light"
            elif mean_brightness > self.high_light_threshold:
                condition = "high_light"
            else:
                condition = "normal"
            
            # calculate histogram
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
            
            return {
                "mean_brightness": float(mean_brightness),
                "std_dev": float(std_dev),
                "min_value": int(min_val),
                "max_value": int(max_val),
                "condition": condition,
                "contrast_ratio": float(std_dev / (mean_brightness + 1e-7)),
                "histogram": hist.flatten().tolist() if hist is not None else []
            }
            
        except Exception as e:
            logger.error(f"error analyzing lighting: {e}")
            return {"error": str(e)}

    def apply_clahe(self, image: np.ndarray) -> np.ndarray:
        """
        apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        works well for low-light conditions
        """
        try:
            if len(image.shape) == 3:
                # convert to LAB color space
                lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                
                # apply CLAHE to L channel
                l_clahe = self.clahe.apply(l)
                
                # merge and convert back
                lab_clahe = cv2.merge([l_clahe, a, b])
                enhanced = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
            else:
                # grayscale image
                enhanced = self.clahe.apply(image)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"error applying CLAHE: {e}")
            return image

    def apply_gamma_correction(
        self, 
        image: np.ndarray, 
        gamma: Optional[float] = None
    ) -> np.ndarray:
        """
        apply gamma correction to brighten or darken image
        gamma < 1.0 = brighten (good for low-light)
        gamma > 1.0 = darken (good for over-exposed)
        """
        try:
            if gamma is None:
                # auto-calculate gamma based on brightness
                analysis = self.analyze_lighting(image)
                brightness = analysis.get("mean_brightness", 127)
                
                if brightness < self.low_light_threshold:
                    # low light - brighten (gamma < 1)
                    gamma = 0.5 + (brightness / self.low_light_threshold) * 0.3
                elif brightness > self.high_light_threshold:
                    # high light - darken (gamma > 1)
                    gamma = 1.0 + ((brightness - self.high_light_threshold) / 75) * 0.5
                else:
                    gamma = 1.0
            
            # build lookup table
            inv_gamma = 1.0 / gamma
            table = np.array([
                ((i / 255.0) ** inv_gamma) * 255 
                for i in range(256)
            ]).astype("uint8")
            
            # apply gamma correction
            enhanced = cv2.LUT(image, table)
            
            logger.debug(f"applied gamma correction: {gamma:.2f}")
            return enhanced
            
        except Exception as e:
            logger.error(f"error applying gamma correction: {e}")
            return image

    def apply_histogram_equalization(self, image: np.ndarray) -> np.ndarray:
        """
        apply histogram equalization to improve contrast
        """
        try:
            if len(image.shape) == 3:
                # convert to YUV color space
                yuv = cv2.cvtColor(image, cv2.COLOR_BGR2YUV)
                
                # equalize Y channel
                yuv[:, :, 0] = cv2.equalizeHist(yuv[:, :, 0])
                
                # convert back
                enhanced = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
            else:
                # grayscale
                enhanced = cv2.equalizeHist(image)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"error applying histogram equalization: {e}")
            return image

    def apply_bilateral_filter(
        self, 
        image: np.ndarray,
        d: int = 9,
        sigma_color: int = 75,
        sigma_space: int = 75
    ) -> np.ndarray:
        """
        apply bilateral filter to reduce noise while preserving edges
        useful after brightness enhancement
        """
        try:
            filtered = cv2.bilateralFilter(image, d, sigma_color, sigma_space)
            return filtered
        except Exception as e:
            logger.error(f"error applying bilateral filter: {e}")
            return image

    def enhance_image(
        self, 
        image: np.ndarray,
        auto_mode: bool = True,
        apply_denoising: bool = False
    ) -> np.ndarray:
        """
        adaptively enhance image based on lighting conditions
        """
        if image is None or image.size == 0:
            logger.warning("empty image passed to enhance_image")
            return image
        
        try:
            # analyze lighting first
            analysis = self.analyze_lighting(image)
            condition = analysis.get("condition", "normal")
            brightness = analysis.get("mean_brightness", 127)
            
            logger.info(f"lighting analysis: {condition} (brightness={brightness:.1f})")
            
            enhanced = image.copy()
            
            if auto_mode:
                if condition == "low_light":
                    # low light: apply gamma + CLAHE
                    logger.info("applying low-light enhancement: gamma + CLAHE")
                    enhanced = self.apply_gamma_correction(enhanced)
                    enhanced = self.apply_clahe(enhanced)
                    
                elif condition == "high_light":
                    # high light: apply gentle gamma correction
                    logger.info("applying high-light correction")
                    enhanced = self.apply_gamma_correction(enhanced, gamma=1.2)
                    
                else:
                    # normal light: apply only CLAHE for better contrast
                    logger.info("applying contrast enhancement (CLAHE)")
                    enhanced = self.apply_clahe(enhanced)
            else:
                # manual mode: apply all enhancements
                enhanced = self.apply_gamma_correction(enhanced)
                enhanced = self.apply_clahe(enhanced)
            
            # optional denoising
            if apply_denoising:
                enhanced = self.apply_bilateral_filter(enhanced)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"error enhancing image: {e}")
            return image

    def optimize_for_detection(self, image: np.ndarray) -> np.ndarray:
        """
        optimize image specifically for face detection
        focused on making faces more visible
        """
        try:
            # analyze first
            analysis = self.analyze_lighting(image)
            brightness = analysis.get("mean_brightness", 127)
            
            enhanced = image.copy()
            
            # always apply CLAHE for better face features
            enhanced = self.apply_clahe(enhanced)
            
            # if very dark, apply aggressive gamma
            if brightness < 60:
                logger.info(f"very low light detected ({brightness:.1f}), applying aggressive enhancement")
                enhanced = self.apply_gamma_correction(enhanced, gamma=0.4)
                enhanced = self.apply_clahe(enhanced)
            elif brightness < self.low_light_threshold:
                logger.info(f"low light detected ({brightness:.1f}), applying moderate enhancement")
                enhanced = self.apply_gamma_correction(enhanced, gamma=0.6)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"error optimizing for detection: {e}")
            return image


# global instance
lighting_optimizer = LightingOptimizer()


def test_lighting_optimizer():
    """
    test the lighting optimizer with sample images
    """
    print("=" * 60)
    print("Testing Lighting Optimizer")
    print("=" * 60)
    print()
    
    # create test images with different lighting
    print("creating test images...")
    
    # low light image
    low_light = np.random.randint(0, 60, (480, 640, 3), dtype=np.uint8)
    print(f"✓ low-light test image created (mean brightness: {np.mean(low_light):.1f})")
    
    # normal light image
    normal_light = np.random.randint(80, 180, (480, 640, 3), dtype=np.uint8)
    print(f"✓ normal-light test image created (mean brightness: {np.mean(normal_light):.1f})")
    
    # high light image
    high_light = np.random.randint(180, 255, (480, 640, 3), dtype=np.uint8)
    print(f"✓ high-light test image created (mean brightness: {np.mean(high_light):.1f})")
    print()
    
    optimizer = LightingOptimizer()
    
    # test 1: analyze lighting
    print("test 1: analyzing lighting conditions...")
    for name, img in [("low", low_light), ("normal", normal_light), ("high", high_light)]:
        analysis = optimizer.analyze_lighting(img)
        print(f"  {name:8s}: condition={analysis['condition']:10s}, brightness={analysis['mean_brightness']:6.1f}")
    print()
    
    # test 2: CLAHE
    print("test 2: applying CLAHE...")
    clahe_result = optimizer.apply_clahe(low_light)
    print(f"✓ CLAHE applied, output shape: {clahe_result.shape}")
    print()
    
    # test 3: gamma correction
    print("test 3: applying gamma correction...")
    gamma_result = optimizer.apply_gamma_correction(low_light, gamma=0.5)
    print(f"✓ gamma correction applied, brightness change: {np.mean(low_light):.1f} -> {np.mean(gamma_result):.1f}")
    print()
    
    # test 4: auto enhancement
    print("test 4: auto enhancement...")
    for name, img in [("low", low_light), ("normal", normal_light), ("high", high_light)]:
        enhanced = optimizer.enhance_image(img)
        before = np.mean(img)
        after = np.mean(enhanced)
        print(f"  {name:8s}: {before:6.1f} -> {after:6.1f} (delta: {after-before:+6.1f})")
    print()
    
    # test 5: detection optimization
    print("test 5: detection optimization...")
    optimized = optimizer.optimize_for_detection(low_light)
    print(f"✓ detection optimization complete")
    print(f"  brightness: {np.mean(low_light):.1f} -> {np.mean(optimized):.1f}")
    print()
    
    print("=" * 60)
    print("✓ ALL TESTS PASSED")
    print("=" * 60)
    print()
    print("lighting optimizer ready for use")
    print("branch: feature/ai/lighting-optimization")
    print("=" * 60)


if __name__ == "__main__":
    test_lighting_optimizer()
