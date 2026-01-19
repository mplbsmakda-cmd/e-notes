"use client";

import * as React from "react";
import { Play, Pause, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const POMODORO_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export function PomodoroTimer() {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = React.useState(POMODORO_DURATION);
  const [isActive, setIsActive] = React.useState(false);
  const [pomodoroCount, setPomodoroCount] = React.useState(0);

  const duration = React.useMemo(() => {
    switch (mode) {
      case "pomodoro":
        return POMODORO_DURATION;
      case "shortBreak":
        return SHORT_BREAK_DURATION;
      case "longBreak":
        return LONG_BREAK_DURATION;
      default:
        return POMODORO_DURATION;
    }
  }, [mode]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);

      if (mode === "pomodoro") {
        const newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);
        toast({
          title: "Sesi Fokus Selesai!",
          description: "Waktunya istirahat. Kerja bagus!",
        });
        if (newPomodoroCount % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("shortBreak");
        }
      } else {
        toast({
          title: "Istirahat Selesai!",
          description: "Saatnya kembali fokus.",
        });
        switchMode("pomodoro");
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, mode, toast, pomodoroCount]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };
  
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    switch (newMode) {
      case "pomodoro":
        setTimeLeft(POMODORO_DURATION);
        break;
      case "shortBreak":
        setTimeLeft(SHORT_BREAK_DURATION);
        break;
      case "longBreak":
        setTimeLeft(LONG_BREAK_DURATION);
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="w-full max-w-xs text-center">
      <div className="flex justify-center gap-1 mb-6">
        <Button
          variant={mode === "pomodoro" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchMode("pomodoro")}
        >
          Fokus
        </Button>
        <Button
          variant={mode === "shortBreak" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchMode("shortBreak")}
        >
          Istirahat Pendek
        </Button>
        <Button
          variant={mode === "longBreak" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchMode("longBreak")}
        >
          Istirahat Panjang
        </Button>
      </div>

      <div className="relative inline-flex h-52 w-52 flex-col items-center justify-center rounded-full border-8 border-muted">
        <div className="text-5xl font-bold font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        <div className="absolute bottom-8 text-sm text-muted-foreground">
            Sesi ke #{pomodoroCount + 1}
        </div>
      </div>
      <Progress value={progress} className="h-2 w-52 mx-auto mt-4" />

      <div className="mt-8 flex justify-center gap-4">
        <Button size="lg" onClick={toggleTimer} className="w-36 text-lg">
          {isActive ? (
            <>
              <Pause className="mr-2" />
              Jeda
            </>
          ) : (
            <>
              <Play className="mr-2" />
              Mulai
            </>
          )}
        </Button>
        <Button size="lg" variant="ghost" onClick={resetTimer}>
            <RotateCw />
        </Button>
      </div>
    </div>
  );
}
