import React, { useState, useRef } from "react";

interface SourceData {
  vin?: string;
  brand?: string;
  country?: string;
  customs_date?: string;
  source_url?: string;
  listing_title?: string;
  price?: string;
  specs?: string[];
  [key: string]: unknown;
}

interface VinResult {
  vin: string;
  sources_success: string[];
  sources_failed: string[];
  sources_unavailable: Record<string, string>;
  data: Record<string, SourceData>;
}

function App() {
  const [vin, setVin] = useState<string>("");
  const [result, setResult] = useState<VinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin.trim()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setResult(null);
    setError(null);
    setIsLoading(true);

    const upperVin = vin.trim().toUpperCase();
    console.log(
      `%c[VinChecker] Запрос: ${upperVin}`,
      "color: #3b82f6; font-weight: bold;",
    );

    fetch(`http://127.0.0.1:8000/check/${upperVin}`, {
      signal: abortRef.current.signal,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body.detail ?? `Ошибка сервера: ${res.status}`);
          });
        }
        return res.json() as Promise<VinResult>;
      })
      .then((data) => {
        setResult(data);
        console.log(
          "%c[VinChecker] Результат:",
          "color: #10b981; font-weight: bold;",
        );
        console.table(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          console.error("[VinChecker] Ошибка:", err.message);
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Проверка авто по VIN</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <input
          type="text"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder="Введите VIN (17 символов)"
          maxLength={17}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "16px",
            textTransform: "uppercase",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !vin}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          {isLoading ? "Идёт поиск..." : "Проверить"}
        </button>
      </form>

      {/* Ошибка */}
      {error && (
        <div
          style={{
            border: "2px solid #f43f5e",
            padding: "15px",
            borderRadius: "5px",
            color: "#f43f5e",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            border: "2px solid #4caf50",
            padding: "20px",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3 style={{ color: "#4caf50", marginTop: 0 }}>VIN: {result.vin}</h3>

          {result.sources_success.length > 0 ? (
            result.sources_success.map((source) => (
              <div key={source} style={{ marginBottom: "10px" }}>
                <ul style={{ marginTop: "6px", textAlign: "left" }}>
                  {Object.entries(result.data[source]).map(
                    ([k, v]) =>
                      k !== "source_url" && (
                        <li key={k}>
                          <strong>{k}:</strong>{" "}
                          {Array.isArray(v) ? v.join(", ") : String(v)}
                        </li>
                      ),
                  )}
                </ul>
                {result.data[source].source_url && (
                  <a
                    href={result.data[source].source_url as string}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть источник
                  </a>
                )}
              </div>
            ))
          ) : (
            <p>Данные не найдены ни в одном источнике.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
