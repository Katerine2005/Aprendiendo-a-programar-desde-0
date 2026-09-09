import { Course, CourseId } from '../types';
import { cppCourse } from './courses/cpp';
import { pythonCourse } from './courses/python';
import { javascriptCourse } from './courses/javascript';
import { javaCourse } from './courses/java';
import { nodejsCourse } from './courses/nodejs';
import { rustCourse } from './courses/rust';
import { sqlCourse } from './courses/sql';
import { htmlCssCourse } from './courses/htmlcss';

export const COURSES: Course[] = [
  cppCourse,
  pythonCourse,
  javascriptCourse,
  javaCourse,
  nodejsCourse,
  rustCourse,
  sqlCourse,
  htmlCssCourse,
];

export const COURSES_MAP: Record<CourseId, Course> = {
  cpp: cppCourse,
  python: pythonCourse,
  javascript: javascriptCourse,
  java: javaCourse,
  nodejs: nodejsCourse,
  rust: rustCourse,
  sql: sqlCourse,
  'html-css': htmlCssCourse,
};

export const getCourseById = (id: CourseId): Course | undefined => {
  return COURSES_MAP[id];
};
