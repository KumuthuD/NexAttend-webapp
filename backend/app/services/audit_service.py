from typing import Any, Dict, Optional
from datetime import datetime
from app.models.logs import AuditLog

class AuditService:
    """
    Service to handle auditing of manual changes in the system.
    """
    
    @staticmethod
    async def log_change(
        db: Any,
        target_type: str,
        target_id: str,
        changed_by: str,
        old_value: Dict[str, Any],
        new_value: Dict[str, Any],
        reason: Optional[str] = None
    ) -> str:
        """
        Records an audit log entry in the 'audit_logs' collection.
        """
        audit_entry = AuditLog(
            target_type=target_type,
            target_id=target_id,
            changed_by=changed_by,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            timestamp=datetime.utcnow()
        )
        
        await db["audit_logs"].insert_one(audit_entry.model_dump(by_alias=True))
        return audit_entry.id

# Global instance
audit_service = AuditService()
