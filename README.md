# Work Order Schedule Timeline

A manufacturing ERP timeline component built with **Angular 17+**, **Signals**, and **SCSS**.

## 🚀 Features
- **Timeline Grid:** Switch between Day, Week, and Month views.
- **CRUD Operations:** Create, Read, Update, and Delete work orders.
- **Conflict Detection:** Visual indicators (red border) when orders overlap on the same machine.
- **Resource Filtering:** Search and filter work centers by name.
- **Persistence:** Data is saved to LocalStorage and persists after refresh.
- **Validation:** Prevents invalid dates (e.g., End Date before Start Date).

## 🛠️ Tech Stack
- Angular 17 (Standalone Components)
- Angular Signals (State Management)
- Reactive Forms
- SCSS (Custom styling, no external UI libraries for grid)

## 🏃‍♂️ How to Run
1. Install dependencies: `npm install`
2. Run the app: `ng serve`
3. Open `http://localhost:4200`

## 🤖 AI & LLM Usage

Per the challenge instructions, I utilized LLMs as a "sparring partner" to accelerate development, validate architectural decisions, and ensure robust test coverage. Below are the key prompts used during the process:

### 1. Domain Research & Context
To ensure the data model reflected real-world logistics constraints, I started by researching the domain.
> **Prompt:** "Act as a Senior Logistics Manager. Explain the relationship between Work Centers, Routings, and Work Orders in a production scheduling context. How does a planner typically visualize these on a timeline?"

### 2. Architectural Decisions
I used AI to validate my choice of Angular Signals over RxJS for grid rendering performance.
> **Prompt:** "I am building a reactive Timeline Scheduler in Angular 17. I need to manage the state for ViewMode (Day/Week/Month) and the currently visible WorkOrders. Compare using RxJS BehaviorSubjects vs. Angular Signals for this. Which approach offers better fine-grained performance for rendering a large grid?"

### 3. Complex Logic & Algorithms
I leveraged AI to generate efficient algorithms for date math and collision detection, allowing me to focus on UI polish.
> **Prompt:** "I need a TypeScript function to calculate the CSS left and width percentages for a timeline bar. Given a timelineStart date, an orderStart date, and an orderEnd date, how do I calculate the position relative to a container, accounting for different view modes (Day vs. Week)?"

> **Prompt:** "Write a highly efficient algorithm to detect overlapping time intervals in an array of Work Order objects. The function should return a Set of IDs for orders that conflict with each other."

### 4. Unit Testing & Quality Assurance
I used AI to ensure comprehensive test coverage and fix regression issues during refactoring.
> **Prompt:** "Generate and update any unit tests in the `<TEST_FILE>.spec.ts` with the changes from the `<FILE>.ts` file. Fix all failing unit tests in the .spec file and mock files. Rerun the unit tests and continue to fix until all unit tests are passing in the file and unit test coverage is 100%. To run the unit tests for the single file run: `npm run test:single`"

## 🎥 Demo Video
https://www.loom.com/share/e0823810b1174bc0a8481b4b1c1fcc58
