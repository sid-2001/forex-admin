export interface Assessment {
  title: string
  standard: string
  tutor: string
  course: string
  questions: Array<Question>
  totalMarks: 0
  _id: string
  createdAt: string
  updatedAt: string
  __v: 0
}

export interface Question {
  _id: string
  assessment: string
  format: string
  text: string
  options: Array<string>
  correctAnswer: string
  maxMarks: number
  createdAt: string
  updatedAt: string
  __v: 0
}

export interface Response {
  question: Question
  answer: string
  score: number
  _id: string
}

export interface Student {
  _id: string
  firstName: string
  lastName: string
}

export interface PendingListItem {
  _id: string
  student: Student
  assessment: Assessment
  responses: Response[]
  totalScore: number
  reviewed: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface PendingListResponse {
  success: boolean
  pendingList: PendingListItem[]
}
