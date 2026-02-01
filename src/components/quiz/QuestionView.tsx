import type { Question } from '../../types/quiz'
import { OptionButton } from './OptionButton'

interface QuestionViewProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedOption: string | undefined
  onSelectOption: (optionId: string) => void
  showResult?: boolean
}

export function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  showResult = false
}: QuestionViewProps) {
  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Pregunta {questionNumber} de {totalQuestions}</span>
        <span>{question.points} {question.points === 1 ? 'punto' : 'puntos'}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question text */}
      <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
        {question.question_text}
      </h2>

      {question.image_url ? (
        <img
          src={question.image_url}
          alt=""
          className="w-full rounded-lg max-h-64 object-contain"
        />
      ) : null}

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            isCorrect={showResult ? option.id === question.correct_answer : undefined}
            isWrong={showResult && selectedOption === option.id && option.id !== question.correct_answer}
            onClick={() => !showResult && onSelectOption(option.id)}
            disabled={showResult}
          />
        ))}
      </div>

      {/* Explanation (only shown in results) */}
      {showResult && question.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Explicación:</p>
          <p className="text-sm text-blue-700">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
