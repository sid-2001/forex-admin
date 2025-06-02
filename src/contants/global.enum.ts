const Gender = ['male', 'female', 'others']
const Standard = ['K-12', 'Language Arts', 'College Test Prep', 'STEM Courses', 'Summer Camp', 'College Admission Counselling']
const Category = ['K-12', 'SAT', 'DSAT']
const Roles = ['admin', 'branch - owner', 'student', 'tutor']

enum RoleEnum {
  Admin = 'admin',
  BrachOwner = 'branch-owner',
  Student = 'student',
  tutor = 'tutor',
}

// const status = ['active', 'inactive', 'suspended']
export { Gender, Standard, Category, Roles, RoleEnum }
