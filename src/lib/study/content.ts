import type { Course } from "@/lib/study/types";
import { SALESFORCE_ADMIN_ES } from "@/lib/study/courses/sf-admin-es";

export const COURSES: Course[] = [SALESFORCE_ADMIN_ES];

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getDefaultCourse(): Course {
  return SALESFORCE_ADMIN_ES;
}

export function topicById(course: Course, topicId: string) {
  return course.topics.find((t) => t.id === topicId);
}
