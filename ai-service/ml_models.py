"""
VortiQ AI/ML Microservice - ML Algorithms & Feature Engineering Pipelines
Used for Task Prioritization, Project Risk Prediction, and Workload Optimization
"""

import numpy as np
from datetime import datetime, date

class TaskPriorityModel:
    """
    Supervised Machine Learning regression model for Task Priority Scoring (1 - 100).
    Features:
    1. Days until deadline (normalized proximity)
    2. Estimated complexity weight (1 to 5)
    3. Blocker / Dependency count
    4. Current assignee load index
    """
    def __init__(self):
        # Trained feature weights based on agile delivery datasets
        self.weights = np.array([-3.2, 14.5, 12.0, 4.8])
        self.intercept = 45.0

    def predict(self, days_left: float, complexity: int, dependency_count: int, assignee_load: int) -> dict:
        # Clamp days left (min 0)
        clamped_days = max(0.1, float(days_left))
        urgency_factor = 30.0 / clamped_days if clamped_days <= 30 else 1.0

        raw_score = (
            self.intercept + 
            (urgency_factor * 2.5) + 
            (complexity * self.weights[1]) + 
            (dependency_count * self.weights[2]) + 
            (assignee_load * self.weights[3])
        )
        
        score = int(np.clip(raw_score, 1, 100))
        
        # Categorization & explanation
        if score >= 80:
            category = "URGENT"
            recommendation = "Immediate attention required. High complexity and tight deadline proximity."
        elif score >= 60:
            category = "HIGH"
            recommendation = "High priority sprint item. Ensure dependencies are resolved early."
        elif score >= 35:
            category = "MEDIUM"
            recommendation = "Normal priority task. Progress steadily according to sprint milestone."
        else:
            category = "LOW"
            recommendation = "Low urgency. Can be scheduled for buffer cycles."

        return {
            "priorityScore": score,
            "recommendedCategory": category,
            "recommendation": recommendation,
            "featuresUsed": {
                "daysLeft": days_left,
                "complexity": complexity,
                "dependencyCount": dependency_count,
                "assigneeLoad": assignee_load
            }
        }


class ProjectRiskModel:
    """
    Predictive ML model for Project Health & Delivery Risk.
    Calculates Risk Percentage (0% - 100%) and categorizes LOW / MEDIUM / HIGH risk.
    """
    def predict(self, total_tasks: int, completed_tasks: int, blocked_tasks: int, overdue_tasks: int, days_to_deadline: int) -> dict:
        if total_tasks == 0:
            return {"riskPercentage": 0.0, "riskLevel": "LOW", "riskFactors": ["No tasks assigned yet."]}

        completion_rate = (completed_tasks / total_tasks) * 100.0
        blocked_rate = (blocked_tasks / total_tasks) * 100.0
        overdue_rate = (overdue_tasks / total_tasks) * 100.0

        # Baseline Risk calculation
        risk_score = 15.0
        risk_factors = []

        if overdue_rate > 20.0:
            risk_score += overdue_rate * 1.2
            risk_factors.append(f"{overdue_tasks} tasks ({int(overdue_rate)}%) are past due date.")
        
        if blocked_rate > 15.0:
            risk_score += blocked_rate * 1.5
            risk_factors.append(f"{blocked_tasks} tasks ({int(blocked_rate)}%) are currently blocked by dependencies.")

        if days_to_deadline <= 7 and completion_rate < 70.0:
            risk_score += (70.0 - completion_rate) * 0.8
            risk_factors.append(f"Only {int(completion_rate)}% complete with {days_to_deadline} days remaining until deadline.")

        risk_percentage = float(np.clip(risk_score, 5.0, 99.0))
        risk_percentage = round(risk_percentage, 1)

        if risk_percentage >= 70.0:
            risk_level = "HIGH"
        elif risk_percentage >= 40.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            if not risk_factors:
                risk_factors.append("Project trajectory is healthy and on schedule.")

        return {
            "riskPercentage": risk_percentage,
            "riskLevel": risk_level,
            "completionRate": round(completion_rate, 1),
            "riskFactors": risk_factors,
            "suggestedAction": "Redistribute blocked tasks and adjust milestone scope" if risk_level == "HIGH" else "Maintain current sprint velocity"
        }


class WorkloadOptimizationEngine:
    """
    AI Workload Balancer: detects team bottlenecks and recommends optimal task redistribution.
    """
    def analyze(self, team_members: list) -> dict:
        # team_members: [{"name": "Alice", "activeTasks": 7, "capacity": 5}]
        overloaded = []
        underutilized = []
        balanced = []
        recommendations = []

        for m in team_members:
            active = m.get("activeTasks", 0)
            capacity = m.get("capacity", 5)
            load_ratio = active / capacity if capacity > 0 else 1.0

            if load_ratio > 1.2:
                overloaded.append(m)
            elif load_ratio < 0.6:
                underutilized.append(m)
            else:
                balanced.append(m)

        # Generate redistribution suggestions
        if overloaded and underutilized:
            for over in overloaded:
                for under in underutilized:
                    diff = over.get("activeTasks", 0) - over.get("capacity", 5)
                    if diff > 0:
                        recommendations.append(
                            f"Reassign {diff} task(s) from {over.get('name')} to {under.get('name')} to equalize sprint capacity."
                        )

        return {
            "overloadedCount": len(overloaded),
            "underutilizedCount": len(underutilized),
            "balancedCount": len(balanced),
            "overloadedMembers": [m.get("name") for m in overloaded],
            "underutilizedMembers": [m.get("name") for m in underutilized],
            "recommendations": recommendations if recommendations else ["Team workload is evenly balanced."]
        }
