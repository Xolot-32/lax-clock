"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play, RotateCcw } from "lucide-react"

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const GameControlPanel: React.FC = () => {
  const [gameTime, setGameTime] = useState(480)
  const [shotClock, setShotClock] = useState(30)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [isShotClockRunning, setIsShotClockRunning] = useState(false)
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [timeouts, setTimeouts] = useState({ home: 4, away: 4 })
  const [penalties, setPenalties] = useState<any[]>([])
  const [timeoutTime, setTimeoutTime] = useState(0)
  const [isTimeoutActive, setIsTimeoutActive] = useState(false)

  const handleGameClockToggle = useCallback(() => {
    setIsGameRunning((prev) => !prev)
    setIsShotClockRunning((prev) => (isGameRunning ? prev : true))
    if (isTimeoutActive) {
      setIsTimeoutActive(false)
      setTimeoutTime(0)
    }
  }, [isGameRunning, isTimeoutActive])

  const handleShotClockReset = useCallback(() => {
    setShotClock(30)
    setIsShotClockRunning(true)
  }, [])

  const handleTimeout = useCallback((team: "home" | "away") => {
    setTimeouts((prev) => ({ ...prev, [team]: prev[team] - 1 }))
    setIsGameRunning(false)
    setIsShotClockRunning(false)
    setTimeoutTime(90)
    setIsTimeoutActive(true)
  }, [])

  const adjustScore = useCallback((team: "home" | "away", amount: number) => {
    setScore((prev) => ({
      ...prev,
      [team]: Math.max(0, prev[team] + amount),
    }))
  }, [])

  const addPenalty = useCallback((team: "home" | "away", duration: number) => {
    setPenalties((prev) => [...prev, { team, duration, timeLeft: duration, id: Date.now() }])
  }, [])

  const adjustGameTime = useCallback((seconds: number) => {
    setGameTime((prev) => Math.max(0, prev + seconds))
  }, [])

  useEffect(() => {
    let gameInterval: NodeJS.Timeout
    let shotInterval: NodeJS.Timeout
    let penaltiesInterval: NodeJS.Timeout
    let timeoutInterval: NodeJS.Timeout

    if (isGameRunning) {
      gameInterval = setInterval(() => {
        setGameTime((prev) => Math.max(0, prev - 1))
      }, 1000)

      if (isShotClockRunning) {
        shotInterval = setInterval(() => {
          setShotClock((prev) => {
            if (prev <= 1) {
              setIsShotClockRunning(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }

      penaltiesInterval = setInterval(() => {
        setPenalties((prev) =>
          prev
            .map((penalty) => (penalty.timeLeft > 0 ? { ...penalty, timeLeft: penalty.timeLeft - 1 } : penalty))
            .filter((penalty) => penalty.timeLeft > 0),
        )
      }, 1000)
    }

    if (isTimeoutActive) {
      timeoutInterval = setInterval(() => {
        setTimeoutTime((prev) => {
          if (prev <= 1) {
            setIsTimeoutActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      clearInterval(gameInterval)
      clearInterval(shotInterval)
      clearInterval(penaltiesInterval)
      clearInterval(timeoutInterval)
    }
  }, [isGameRunning, isShotClockRunning, isTimeoutActive])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Lacrosse Game Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTimeoutActive && (
          <div className="text-center p-2 bg-yellow-100 rounded-md">
            <h3 className="font-semibold">Timeout</h3>
            <div className="text-2xl font-mono">{formatTime(timeoutTime)}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Game Time</h2>
            <div className="text-3xl font-mono my-2">{formatTime(gameTime)}</div>
            <Button
              onClick={handleGameClockToggle}
              variant={isGameRunning ? "destructive" : "default"}
              className="w-full mb-2"
            >
              {isGameRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isGameRunning ? "Pause" : "Start"}
            </Button>
            <div className="flex justify-between">
              <Button onClick={() => adjustGameTime(-10)} variant="outline" size="sm">
                -10s
              </Button>
              <Button onClick={() => adjustGameTime(10)} variant="outline" size="sm">
                +10s
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">Shot Clock</h2>
            <div className={`text-3xl font-mono my-2 ${shotClock <= 10 ? "text-red-500" : ""}`}>{shotClock}</div>
            <Button onClick={handleShotClockReset} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Home</h2>
            <div className="text-3xl font-mono my-2">{score.home}</div>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => adjustScore("home", 1)} variant="outline" size="sm">
                +
              </Button>
              <Button onClick={() => adjustScore("home", -1)} variant="outline" size="sm">
                -
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">Away</h2>
            <div className="text-3xl font-mono my-2">{score.away}</div>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => adjustScore("away", 1)} variant="outline" size="sm">
                +
              </Button>
              <Button onClick={() => adjustScore("away", -1)} variant="outline" size="sm">
                -
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTimeout("home")}
            variant="secondary"
            disabled={timeouts.home === 0 || isTimeoutActive}
          >
            Home Timeout ({timeouts.home})
          </Button>
          <Button
            onClick={() => handleTimeout("away")}
            variant="secondary"
            disabled={timeouts.away === 0 || isTimeoutActive}
          >
            Away Timeout ({timeouts.away})
          </Button>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Penalties</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => addPenalty("home", 30)} variant="outline" size="sm">
              +30s Home
            </Button>
            <Button onClick={() => addPenalty("home", 60)} variant="outline" size="sm">
              +1m Home
            </Button>
            <Button onClick={() => addPenalty("away", 30)} variant="outline" size="sm">
              +30s Away
            </Button>
            <Button onClick={() => addPenalty("away", 60)} variant="outline" size="sm">
              +1m Away
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {penalties.map((penalty) => (
              <div
                key={penalty.id}
                className={`p-2 rounded text-sm ${penalty.team === "home" ? "bg-red-100" : "bg-blue-100"}`}
              >
                {penalty.team === "home" ? "Home" : "Away"} - {formatTime(penalty.timeLeft)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GameControlPanel

