from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from openai import OpenAI
from bson import json_util

# Load environment variables
load_dotenv()

# --- CONFIG ---
app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb+srv://flexai:Hkmh2019@flexai.qgfd8ef.mongodb.net/?retryWrites=true&w=majority&appName=FlexAI")
db = client["FlexAI"]
users = db["users"]
plans_collection = db["plans"]

# OpenAI configuration
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route("/get_plan", methods=["POST"])
def get_plan():
    try:
        data = request.get_json()
        print("Received data:", data)
        
        # Format the data as a string
        prompt = f"""Create a fitness plan for someone with these details:
        Age: {data.get('basicInfo', {}).get('ageRange', 'Not specified')}
        Gender: {data.get('basicInfo', {}).get('gender', 'Not specified')}
        Height: {data.get('basicInfo', {}).get('height', 'Not specified')} cm
        Weight: {data.get('basicInfo', {}).get('weight', 'Not specified')} kg
        Goal: {data.get('fitnessGoal', 'Not specified')}
        Experience: {data.get('experienceLevel', 'Not specified')}
        Activity Level: {data.get('activityLevel', 'Not specified')}
        Training Days: {data.get('timeAvailability', {}).get('trainingDays', 'Not specified')}
        Workout Duration: {data.get('timeAvailability', {}).get('workoutDuration', 'Not specified')}
        Equipment: {data.get('equipmentAccess', 'Not specified')}
        Diet: {data.get('dietaryPreference', 'Not specified')}
        Injuries: {data.get('healthConsiderations', {}).get('hasInjuries', 'Not specified')}
        Environment: {data.get('supplementary', {}).get('workoutEnvironment', 'Not specified')}
        Sleep: {data.get('supplementary', {}).get('sleepHours', 'Not specified')}

        Please provide a detailed fitness plan including:
        1. Weekly workout schedule
        2. Specific exercises with sets, reps, and rest periods
        3. Meal plan with breakfast, lunch, and dinner suggestions
        4. Additional tips and recommendations"""

        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional fitness trainer and nutritionist."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Get the plan from OpenAI's response
        plan = response.choices[0].message.content
        
        # Add metadata
        plan_data = {
            "plan": plan,
            "created_at": datetime.now().isoformat(),
            "user_data": data
        }
        
        # Save to MongoDB
        result = plans_collection.insert_one(plan_data)
        print("Saved plan with ID:", result.inserted_id)
        
        # Convert MongoDB document to JSON-serializable format
        plan_data['_id'] = str(result.inserted_id)
        return jsonify(plan_data)
    except Exception as e:
        print("Error generating plan:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/complete_challenge", methods=["POST"])
def complete_challenge():
    data = request.get_json()
    email = data.get("email")

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    new_points = user.get("points", 0) + 10
    users.update_one({"email": email}, {"$set": {"points": new_points}})
    return jsonify({"message": "Points updated", "points": new_points})

@app.route("/get_points", methods=["GET"])
def get_points():
    email = request.args.get("email")
    user = users.find_one({"email": email})
    if user:
        return jsonify({"points": user.get("points", 0)})
    else:
        return jsonify({"error": "User not found"}), 404

# --- RUN APP ---
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)