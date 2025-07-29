from fastapi import FastAPI
from fastapi.responses import JSONResponse
from collections import defaultdict
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from statistics import mean, quantiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LOG_PATH = os.getenv("LOG_PATH", os.path.join(os.path.dirname(__file__), "cli_logs.jsonl"))

@app.get("/api/cli-logs")
def get_cli_logs():
    logs = []
    try:
        with open(LOG_PATH, "r") as f:
            for line in f:
                log = json.loads(line)
                output = log.get("output", "").lower()

                if "error" in output:
                    log["status"] = "error"
                else:
                    log["status"] = "success"

                logs.append(log)
    except FileNotFoundError:
        return {"error": "cli_logs.jsonl not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format in log file"}
    return logs

@app.get("/api/analytics/summary")
def get_summary():
    try:
        with open(LOG_PATH, "r") as file:
            logs = [json.loads(line) for line in file]

        total = len(logs)
        success = 0
        error = 0
        total_duration = 0

        for log in logs:
            total_duration += log.get("duration_ms", 0)
            output = log.get("output", "").lower()

            if "error" in output:
                log["status"] = "error"
                error += 1
            else:
                log["status"] = "success"
                success += 1

        summary = {
            "total_commands": total,
            "success_rate": (success / total * 100) if total > 0 else 0,
            "avg_response_time": total_duration / total if total > 0 else 0,
            "error_count": error
        }

        return summary

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/command-activity")
def get_command_activity():
    try:
        with open(LOG_PATH, "r") as file:
            logs = [json.loads(line) for line in file]

        hourly_data = defaultdict(lambda: {"commands": 0, "errors": 0})

        for log in logs:
            ts = datetime.fromisoformat(log["timestamp"].replace("Z", "+00:00"))
            hour = ts.strftime("%H:00")
            hourly_data[hour]["commands"] += 1

            # ✅ Error olup olmadığını burada kontrol ediyoruz
            if "error" in log.get("output", "").lower():
                hourly_data[hour]["errors"] += 1

        # Saat sırasına göre listele
        result = [
            {"name": hour, "commands": data["commands"], "errors": data["errors"]}
            for hour, data in sorted(hourly_data.items())
        ]

        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/performance")
def performance_analyzer():
    try:
        with open(LOG_PATH, "r") as f:
            logs = [json.loads(line) for line in f]

        if not logs:
            return JSONResponse(content={
                "performanceData": [],
                "timelineData": [],
                "slowCommands": []
            })

        # 1. Command başına ortalama süre ve çağrı sayısı
        command_stats = defaultdict(list)
        for log in logs:
            parts = log["command"].split()
            key = parts[1] if len(parts) > 1 else "unknown"
            command_stats[key].append(log["duration_ms"] / 1000)

        performance_data = [
            {
                "command": cmd,
                "avgTime": round(mean(times), 2),
                "calls": len(times)
            }
            for cmd, times in command_stats.items()
        ]

        # 2. Saatlik yanıt süreleri (tek saat aralığı var şu an)
        hour_buckets = defaultdict(list)
        for log in logs:
            hour = datetime.fromisoformat(log["timestamp"]).strftime("%H:00")
            hour_buckets[hour].append(log["duration_ms"] / 1000)

        timeline_data = []
        for hour, durations in sorted(hour_buckets.items()):
            if len(durations) >= 3:
                p95, p99 = quantiles(durations, n=100)[94], quantiles(durations, n=100)[98]
            else:
                p95 = max(durations)
                p99 = max(durations)
            timeline_data.append({
                "time": hour,
                "avgResponse": round(mean(durations), 2),
                "p95": round(p95, 2),
                "p99": round(p99, 2)
            })

        # 3. En yavaş komutlar
        sorted_logs = sorted(logs, key=lambda x: x["duration_ms"], reverse=True)[:5]
        slow_commands = [
            {
                "command": log["command"],
                "duration": f"{round(log['duration_ms'] / 1000, 1)}s",
                "frequency": 1  # örnek veri için 1, gerçek sistemde tekrar sayısı olabilir
            }
            for log in sorted_logs
        ]

        return {
            "performanceData": performance_data,
            "timelineData": timeline_data,
            "slowCommands": slow_commands
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/errors/summary")
def get_error_summary():
    try:
        with open(LOG_PATH, "r") as f:
            logs = [json.loads(line) for line in f]

        total_errors = 0
        error_types = defaultdict(int)
        error_timeline = defaultdict(int)
        frequent_messages = defaultdict(lambda: {"count": 0, "last_seen": "", "category": ""})

        for log in logs:
            output = log.get("output", "").lower()
            ts = log.get("timestamp", "")
            hour = datetime.fromisoformat(ts).strftime("%H:00") if ts else "unknown"

            if "error" in output:
                total_errors += 1
                error_timeline[hour] += 1

                # Kategori tespiti
                if "gas" in output:
                    error_types["Gas Limit"] += 1
                    category = "Gas"
                elif "auth" in output or "signature" in output:
                    error_types["Authorization"] += 1
                    category = "Auth"
                elif "timeout" in output:
                    error_types["Network Timeout"] += 1
                    category = "Network"
                elif "param" in output:
                    error_types["Invalid Parameters"] += 1
                    category = "Contract Error"
                else:
                    error_types["Contract Error"] += 1
                    category = "Contract Error"

                frequent_messages[output]["count"] += 1
                frequent_messages[output]["last_seen"] = ts
                frequent_messages[output]["category"] = category

        # Pie Chart
        pie_data = [{"name": k, "value": v} for k, v in error_types.items()]
        # Timeline
        timeline_data = [{"time": hour, "errors": count} for hour, count in sorted(error_timeline.items())]
        # Frequent list
        frequent_list = sorted(
            [
                {
                    "error": msg,
                    "count": data["count"],
                    "lastSeen": data["last_seen"],
                    "category": data["category"],
                    "suggestion": "Improve logic or check configuration"
                }
                for msg, data in frequent_messages.items()
            ],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

        return {
            "totalErrors": total_errors,
            "errorRate": round((total_errors / len(logs)) * 100, 1) if logs else 0,
            "criticalErrors": sum(1 for f in frequent_list if f["count"] >= 10),
            "pieData": pie_data,
            "timelineData": timeline_data,
            "frequentErrors": frequent_list
        }

    except Exception as e:
        return {"error": str(e)}