import sys
import json
import pandas as pd

def main():
    try:
        data = json.load(sys.stdin)
        df = pd.DataFrame(data)

        # Basic stats
        avg_math = df["Math"].mean()
        avg_science = df["Science"].mean()
        avg_english = df["English"].mean()

        top_student = df.loc[df[["Math", "Science", "English"]].mean(axis=1).idxmax()]["Name"]

        result = {
            "average_scores": {
                "Math": round(avg_math, 2),
                "Science": round(avg_science, 2),
                "English": round(avg_english, 2)
            },
            "top_student": top_student
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
