import React, { useState, useMemo } from 'react';
import { ShortcutItem } from '../types';
import { playSuccessSound, playErrorSound, playFanfareSound, speakDutchText } from '../utils/audio';
import { Trophy, Award, CheckCircle2, XCircle, RotateCcw, Printer, ArrowRight, Star, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModeProps {
  shortcuts: ShortcutItem[];
  soundEnabled: boolean;
  ttsEnabled: boolean;
}

interface QuestionItem {
  shortcut: ShortcutItem;
  questionText: string;
  options: ShortcutItem[];
  userAnswerId: string | null;
  isCorrect: boolean | null;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  shortcuts,
  soundEnabled,
  ttsEnabled,
}) => {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [pupilName, setPupilName] = useState<string>('Leerling');

  // Start new test with 10 varied questions
  const startQuiz = () => {
    const shuffled = [...shortcuts].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    const generatedQuestions: QuestionItem[] = selected.map((item) => {
      // Pick 3 distractors
      const others = shortcuts.filter((s) => s.id !== item.id);
      const distractors = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [item, ...distractors].sort(() => 0.5 - Math.random());

      const scenario = item.scenarioQuestions[0] || `Welke sneltoets gebruik je voor "${item.title}"?`;

      return {
        shortcut: item,
        questionText: scenario,
        options,
        userAnswerId: null,
        isCorrect: null,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setIsCompleted(false);
    setQuizStarted(true);
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (chosen: ShortcutItem) => {
    if (!currentQ || currentQ.userAnswerId !== null) return;

    const isCorrect = chosen.id === currentQ.shortcut.id;

    if (isCorrect) {
      if (soundEnabled) playSuccessSound();
    } else {
      if (soundEnabled) playErrorSound();
    }

    const updated = [...questions];
    updated[currentIndex] = {
      ...currentQ,
      userAnswerId: chosen.id,
      isCorrect,
    };
    setQuestions(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (soundEnabled) playFanfareSound();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }
  };

  const score = useMemo(() => {
    return questions.filter((q) => q.isCorrect === true).length;
  }, [questions]);

  const percentage = Math.round((score / (questions.length || 1)) * 100);

  const printDiploma = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {!quizStarted ? (
        /* Quiz Welcome screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-sm border border-slate-200 max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 text-blue-800 flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
              Kennis Test
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              SprintPlus Toets & Diploma
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Test jouw kennis van de sneltoetsen met 10 praktijkvragen.
              Behaal je minstens 7 op 10? Dan verdien je het officiële SprintPlus Sneltoets Diploma!
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left space-y-1">
            <label className="text-xs font-bold text-slate-700">Naam van de leerling:</label>
            <input
              type="text"
              value={pupilName}
              onChange={(e) => setPupilName(e.target.value)}
              placeholder="Vul hier je naam in..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            />
          </div>

          <button
            type="button"
            onClick={startQuiz}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#202A76] hover:bg-[#18215d] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>START DE TOETS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : !isCompleted ? (
        /* Active Quiz Question Screen */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-6">
          {/* Header indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
            <span className="font-bold text-blue-700">
              Vraag {currentIndex + 1} van {questions.length}
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
              Score: {score}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question text */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                  {currentQ.shortcut.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {currentQ.shortcut.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  speakDutchText(`${currentQ.shortcut.title}. ${currentQ.questionText}`)
                }
                title="Lees vraag voor"
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm sm:text-base font-medium">
              "{currentQ.questionText}"
            </div>
          </div>

          {/* 4 Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((option) => {
              const hasAnswered = currentQ.userAnswerId !== null;
              const isSelected = currentQ.userAnswerId === option.id;
              const isCorrectAnswer = option.id === currentQ.shortcut.id;

              let style = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

              if (hasAnswered) {
                if (isCorrectAnswer) {
                  style = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400';
                } else if (isSelected && !isCorrectAnswer) {
                  style = 'bg-rose-100 border-rose-400 text-rose-900 line-through';
                } else {
                  style = 'bg-slate-50 opacity-40 border-slate-200';
                }
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <div className="font-mono text-lg font-black tracking-tight text-blue-950">
                    {option.displayKeys}
                  </div>
                  {hasAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action button */}
          {currentQ.userAnswerId !== null && (
            <div className="pt-4 flex justify-end animate-fadeIn">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-[#202A76] hover:bg-[#18215d] text-white font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? 'Volgende Vraag' : 'Bekijk Resultaat'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results & Printable Diploma */
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Printable Official Diploma Area */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border-4 border-[#202A76] print:border-2 print:shadow-none print:m-0 space-y-6 relative overflow-hidden text-center">
            {/* Background seal watermarks & header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-left">
                <div className="w-10 h-10 rounded-full bg-[#202A76] text-white flex items-center justify-center font-black">
                  SP
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm tracking-tight">SprintPlus Sneltoetsen</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Erkend Oefenprogramma</div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div>Datum: {new Date().toLocaleDateString('nl-BE')}</div>
                <div className="font-bold text-[#202A76]">Score: {score} / 10 ({percentage}%)</div>
              </div>
            </div>

            <div className="space-y-3 py-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Officieel Bewijs van Bekwaamheid</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202A76] tracking-tight">
                DIPLOMA SNELTOETSEN
              </h2>
              <p className="text-sm text-slate-600">
                Dit getuigschrift wordt met trots uitgereikt aan:
              </p>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-4 underline-offset-8 py-2">
                {pupilName || 'De Leerling'}
              </div>
              <p className="text-sm text-slate-700 max-w-lg mx-auto pt-2">
                voor het succesvol aantonen van vlotte beheersing en parate kennis van de SprintPlus en SprintPlus.online sneltoetsen voor zelfstandig lezen, typen en leren.
              </p>
            </div>

            {/* Score rating badge */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-7 h-7 ${
                    i < Math.round(score / 2)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs text-slate-500">
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-300 mb-1" />
                <div className="font-semibold text-slate-700">Handtekening Leerling</div>
              </div>
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-300 mb-1" />
                <div className="font-semibold text-slate-700">Handtekening Leerkracht / Zorgcoach</div>
              </div>
            </div>
          </div>

          {/* Action buttons (hidden on print) */}
          <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              type="button"
              onClick={printDiploma}
              className="flex items-center gap-2 px-6 py-3 bg-[#202A76] hover:bg-[#18215d] text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Diploma</span>
            </button>
            <button
              type="button"
              onClick={startQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Opnieuw Afleggen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
