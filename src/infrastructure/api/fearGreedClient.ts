interface FearGreedResponse {
  data: Array<{
    value: string;
    value_classification: string;
  }>;
}

export async function fetchFearGreedIndex() {
  const response = await fetch("https://api.alternative.me/fng/?limit=1", {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("fear greed request failed");
  }

  const data = (await response.json()) as FearGreedResponse;
  const latest = data.data[0];

  if (!latest) {
    throw new Error("fear greed response empty");
  }

  return {
    value: Number(latest.value),
    label: latest.value_classification,
  };
}
