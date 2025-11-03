from flask import request, jsonify
from datetime import datetime
from linkedin_ai.pipeline import run_pipeline
from linkedin_ai.scheduler import scheduler
from linkedin_ai.scheduler import (
    load_config,
    save_config,
    refresh_scheduler,
    schedule_job,
)

def register_scheduler_routes(app):

    @app.route("/api/scheduler/settings", methods=["GET"])
    def get_settings():
        return jsonify(load_config())

    @app.route("/api/scheduler/settings", methods=["POST"])
    def update_settings():
        data = request.json
        if data is None:
            return jsonify({"Success": False,"error": "Invalid or missing JSON body"}), 400

        active = data.get("active", False)
        time_str = data.get("time", "09:00")
        frequency = data.get("frequency", "daily")
        frequency = frequency.lower()  # Always normalize to lowercase

        try:
            if not isinstance(active, bool):
                raise ValueError("Invalid value for 'active', Must be true or false.")
            try:
                datetime.strptime(time_str, "%H:%M")
            except ValueError:
                raise ValueError(f"Invalid time format. Must be HH:MM (24-hour).")
            
            allowed_freqs = ["daily", "weekdays", "alternate"]
            if frequency not in allowed_freqs:
                raise ValueError(f"Invalid frequency. Must be one of {allowed_freqs}")
            
            config = {
                "active": active,
                "time": time_str,
                "frequency": frequency
            }
            save_config(config)
            refresh_scheduler()  # Refresh the scheduler after saving config
            return jsonify({"success": True, "message": "Scheduler updated."})
        except ValueError as ve:
            return jsonify({"success": False, "error": str(ve)}), 400
        except Exception as e:
            return jsonify({"success": False, "error": "Internal error"}), 500

    @app.route("/api/scheduler/health", methods=["GET"])
    def scheduler_health():
        jobs = scheduler.get_jobs()
        return jsonify({
            "status": "running" if scheduler.running else "stopped",
            "job_count": len(jobs),
            "jobs": [
                {"id": job.id, "next_run": str(job.next_run_time)}
                for job in jobs
            ]
        })
