import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.models.face_embedding import FaceEmbedding
from app.schemas.face import FaceEmbeddingResponse
from datetime import datetime

def test_face_embedding_logic():
    print("Testing FaceEmbedding Model and Schema Logic...")
    
    # 1. Test Model instantiation
    sample_data = {
        "student_id": "65bd8c366e7f2a1b9c9e8d4a",
        "embedding": [0.1, 0.2, 0.3],
        "image_path": "test/path.jpg"
    }
    
    model_instance = FaceEmbedding(**sample_data)
    assert model_instance.student_id == "65bd8c366e7f2a1b9c9e8d4a"
    assert model_instance.embedding == [0.1, 0.2, 0.3]
    print("Step 1: Model instantiation successful.")
    
    # 2. Test model_dump with alias
    dumped = model_instance.model_dump(by_alias=True)
    # _id is None by default in instantiation if not provided, but aliased
    assert "student_id" in dumped
    assert "embedding" in dumped
    print("Step 2: Model dumping successful.")

    # 3. Test Response schema
    response_data = {
        "id": "embed_123",
        "student_id": "student_123",
        "embedding": [0.5, 0.6],
        "image_path": "img.jpg",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    response = FaceEmbeddingResponse(**response_data)
    assert response.id == "embed_123"
    print("Step 3: Response schema validation successful.")

if __name__ == "__main__":
    try:
        test_face_embedding_logic()
        print("\n✅ FaceEmbedding model verification passed!")
    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        sys.exit(1)
