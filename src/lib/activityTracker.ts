import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";

export interface UserActivity {
  id?: string;
  userId: string;
  userEmail: string;
  type:
    | "question_asked"
    | "canvas_created"
    | "canvas_saved"
    | "case_study_viewed"
    | "simulation_run"
    | "login";
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class ActivityTracker {
  static async trackActivity(
    activity: Omit<UserActivity, "id" | "timestamp">
  ): Promise<void> {
    try {
      const activityWithTimestamp = {
        ...activity,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "user_activities"), activityWithTimestamp);
    } catch (error) {
      console.error("Error tracking activity:", error);
      // Fallback to localStorage for guests or offline users
      this.trackActivityLocal(activity);
    }
  }

  static trackActivityLocal(
    activity: Omit<UserActivity, "id" | "timestamp">
  ): void {
    try {
      const activities = this.getLocalActivities();
      const activityWithTimestamp = {
        ...activity,
        timestamp: new Date(),
        id: Date.now().toString(),
      };

      activities.unshift(activityWithTimestamp);

      // Keep only last 50 activities locally
      if (activities.length > 50) {
        activities.splice(50);
      }

      localStorage.setItem("local_activities", JSON.stringify(activities));
    } catch (error) {
      console.error("Error tracking local activity:", error);
    }
  }

  static async getRecentActivities(
    userId: string,
    limitCount: number = 10
  ): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, "user_activities"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const activities: UserActivity[] = [];

      querySnapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        } as UserActivity);
      });

      return activities;
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Fallback to local activities
      return this.getLocalActivities().slice(0, limitCount);
    }
  }

  static getLocalActivities(): UserActivity[] {
    try {
      const stored = localStorage.getItem("local_activities");
      if (!stored) return [];

      const activities = JSON.parse(stored);
      return activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
    } catch (error) {
      console.error("Error reading local activities:", error);
      return [];
    }
  }

  static async getActivityMetrics(userId: string): Promise<{
    questionsAsked: number;
    canvasesCreated: number;
    simulationsRun: number;
    caseStudiesViewed: number;
    totalActivities: number;
  }> {
    try {
      const activities = await this.getRecentActivities(userId, 100);

      return {
        questionsAsked: activities.filter((a) => a.type === "question_asked")
          .length,
        canvasesCreated: activities.filter((a) => a.type === "canvas_created")
          .length,
        simulationsRun: activities.filter((a) => a.type === "simulation_run")
          .length,
        caseStudiesViewed: activities.filter(
          (a) => a.type === "case_study_viewed"
        ).length,
        totalActivities: activities.length,
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return {
        questionsAsked: 0,
        canvasesCreated: 0,
        simulationsRun: 0,
        caseStudiesViewed: 0,
        totalActivities: 0,
      };
    }
  }
}
