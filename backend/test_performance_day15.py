"""
Performance Testing - Detection Speed
Measures face detection and recognition performance metrics.

Viraj Jayasiri
Week 3 Day 15 - Performance Testing
"""

import cv2
import sys
import os
import time
import numpy as np
from typing import List, Dict
from statistics import mean, stdev, median
import platform

# optional dependency for memory tracking
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("Note: psutil not installed - memory tracking disabled")

# add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.face_detector import FaceDetector
from app.services.face_recognizer import FaceRecognizer


class PerformanceTest:
    """
    comprehensive performance testing for detection and recognition
    """
    
    def __init__(self):
        print("=" * 80)
        print("NexAttend Performance Testing - Day 15")
        print("=" * 80)
        print()
        
        # system info
        self._print_system_info()
        
        # initialize services
        print("\nInitializing AI services...")
        self.detector = FaceDetector(
            min_face_size=20,
            scale_factor=0.709,
            min_confidence=0.90
        )
        self.recognizer = FaceRecognizer(model_name="Facenet")
        print("Services initialized")
        print()
        
        # metrics storage
        self.detection_times = []
        self.recognition_times = []
        self.total_pipeline_times = []
        self.face_counts = []
        self.memory_usage = []
        
    def _print_system_info(self):
        """
        print system specs for context
        """
        print("System Information:")
        print(f"  OS: {platform.system()} {platform.release()}")
        print(f"  Processor: {platform.processor()}")
        
        if PSUTIL_AVAILABLE:
            print(f"  CPU Cores: {psutil.cpu_count(logical=False)} physical, {psutil.cpu_count()} logical")
            print(f"  RAM: {psutil.virtual_memory().total / (1024**3):.1f} GB")
        else:
            print(f"  CPU Cores: (psutil not available)")
            print(f"  RAM: (psutil not available)")
            
        if not PSUTIL_AVAILABLE:
            return 0.0
        
        try:
            process = psutil.Process()
            return process.memory_info().rss / (1024 * 1024)
        except:
            return 0.0
    def _get_memory_usage(self) -> float:
        """
        get current memory usage in MB
        """
        process = psutil.Process()
        return process.memory_info().rss / (1024 * 1024)
        
    def test_detection_speed(self, duration: int = 30):
        """
        test face detection speed with live webcam
        measures FPS, latency, and consistency
        """
        print("=" * 80)
        print("Test 1: Face Detection Speed")
        print("=" * 80)
        print(f"Duration: {duration} seconds")
        print("Position 1-5+ faces in view for comprehensive testing")
        print("Press 'q' to stop early")
        print()
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        # set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("Starting detection test...")
        print("-" * 80)
        
        start_test = time.time()
        frame_count = 0
        
        try:
            while (time.time() - start_test) < duration:
                ret, frame = cap.read()
                if not ret:
                    continue
                
                frame_count += 1
                
                # measure detection time
                det_start = time.time()
                faces = self.detector.detect_faces(
                    frame,
                    filter_confidence=True,
                    sort_by_size=True
                )
                det_end = time.time()
                
                detection_time = (det_end - det_start) * 1000  # ms
                self.detection_times.append(detection_time)
                self.face_counts.append(len(faces))
                
                # memory tracking
                if frame_count % 30 == 0:
                    mem = self._get_memory_usage()
                    self.memory_usage.append(mem)
                
                # display results
                display_frame = self.detector.draw_faces(frame, faces)
                
                # performance overlay
                fps = 1000 / detection_time if detection_time > 0 else 0
                info_text = [
                    f"Frame: {frame_count}",
                    f"Faces: {len(faces)}",
                    f"Time: {detection_time:.1f}ms",
                    f"FPS: {fps:.1f}"
                ]
                
                y_offset = 30
                for text in info_text:
                    cv2.putText(display_frame, text, (10, y_offset),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    y_offset += 30
                
                cv2.imshow('Detection Speed Test', display_frame)
                
                # check for quit
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        except KeyboardInterrupt:
            print("\nTest interrupted")
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
            
        # print detection results
        self._print_detection_results(frame_count, time.time() - start_test)
        
    def _print_detection_results(self, frame_count: int, total_time: float):
        """
        print detection speed analysis
        """
        print("\n" + "=" * 80)
        print("Detection Speed Results")
        print("=" * 80)
        
        if not self.detection_times:
            print("No data collected")
            return
        
        avg_time = mean(self.detection_times)
        med_time = median(self.detection_times)
        min_time = min(self.detection_times)
        max_time = max(self.detection_times)
        std_time = stdev(self.detection_times) if len(self.detection_times) > 1 else 0
        
        avg_fps = 1000 / avg_time if avg_time > 0 else 0
        actual_fps = frame_count / total_time if total_time > 0 else 0
        
        print(f"\nProcessing Time (per frame):")
        print(f"  Average: {avg_time:.2f}ms")
        print(f"  Median: {med_time:.2f}ms")
        print(f"  Min: {min_time:.2f}ms")
        print(f"  Max: {max_time:.2f}ms")
        print(f"  Std Dev: {std_time:.2f}ms")
        
        print(f"\nFrame Rate:")
        print(f"  Theoretical FPS: {avg_fps:.2f}")
        print(f"  Actual FPS: {actual_fps:.2f}")
        print(f"  Frames Processed: {frame_count}")
        print(f"  Total Time: {total_time:.2f}s")
        
        # face count stats
        if self.face_counts:
            avg_faces = mean(self.face_counts)
            max_faces = max(self.face_counts)
            print(f"\nFace Detection:")
            print(f"  Average Faces: {avg_faces:.1f}")
            print(f"  Max Faces: {max_faces}")
        
        # memory stats
        if self.memory_usage:
            avg_mem = mean(self.memory_usage)
            max_mem = max(self.memory_usage)
            print(f"\nMemory Usage:")
            print(f"  Average: {avg_mem:.1f} MB")
            print(f"  Peak: {max_mem:.1f} MB")
        
        print()
        
    def test_recognition_speed(self, num_samples: int = 20):
        """
        test face recognition speed
        measures embedding generation and comparison
        """
        print("=" * 80)
        print("Test 2: Face Recognition Speed")
        print("=" * 80)
        print(f"Samples: {num_samples}")
        print("Capturing face samples...")
        print()
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        # capture sample faces
        samples = []
        embeddings = []
        
        print("Position your face in view...")
        time.sleep(1)
        
        while len(samples) < num_samples:
            ret, frame = cap.read()
            if not ret:
                continue
            
            faces = self.detector.detect_faces(frame)
            
            if faces:
                # crop first face
                x, y, w, h = faces[0]['box']
                face_img = frame[y:y+h, x:x+w]
                
                if face_img.size > 0:
                    samples.append(face_img)
                    
                    # show progress
                    cv2.putText(frame, f"Captured: {len(samples)}/{num_samples}", 
                                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    cv2.imshow('Capturing Samples', frame)
                    cv2.waitKey(100)
        
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"Captured {len(samples)} samples")
        print("\nMeasuring embedding generation speed...")
        
        # test embedding generation
        embedding_times = []
        
        for idx, face in enumerate(samples):
            embed_start = time.time()
            embedding = self.recognizer.get_embedding(face)
            embed_end = time.time()
            
            if embedding:
                embedding_times.append((embed_end - embed_start) * 1000)
                embeddings.append(embedding)
                
            if (idx + 1) % 5 == 0:
                print(f"  Processed {idx + 1}/{len(samples)}...")
        
        print(f"\nGenerated {len(embeddings)} embeddings")
        
        # test comparison speed
        if len(embeddings) >= 2:
            print("\nMeasuring comparison speed...")
            comparison_times = []
            
            # compare first embedding with others
            base_embedding = embeddings[0]
            
            for i in range(1, min(20, len(embeddings))):
                comp_start = time.time()
                similarity = self.recognizer.compute_similarity(base_embedding, embeddings[i])
                comp_end = time.time()
                
                comparison_times.append((comp_end - comp_start) * 1000)
            
            # print recognition results
            self._print_recognition_results(embedding_times, comparison_times)
        else:
            print("Not enough embeddings for comparison test")
            
    def _print_recognition_results(self, embedding_times: List[float], comparison_times: List[float]):
        """
        print recognition speed analysis
        """
        print("\n" + "=" * 80)
        print("Recognition Speed Results")
        print("=" * 80)
        
        if embedding_times:
            avg_embed = mean(embedding_times)
            med_embed = median(embedding_times)
            min_embed = min(embedding_times)
            max_embed = max(embedding_times)
            
            print(f"\nEmbedding Generation:")
            print(f"  Average: {avg_embed:.2f}ms")
            print(f"  Median: {med_embed:.2f}ms")
            print(f"  Min: {min_embed:.2f}ms")
            print(f"  Max: {max_embed:.2f}ms")
            print(f"  Throughput: {1000/avg_embed:.1f} embeddings/sec")
        
        if comparison_times:
            avg_comp = mean(comparison_times)
            med_comp = median(comparison_times)
            
            print(f"\nEmbedding Comparison:")
            print(f"  Average: {avg_comp:.3f}ms")
            print(f"  Median: {med_comp:.3f}ms")
            print(f"  Throughput: {1000/avg_comp:.0f} comparisons/sec")
        
        print()
        
    def test_full_pipeline(self, duration: int = 20):
        """
        test complete pipeline: detection + recognition
        simulates real attendance marking scenario
        """
        print("=" * 80)
        print("Test 3: Full Pipeline Speed")
        print("=" * 80)
        print("Testing complete flow: detect -> crop -> embed -> compare")
        print(f"Duration: {duration} seconds")
        print()
        
        # capture reference face first
        print("Step 1: Capturing reference face (for comparison)...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        reference_embedding = None
        
        while reference_embedding is None:
            ret, frame = cap.read()
            if not ret:
                continue
            
            faces = self.detector.detect_faces(frame)
            
            if faces:
                x, y, w, h = faces[0]['box']
                face_img = frame[y:y+h, x:x+w]
                
                if face_img.size > 0:
                    reference_embedding = self.recognizer.get_embedding(face_img)
                    
                    if reference_embedding:
                        print("Reference face captured")
                        cv2.imshow('Reference Captured', frame)
                        cv2.waitKey(1000)
                        break
            
            cv2.imshow('Capture Reference', frame)
            cv2.waitKey(1)
        
        cv2.destroyAllWindows()
        
        print("\nStep 2: Testing full pipeline...")
        print("Position your face in view")
        time.sleep(1)
        
        # test pipeline
        pipeline_times = []
        match_count = 0
        total_faces = 0
        
        start_test = time.time()
        
        while (time.time() - start_test) < duration:
            ret, frame = cap.read()
            if not ret:
                continue
            
            # full pipeline timing
            pipeline_start = time.time()
            
            # step 1: detect
            faces = self.detector.detect_faces(frame)
            total_faces += len(faces)
            
            # step 2: process each face
            for face in faces:
                x, y, w, h = face['box']
                face_img = frame[y:y+h, x:x+w]
                
                if face_img.size > 0:
                    # step 3: generate embedding
                    embedding = self.recognizer.get_embedding(face_img)
                    
                    if embedding:
                        # step 4: compare
                        similarity = self.recognizer.compute_similarity(
                            reference_embedding, 
                            embedding
                        )
                        
                        # check if match (threshold < 0.4 for Facenet)
                        if similarity < 0.4:
                            match_count += 1
            
            pipeline_end = time.time()
            pipeline_time = (pipeline_end - pipeline_start) * 1000
            pipeline_times.append(pipeline_time)
            
            # display
            display_frame = self.detector.draw_faces(frame, faces)
            info = [
                f"Pipeline: {pipeline_time:.1f}ms",
                f"Faces: {len(faces)}",
                f"Matches: {match_count}"
            ]
            
            y_pos = 30
            for text in info:
                cv2.putText(display_frame, text, (10, y_pos),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)
                y_pos += 30
            
            cv2.imshow('Full Pipeline Test', display_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        # print pipeline results
        self._print_pipeline_results(pipeline_times, match_count, total_faces)
        
    def _print_pipeline_results(self, pipeline_times: List[float], matches: int, total_faces: int):
        """
        print full pipeline analysis
        """
        print("\n" + "=" * 80)
        print("Full Pipeline Results")
        print("=" * 80)
        
        if not pipeline_times:
            print("No data collected")
            return
        
        avg_time = mean(pipeline_times)
        med_time = median(pipeline_times)
        min_time = min(pipeline_times)
        max_time = max(pipeline_times)
        
        print(f"\nPipeline Performance:")
        print(f"  Average Time: {avg_time:.2f}ms")
        print(f"  Median Time: {med_time:.2f}ms")
        print(f"  Min Time: {min_time:.2f}ms")
        print(f"  Max Time: {max_time:.2f}ms")
        print(f"  Throughput: {1000/avg_time:.1f} cycles/sec")
        
        print(f"\nRecognition Results:")
        print(f"  Total Faces Detected: {total_faces}")
        print(f"  Matches Found: {matches}")
        print(f"  Frames Processed: {len(pipeline_times)}")
        
        print()
        
    def test_scalability(self):
        """
        test performance with different numbers of faces
        shows how system scales
        """
        print("=" * 80)
        print("Test 4: Scalability Test")
        print("=" * 80)
        print("Tests performance with 1, 2-3, 4-5, and 6+ faces")
        print()
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        # collect samples by face count
        samples_by_count = {
            1: [],
            2: [],
            3: [],
            4: []  # 4+ faces
        }
        
        target_samples = 10  # samples per category
        
        print("Collecting samples...")
        print("Move people in/out of frame to test different counts")
        print("Press 'q' when done")
        print()
        
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            
            det_start = time.time()
            faces = self.detector.detect_faces(frame)
            det_time = (time.time() - det_start) * 1000
            
            face_count = len(faces)
            
            # categorize
            if face_count == 1:
                category = 1
            elif face_count in [2, 3]:
                category = 2
            elif face_count in [4, 5]:
                category = 3
            elif face_count >= 6:
                category = 4
            else:
                category = None
            
            if category and len(samples_by_count[category]) < target_samples:
                samples_by_count[category].append(det_time)
            
            # display progress
            display_frame = self.detector.draw_faces(frame, faces)
            
            progress = [
                f"Faces: {face_count}",
                f"1 face: {len(samples_by_count[1])}/{target_samples}",
                f"2-3 faces: {len(samples_by_count[2])}/{target_samples}",
                f"4-5 faces: {len(samples_by_count[3])}/{target_samples}",
                f"6+ faces: {len(samples_by_count[4])}/{target_samples}"
            ]
            
            y_pos = 30
            for text in progress:
                cv2.putText(display_frame, text, (10, y_pos),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
                y_pos += 25
            
            cv2.imshow('Scalability Test', display_frame)
            
            # check if done or quit
            all_done = all(len(samples) >= target_samples for samples in samples_by_count.values())
            if all_done or (cv2.waitKey(1) & 0xFF == ord('q')):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        # print scalability results
        self._print_scalability_results(samples_by_count)
        
    def _print_scalability_results(self, samples: Dict[int, List[float]]):
        """
        print scalability analysis
        """
        print("\n" + "=" * 80)
        print("Scalability Results")
        print("=" * 80)
        
        categories = {
            1: "1 face",
            2: "2-3 faces",
            3: "4-5 faces",
            4: "6+ faces"
        }
        
        print()
        for cat_id, label in categories.items():
            times = samples[cat_id]
            
            if times:
                avg = mean(times)
                med = median(times)
                fps = 1000 / avg if avg > 0 else 0
                
                print(f"{label}:")
                print(f"  Average: {avg:.2f}ms ({fps:.1f} FPS)")
                print(f"  Median: {med:.2f}ms")
                print(f"  Samples: {len(times)}")
                print()
            else:
                print(f"{label}: No samples collected")
                print()
        
    def generate_summary_report(self):
        """
        generate final summary of all tests
        """
        print("\n" + "=" * 80)
        print("PERFORMANCE TEST SUMMARY")
        print("=" * 80)
        
        if self.detection_times:
            avg_detection = mean(self.detection_times)
            print(f"\nDetection Performance:")
            print(f"  Average Speed: {avg_detection:.2f}ms")
            print(f"  Target FPS: {1000/avg_detection:.1f}")
            
        print(f"\nTotal Frames Analyzed: {len(self.detection_times)}")
        
        if self.face_counts:
            print(f"Total Faces Detected: {sum(self.face_counts)}")
            print(f"Average Faces per Frame: {mean(self.face_counts):.1f}")
        
        if self.memory_usage:
            print(f"\nMemory Footprint: {mean(self.memory_usage):.1f} MB average")
        
        print("\n" + "=" * 80)
        print("Performance testing complete!")
        print("=" * 80)
        

def main():
    """
    run performance tests
    """
    test = PerformanceTest()
    
    print("\nPerformance Test Menu:")
    print("1. Detection Speed Test (30s)")
    print("2. Recognition Speed Test")
    print("3. Full Pipeline Test (20s)")
    print("4. Scalability Test")
    print("5. Run All Tests")
    print("0. Exit")
    print()
    
    choice = input("Select test (0-5): ").strip()
    
    if choice == "1":
        test.test_detection_speed(duration=30)
    elif choice == "2":
        test.test_recognition_speed(num_samples=20)
    elif choice == "3":
        test.test_full_pipeline(duration=20)
    elif choice == "4":
        test.test_scalability()
    elif choice == "5":
        print("\nRunning all tests...")
        print()
        test.test_detection_speed(duration=30)
        print("\n")
        test.test_recognition_speed(num_samples=20)
        print("\n")
        test.test_full_pipeline(duration=20)
        print("\n")
        test.test_scalability()
        print("\n")
        test.generate_summary_report()
    elif choice == "0":
        print("Exiting...")
    else:
        print("Invalid choice")
    

if __name__ == "__main__":
    main()
