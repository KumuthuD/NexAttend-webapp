from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.database.mongodb import get_database
from app.schemas.face import ClassEmbeddingResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{class_id}/embeddings", response_model=List[ClassEmbeddingResponse])
async def get_class_embeddings(class_id: str, db = Depends(get_database)):
    """
    Get all face embeddings for students in a specific class.
    Used by the recognition system to load authorized faces.
    """
    
    # 1. Fetch classroom to verify existence
    classroom = await db["classrooms"].find_one({"_id": class_id})
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Classroom with ID {class_id} not found"
        )

    # 2. Optimized Join: Match students directly by classroom_id
    pipeline = [
        {"$match": {"classroom_id": class_id}},
        {
            "$lookup": {
                "from": "face_embeddings",
                "localField": "face_embedding_id",
                "foreignField": "_id",
                "as": "embedding_data"
            }
        },
        {"$unwind": "$embedding_data"},
        {
            "$project": {
                "student_id": "$_id",
                "name": 1,
                "roll_number": 1,
                "embedding": "$embedding_data.embedding"
            }
        }
    ]
    
    try:
        results = await db["students"].aggregate(pipeline).to_list(None)
        return results
    except Exception as e:
        logger.error(f"Failed to aggregate class embeddings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving class embeddings"
        )
