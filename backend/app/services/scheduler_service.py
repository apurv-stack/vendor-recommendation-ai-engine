from apscheduler.schedulers.background import BackgroundScheduler
from app.db.session import SessionLocal
from app.services.vendor_sync_service import VendorSyncService

scheduler = BackgroundScheduler()


def run_vendor_sync_job():

    db = SessionLocal()

    try:
        VendorSyncService.run_sync(db)

    finally:
        db.close()


def start_scheduler():

    if scheduler.running:
        return

    scheduler.add_job(
        run_vendor_sync_job,
        "interval",
        hours=1,
        id="vendor_sync_job",
        replace_existing=True
    )

    scheduler.start()

    print("✅ Vendor Sync Scheduler Started")