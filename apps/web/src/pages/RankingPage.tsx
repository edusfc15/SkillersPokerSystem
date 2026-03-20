// apps/web/src/pages/RankingPage.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { analyticsHttpService, type MonthlyRankingEntry } from "../http/analytics.service";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function RankingPage() {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [entries, setEntries] = useState<MonthlyRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsHttpService.getAvailableYears().then((res) => {
      setYears(res.years);
      if (res.years.length > 0) setSelectedYear(res.years[0]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    analyticsHttpService
      .getMonthlyRanking(selectedYear)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return null;
    const isPositive = value >= 0;
    return (
      <span className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? "+" : ""}
        {value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ranking Anual</h1>
        <p className="text-muted-foreground">Lucro/prejuízo mensal por jogador</p>
      </div>

      {/* Year selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Ano:</span>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedYear === y
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Sem dados para {selectedYear}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ranking {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left p-3 font-medium text-muted-foreground min-w-32">Jogador</th>
                  {MONTHS.map((m) => (
                    <th key={m} className="text-center p-3 font-medium text-muted-foreground w-16">{m}</th>
                  ))}
                  <th className="text-right p-3 font-medium text-muted-foreground w-20">Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.playerId} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="p-3 text-muted-foreground">{entry.rank}</td>
                    <td className="p-3 font-medium">{entry.playerName}</td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td key={month} className="p-3 text-center">
                        {formatValue(entry.monthly[month])}
                      </td>
                    ))}
                    <td className={`p-3 text-right font-semibold ${entry.yearTotal >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {entry.yearTotal >= 0 ? "+" : ""}
                      {entry.yearTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
