from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.recommendation_history import (
    RecommendationHistory
)


class RecommendationHistoryService:

    @staticmethod
    def create_recommendation_record(
        db: Session,
        user_id,
        session_id,
        vendor_id,
        filters_snapshot=None
    ) -> RecommendationHistory:

        recommendation = RecommendationHistory(

            user_id=user_id,

            session_id=session_id,

            vendor_id=vendor_id,

            filters_snapshot=filters_snapshot or {}
        )

        db.add(recommendation)

        db.commit()

        db.refresh(recommendation)

        return recommendation

    @staticmethod
    def get_user_recommendations(
        db: Session,
        user_id,
        limit: int = 50
    ) -> List[RecommendationHistory]:

        return (

            db.query(
                RecommendationHistory
            )

            .filter(
                RecommendationHistory.user_id == user_id
            )

            .order_by(
                RecommendationHistory.recommended_at.desc()
            )

            .limit(limit)

            .all()
        )

    @staticmethod
    def get_session_recommendations(
        db: Session,
        session_id
    ) -> List[RecommendationHistory]:

        return (

            db.query(
                RecommendationHistory
            )

            .filter(
                RecommendationHistory.session_id
                == session_id
            )

            .order_by(
                RecommendationHistory.recommended_at.desc()
            )

            .all()
        )

    @staticmethod
    def vendor_already_recommended(
        db: Session,
        user_id,
        vendor_id
    ) -> bool:

        existing = (

            db.query(
                RecommendationHistory
            )

            .filter(
                RecommendationHistory.user_id
                == user_id,

                RecommendationHistory.vendor_id
                == vendor_id
            )

            .first()
        )

        return existing is not None

    @staticmethod
    def get_recent_vendor_ids(
        db: Session,
        user_id,
        limit: int = 100
    ):

        records = (

            db.query(
                RecommendationHistory
            )

            .filter(
                RecommendationHistory.user_id
                == user_id
            )

            .order_by(
                RecommendationHistory.recommended_at.desc()
            )

            .limit(limit)

            .all()
        )

        return [

            record.vendor_id

            for record in records
        ]