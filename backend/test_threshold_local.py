"""
Threshold Testing Script - Local Version
Find optimal similarity threshold using webcam captures.

Viraj Jayasiri - Week 02 Day 9
"""

import sys
import os
import cv2
import numpy as np
from typing import List, Dict, Tuple

# add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app.services.ai.face_recognizer import FaceRecognizer

class LocalThresholdTester:
    def __init__(self):
        self.recognizer = FaceRecognizer()
        self.embeddings_same = []
        self.embeddings_diff = []
        
    def capture_test_images(self, test_dir):
        """capture test images from webcam"""
        print("\n=== Capture Test Images ===")
        print("We need to capture images of 2 different people.")
        print("Each person: capture their face twice (different angles/expressions)")
        print("\nControls:")
        print("  SPACE - Capture image")
        print("  Q - Quit/Continue to next step")
        print("\n")
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return False
        
        persons = {
            "person1": [],
            "person2": []
        }
        
        current_person = "person1"
        capture_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            display = frame.copy()
            
            # show instructions
            if current_person == "person1":
                if capture_count == 0:
                    text = "Person 1: Capture 1st image (SPACE)"
                elif capture_count == 1:
                    text = "Person 1: Capture 2nd image (SPACE)"
                else:
                    text = "Person 1 done! Press Q to continue"
            else:
                if capture_count == 0:
                    text = "Person 2: Capture 1st image (SPACE)"
                elif capture_count == 1:
                    text = "Person 2: Capture 2nd image (SPACE)"
                else:
                    text = "Person 2 done! Press Q to finish"
            
            cv2.putText(display, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(display, f"Captured: {len(persons[current_person])}/2", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            cv2.imshow("Threshold Testing - Capture Images", display)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord(' '):
                if capture_count < 2:
                    filename = f"{current_person}_{capture_count + 1}.jpg"
                    filepath = os.path.join(test_dir, filename)
                    cv2.imwrite(filepath, frame)
                    persons[current_person].append(filepath)
                    print(f"Captured: {filename}")
                    capture_count += 1
            
            elif key == ord('q'):
                if current_person == "person1" and capture_count >= 2:
                    current_person = "person2"
                    capture_count = 0
                    print("\nSwitching to Person 2...")
                elif current_person == "person2" and capture_count >= 2:
                    print("\nAll captures complete!")
                    break
        
        cap.release()
        cv2.destroyAllWindows()
        
        return len(persons["person1"]) >= 2 and len(persons["person2"]) >= 2
    
    def load_embeddings(self, test_dir):
        """load images and generate embeddings"""
        print("\nGenerating embeddings...")
        
        embeddings = {}
        
        for filename in os.listdir(test_dir):
            if filename.endswith('.jpg'):
                filepath = os.path.join(test_dir, filename)
                img = cv2.imread(filepath)
                
                if img is None:
                    print(f"Failed to load: {filename}")
                    continue
                
                try:
                    embedding = self.recognizer.get_embedding(img)
                    embeddings[filename] = embedding
                    print(f"Embedding generated: {filename}")
                except Exception as e:
                    print(f"Error with {filename}: {e}")
        
        return embeddings
    
    def create_test_pairs(self, embeddings):
        """create same-person and different-person pairs"""
        print("\nCreating test pairs...")
        
        same_pairs = []
        diff_pairs = []
        
        # same person pairs
        if "person1_1.jpg" in embeddings and "person1_2.jpg" in embeddings:
            same_pairs.append(
                ("person1_1.jpg", "person1_2.jpg", 
                 embeddings["person1_1.jpg"], embeddings["person1_2.jpg"])
            )
        
        if "person2_1.jpg" in embeddings and "person2_2.jpg" in embeddings:
            same_pairs.append(
                ("person2_1.jpg", "person2_2.jpg",
                 embeddings["person2_1.jpg"], embeddings["person2_2.jpg"])
            )
        
        # different person pairs
        person1_imgs = [k for k in embeddings.keys() if k.startswith("person1")]
        person2_imgs = [k for k in embeddings.keys() if k.startswith("person2")]
        
        for p1 in person1_imgs:
            for p2 in person2_imgs:
                diff_pairs.append(
                    (p1, p2, embeddings[p1], embeddings[p2])
                )
        
        print(f"Same person pairs: {len(same_pairs)}")
        print(f"Different person pairs: {len(diff_pairs)}")
        
        return same_pairs, diff_pairs
    
    def test_thresholds(self, same_pairs, diff_pairs):
        """test different threshold values"""
        print("\n" + "="*60)
        print("THRESHOLD TESTING")
        print("="*60)
        
        thresholds = np.arange(0.3, 0.95, 0.05)
        results = []
        
        for threshold in thresholds:
            tp = 0
            fn = 0
            tn = 0
            fp = 0
            
            # test same person pairs
            for name1, name2, emb1, emb2 in same_pairs:
                similarity = self.recognizer.compare_embeddings(emb1, emb2)
                if similarity >= threshold:
                    tp += 1
                else:
                    fn += 1
            
            # test different person pairs
            for name1, name2, emb1, emb2 in diff_pairs:
                similarity = self.recognizer.compare_embeddings(emb1, emb2)
                if similarity < threshold:
                    tn += 1
                else:
                    fp += 1
            
            total = len(same_pairs) + len(diff_pairs)
            
            if total > 0:
                accuracy = (tp + tn) / total
                precision = tp / (tp + fp) if (tp + fp) > 0 else 0
                recall = tp / (tp + fn) if (tp + fn) > 0 else 0
                f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
                
                results.append({
                    'threshold': threshold,
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1': f1,
                    'tp': tp,
                    'fn': fn,
                    'tn': tn,
                    'fp': fp
                })
        
        return results
    
    def print_results(self, results):
        """print results table"""
        print("\nThreshold | Accuracy | Precision | Recall | F1 Score | TP | FN | TN | FP")
        print("-" * 80)
        
        for r in results:
            print(f"{r['threshold']:.2f}      | {r['accuracy']:.4f}   | {r['precision']:.4f}    | {r['recall']:.4f} | {r['f1']:.4f}   | {r['tp']:2d} | {r['fn']:2d} | {r['tn']:2d} | {r['fp']:2d}")
        
        best = max(results, key=lambda x: x['f1'])
        
        print("\n" + "="*60)
        print("OPTIMAL THRESHOLD FOUND")
        print("="*60)
        print(f"Threshold: {best['threshold']:.2f}")
        print(f"Accuracy:  {best['accuracy']:.4f} ({best['accuracy']*100:.2f}%)")
        print(f"Precision: {best['precision']:.4f}")
        print(f"Recall:    {best['recall']:.4f}")
        print(f"F1 Score:  {best['f1']:.4f}")
        print(f"\nTrue Positives:  {best['tp']} (same person matched)")
        print(f"False Negatives: {best['fn']} (same person missed)")
        print(f"True Negatives:  {best['tn']} (different person rejected)")
        print(f"False Positives: {best['fp']} (different person matched)")
        
        return best
    
    def save_results(self, results, best, output_file):
        """save results to file"""
        with open(output_file, 'w') as f:
            f.write("# Threshold Optimization Results\n\n")
            f.write("## Test Configuration\n")
            f.write(f"- Model: {self.recognizer.model_name}\n")
            f.write(f"- Test Type: Local webcam captures\n\n")
            
            f.write("## Results\n\n")
            f.write("| Threshold | Accuracy | Precision | Recall | F1 Score | TP | FN | TN | FP |\n")
            f.write("|-----------|----------|-----------|--------|----------|----|----|----|----|\\n")
            
            for r in results:
                f.write(f"| {r['threshold']:.2f} | {r['accuracy']:.4f} | {r['precision']:.4f} | {r['recall']:.4f} | {r['f1']:.4f} | {r['tp']} | {r['fn']} | {r['tn']} | {r['fp']} |\n")
            
            f.write(f"\n## Recommendation\n\n")
            f.write(f"**Update SIMILARITY_THRESHOLD in config.py to: {best['threshold']:.2f}**\n\n")
            f.write(f"This provides:\n")
            f.write(f"- {best['accuracy']*100:.2f}% accuracy\n")
            f.write(f"- {best['precision']*100:.2f}% precision\n")
            f.write(f"- {best['recall']*100:.2f}% recall\n")
        
        print(f"\nResults saved to: {output_file}")

def main():
    print("=== NexAttend Threshold Optimization (Local) ===\n")
    
    test_dir = os.path.join(current_dir, "test_threshold_data")
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)
    
    tester = LocalThresholdTester()
    
    # check if we already have captures
    existing_files = [f for f in os.listdir(test_dir) if f.endswith('.jpg')]
    
    if len(existing_files) < 4:
        print("No existing test images found.")
        print("Starting webcam capture...\n")
        success = tester.capture_test_images(test_dir)
        if not success:
            print("Error: Failed to capture enough images")
            return
    else:
        print(f"Found {len(existing_files)} existing test images")
        response = input("Use existing images? (y/n): ")
        if response.lower() != 'y':
            # clear directory
            for f in existing_files:
                os.remove(os.path.join(test_dir, f))
            success = tester.capture_test_images(test_dir)
            if not success:
                print("Error: Failed to capture enough images")
                return
    
    # generate embeddings
    embeddings = tester.load_embeddings(test_dir)
    
    if len(embeddings) < 4:
        print("Error: Not enough embeddings generated")
        return
    
    # create test pairs
    same_pairs, diff_pairs = tester.create_test_pairs(embeddings)
    
    if len(same_pairs) == 0 or len(diff_pairs) == 0:
        print("Error: Could not create valid test pairs")
        return
    
    # run threshold testing
    results = tester.test_thresholds(same_pairs, diff_pairs)
    
    # print and save results
    best = tester.print_results(results)
    
    output_file = os.path.join(current_dir, "threshold_optimization_results.md")
    tester.save_results(results, best, output_file)
    
    print("\n=== Testing Complete ===")
    print(f"\nNext step: Update SIMILARITY_THRESHOLD in config.py to {best['threshold']:.2f}")

if __name__ == "__main__":
    main()
