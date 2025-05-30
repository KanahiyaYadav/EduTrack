import sys
import json

def classify(student):
    avg = (student["Math"] + student["Science"] + student["English"]) / 3
    att = student["Attendance"]
    if avg >= 85 and att >= 90:
        return "Top Performer"
    elif avg < 50 or att < 60:
        return "At Risk of Failing"
    elif avg < 70:
        return "Needs Improvement"
    return "Average"

def main():
    try:
        students = json.load(sys.stdin)
        if not students:
            print(json.dumps({"error": "No data received"}))
            return

        unique = {}
        for s in students:
            name = s.get("Name")
            if name:
                unique[name] = s

        total_math = total_sci = total_eng = total_att = 0
        top_student = ""
        highest_avg = -1
        categorized = []

        for s in unique.values():
            try:
                name = s["Name"]
                math = int(s.get("Math", 0) or 0)
                sci = int(s.get("Science", 0) or 0)
                eng = int(s.get("English", 0) or 0)
                att = int(s.get("Attendance", 0) or 0)
            except Exception as e:
                print(f"Skipping invalid record: {s} – {e}", file=sys.stderr)
                continue

            avg = (math + sci + eng) / 3
            if avg > highest_avg:
                highest_avg = avg
                top_student = name

            total_math += math
            total_sci += sci
            total_eng += eng
            total_att += att

            categorized.append({
                "Name": name,
                "Category": classify({
                    "Math": math,
                    "Science": sci,
                    "English": eng,
                    "Attendance": att
                })
            })

        count = len(categorized)
        if count == 0:
            print(json.dumps({"error": "No valid student records to analyze"}))
            return

        print(json.dumps({
            "average_scores": {
                "Math": round(total_math / count, 2),
                "Science": round(total_sci / count, 2),
                "English": round(total_eng / count, 2),
                "Attendance": round(total_att / count, 2)
            },
            "top_student": top_student,
            "categorized_students": categorized
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
