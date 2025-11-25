"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, ChevronDown, ChevronUp, Info, MessageSquare, Save } from "lucide-react";

interface GAVData {
  minSalary: number
  monthCount: number
  weeklyHours: number
  vacationDays: number
}

interface EmploymentData {
  currentSalary: number
  monthCount: number
  weeklyHours: number
  vacationDays: number
}

interface CalculationResults {
  annualSalaryActual: number
  annualSalaryGAV: number
  absoluteDifference: number
  percentageDifference: number
  vacationWeeksDifference: number
  vacationValueDifference: number
  hourlyWageActual: number
  hourlyWageGAV: number
  hourlyWageDifference: number
  hoursValueDifference: number
  effectiveDifference: number
}

export default function SalaryComparison() {
  const [gavData, setGAVData] = useState<GAVData>({
    minSalary: 0,
    monthCount: 13,
    weeklyHours: 42.5,
    vacationDays: 20,
  });

  const [employmentData, setEmploymentData] = useState<EmploymentData>({
    currentSalary: 0,
    monthCount: 14,
    weeklyHours: 42.5,
    vacationDays: 25,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load GAV data from localStorage on mount
  useEffect(() => {
    const savedGAV = localStorage.getItem("gavData");
    if (savedGAV) {
      try {
        setGAVData(JSON.parse(savedGAV));
      } catch (e) {
        console.error("Error loading GAV data:", e);
      }
    }
  }, []);

  const saveGAVData = () => {
    localStorage.setItem("gavData", JSON.stringify(gavData));
  };

  const calculateComparison = () => {
    // Calculate annual salaries
    const annualSalaryActual = employmentData.currentSalary * employmentData.monthCount
    const annualSalaryGAV = gavData.minSalary * gavData.monthCount

    // Calculate salary difference
    const absoluteDifference = annualSalaryActual - annualSalaryGAV
    const percentageDifference = annualSalaryGAV > 0 ? (absoluteDifference / annualSalaryGAV) * 100 : 0

    // Calculate vacation differences
    const vacationDaysDiff = employmentData.vacationDays - gavData.vacationDays
    const vacationWeeksDifference = vacationDaysDiff / 5

    // Calculate value of vacation difference
    const vacationValueDifference = (annualSalaryActual / 52) * vacationWeeksDifference

    const annualHoursActual = employmentData.weeklyHours * 52
    const annualHoursGAV = gavData.weeklyHours * 52
    const hourlyWageActual = annualHoursActual > 0 ? annualSalaryActual / annualHoursActual : 0
    const hourlyWageGAV = annualHoursGAV > 0 ? annualSalaryGAV / annualHoursGAV : 0
    const hourlyWageDifference = hourlyWageActual - hourlyWageGAV

    // If you work MORE hours than GAV, that's a disadvantage (you give more time for the same pay)
    // hoursValueDifference = (GAV hours - IST hours) × 52 × hourlyWageActual
    const weeklyHoursDiff = gavData.weeklyHours - employmentData.weeklyHours
    const hoursValueDifference = weeklyHoursDiff * 52 * hourlyWageActual

    const effectiveDifference = absoluteDifference + vacationValueDifference + hoursValueDifference

    setResults({
      annualSalaryActual,
      annualSalaryGAV,
      absoluteDifference,
      percentageDifference,
      vacationWeeksDifference,
      vacationValueDifference,
      hourlyWageActual,
      hourlyWageGAV,
      hourlyWageDifference,
      hoursValueDifference,
      effectiveDifference,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
              <a href="https://insigh.to/b/gav-check" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-4 w-4" />
                Feedback / Bug melden
              </a>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-balance">Gehältervergleich</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-balance">
            Vergleich zwischen aktuellem Arbeitsvertrag und GAV-Mindestlohn
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Current Employment Card */}
          <Card>
            <CardHeader>
              <CardTitle>IST-Daten (Aktueller Vertrag)</CardTitle>
              <CardDescription>
                Ihre aktuellen Vertragsdaten (werden nicht gespeichert)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentSalary">Monatslohn (Brutto, CHF)</Label>
                <Input
                  id="currentSalary"
                  type="number"
                  value={employmentData.currentSalary || ""}
                  onChange={(e) =>
                    setEmploymentData({
                      ...employmentData,
                      currentSalary: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 6500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMonthCount">Anzahl Monatslöhne</Label>
                <Input
                  id="currentMonthCount"
                  type="number"
                  value={employmentData.monthCount || ""}
                  onChange={(e) =>
                    setEmploymentData({
                      ...employmentData,
                      monthCount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 12, 13 oder 14"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentWeeklyHours">
                  Wöchentliche Arbeitszeit (Stunden)
                </Label>
                <Input
                  id="currentWeeklyHours"
                  type="number"
                  value={employmentData.weeklyHours || ""}
                  onChange={(e) =>
                    setEmploymentData({
                      ...employmentData,
                      weeklyHours: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 42"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentVacationDays">Ferientage pro Jahr</Label>
                <Input
                  id="currentVacationDays"
                  type="number"
                  value={employmentData.vacationDays || ""}
                  onChange={(e) =>
                    setEmploymentData({
                      ...employmentData,
                      vacationDays: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 25"
                />
              </div>
            </CardContent>
          </Card>

          {/* GAV Data Card */}
          <Card>
            <CardHeader>
              <CardTitle>GAV-Mindestdaten</CardTitle>
              <CardDescription>
                Mindeststandards gemäss GAV (z.B. proIT-GAV)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gavSalary">Mindest-Monatslohn (CHF)</Label>
                <Input
                  id="gavSalary"
                  type="number"
                  value={gavData.minSalary || ""}
                  onChange={(e) =>
                    setGAVData({
                      ...gavData,
                      minSalary: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 7000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gavMonthCount">
                  Anzahl Monatslöhne lt. GAV
                </Label>
                <Input
                  id="gavMonthCount"
                  type="number"
                  value={gavData.monthCount || ""}
                  onChange={(e) =>
                    setGAVData({
                      ...gavData,
                      monthCount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 13"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gavWeeklyHours">
                  Wöchentliche Normalarbeitszeit (Stunden)
                </Label>
                <Input
                  id="gavWeeklyHours"
                  type="number"
                  value={gavData.weeklyHours || ""}
                  onChange={(e) =>
                    setGAVData({
                      ...gavData,
                      weeklyHours: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 42"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gavVacationDays">Ferientage lt. GAV</Label>
                <Input
                  id="gavVacationDays"
                  type="number"
                  value={gavData.vacationDays || ""}
                  onChange={(e) =>
                    setGAVData({
                      ...gavData,
                      vacationDays: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="z.B. 25"
                />
              </div>
              <Button
                onClick={saveGAVData}
                variant="outline"
                className="w-full bg-transparent"
              >
                <Save className="mr-2 h-4 w-4" />
                GAV-Daten speichern
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Calculate Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={calculateComparison}
            size="lg"
            className="w-full md:w-auto"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Vergleich berechnen
          </Button>
        </div>

        {/* Results Card */}
        {results && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    Berechnungsergebnis
                  </CardTitle>
                  <CardDescription>
                    Detaillierter Vergleich mit Ferienberücksichtigung
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Jahresbruttolohn IST</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(results.annualSalaryActual)}
                    </p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Jahresbruttolohn GAV</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(results.annualSalaryGAV)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Differenz (absolut)</span>
                    <span
                      className={`text-lg font-bold ${
                        results.absoluteDifference >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results.absoluteDifference >= 0 ? "+" : ""}
                      {formatCurrency(results.absoluteDifference)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Differenz (prozentual)</span>
                    <span
                      className={`text-lg font-bold ${
                        results.percentageDifference >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results.percentageDifference >= 0 ? "+" : ""}
                      {results.percentageDifference.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="bg-cyan-50 dark:bg-cyan-950 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">Stundenlohn-Vergleich</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Stundenlohn IST</p>
                      <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">
                        {formatCurrency(results.hourlyWageActual)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Stundenlohn GAV</p>
                      <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">
                        {formatCurrency(results.hourlyWageGAV)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-cyan-200 dark:border-cyan-800">
                    <span className="text-gray-700 dark:text-gray-300">Stundenlohn-Differenz</span>
                    <span
                      className={`font-bold ${
                        results.hourlyWageDifference >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results.hourlyWageDifference >= 0 ? "+" : ""}
                      {formatCurrency(results.hourlyWageDifference)}/h
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Arbeitsstunden-Berücksichtigung
                  </h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Wochenstunden-Differenz</span>
                    <span className="font-medium">
                      {gavData.weeklyHours - employmentData.weeklyHours >= 0 ? "+" : ""}
                      {(gavData.weeklyHours - employmentData.weeklyHours).toFixed(1)} Std./Woche
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Monetärer Wert der Stunden-Differenz</span>
                    <span
                      className={`font-medium ${
                        results.hoursValueDifference >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results.hoursValueDifference >= 0 ? "+" : ""}
                      {formatCurrency(results.hoursValueDifference)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                    Weniger Arbeitsstunden als GAV = Vorteil (+), mehr Arbeitsstunden = Nachteil (-)
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Ferienberücksichtigung</h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Ferienwochen-Differenz</span>
                    <span className="font-medium">
                      {results.vacationWeeksDifference >= 0 ? "+" : ""}
                      {results.vacationWeeksDifference.toFixed(2)} Wochen
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Wert der Ferien-Differenz</span>
                    <span
                      className={`font-medium ${
                        results.vacationValueDifference >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results.vacationValueDifference >= 0 ? "+" : ""}
                      {formatCurrency(results.vacationValueDifference)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="bg-primary/10 p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Effektive Gesamtdifferenz
                    </span>
                    <span
                      className={`text-3xl font-bold ${
                        results.effectiveDifference >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results.effectiveDifference >= 0 ? "+" : ""}
                      {formatCurrency(results.effectiveDifference)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Inkl. Ferien- und Arbeitszeitberücksichtigung
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex justify-between items-center hover:bg-transparent p-0 h-auto font-semibold text-gray-900 dark:text-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Berechnungsgrundlagen anzeigen
                    </span>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showDetails && (
                    <div className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-300 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          1. Jahreslöhne
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            IST: {formatCurrency(employmentData.currentSalary)}{" "}
                            × {employmentData.monthCount} ={" "}
                            {formatCurrency(results.annualSalaryActual)}
                          </li>
                          <li>
                            GAV: {formatCurrency(gavData.minSalary)} ×{" "}
                            {gavData.monthCount} ={" "}
                            {formatCurrency(results.annualSalaryGAV)}
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          2. Ferienwert-Berechnung
                        </p>
                        <p>
                          Der Wert eines Ferienjahres basiert auf Ihrem
                          aktuellen Jahreslohn geteilt durch 52 Wochen.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Wochenlohn:{" "}
                            {formatCurrency(results.annualSalaryActual)} ÷ 52
                          </li>
                          <li>
                            Differenz Ferienwochen: (
                            {employmentData.vacationDays} -{" "}
                            {gavData.vacationDays}) Tage ÷ 5 ={" "}
                            {results.vacationWeeksDifference.toFixed(2)} Wochen
                          </li>
                          <li>
                            <strong>Wert der Differenz:</strong> Wochenlohn ×{" "}
                            {results.vacationWeeksDifference.toFixed(2)} Wochen
                            = {formatCurrency(results.vacationValueDifference)}
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          3. Effektive Gesamtdifferenz
                        </p>
                        <p>
                          Die Summe aus der reinen Lohndifferenz und dem
                          monetären Wert der Feriendifferenz.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Lohndifferenz:{" "}
                            {formatCurrency(results.absoluteDifference)}
                          </li>
                          <li>
                            + Ferienwert:{" "}
                            {formatCurrency(results.vacationValueDifference)}
                          </li>
                          <li className="font-semibold pt-1">
                            = {formatCurrency(results.effectiveDifference)}
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            🔒 <strong>Datenschutz:</strong> Ihre IST-Daten werden nicht
            gespeichert. Nur die GAV-Mindestdaten werden lokal in Ihrem Browser
            gespeichert.
          </p>
        </div>
      </div>
    </div>
  );
}
