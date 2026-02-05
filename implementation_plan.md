# Implementation Plan - Quiz Result Details

The current result page only shows a score. I will update it to show the full correction (Questions + Answers).

## User Review Required

> [!NOTE]
> This requires passing the user's answers from `QuizTaker` to `QuizResult`, or re-fetching them.
> To keep it simple and robust, I will pass the `answers` object via `navigate` state.

## Proposed Changes

### Student Features

#### [MODIFY] [QuizTaker.jsx](file:///Users/mac/Documents/QCM_APP/src/pages/student/QuizTaker.jsx)
- Pass the `answers` object (questionId -> optionId) in the navigation state to the Result page.
- Pass the full `quiz` object (cache) to avoid re-fetching if possible, or re-fetch in Result.

#### [MODIFY] [QuizResult.jsx](file:///Users/mac/Documents/QCM_APP/src/pages/student/QuizResult.jsx)
- Receive `answers` and `quiz` (or re-fetch quiz details).
- Display a list of all questions.
- For each question:
  - Show the student's selected option (red if wrong, green if correct).
  - Show the correct option (green) if the student failed.

## Verification Plan

### Manual Verification
1. **Take a Quiz**:
   - Log in as Student -> Start Quiz.
   - Select some wrong and some right answers.
   - Submit.
2. **Verify Results**:
   - Check if the score is correct.
   - Scroll down to see the "Correction Détaillée".
   - Confirm that wrong answers are marked red and the correct answer is shown.
