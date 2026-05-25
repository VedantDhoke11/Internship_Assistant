// Core API connection service client placeholder

export async function fetchMockData<T>(endpoint: string, delay = 500): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  // Real implementation will connect to serverless API routes or external endpoints.
  throw new Error(`Endpoint ${endpoint} is not implemented in Stage 1 Foundation.`);
}

export const apiService = {
  getInternships: async () => {
    return fetchMockData('/api/internships');
  },
  analyzeResume: async (fileUrl: string) => {
    return fetchMockData(`/api/ai/resume-parser?url=${encodeURIComponent(fileUrl)}`);
  },
  askAdvisor: async (question: string) => {
    return fetchMockData(`/api/ai/career-advisor?q=${encodeURIComponent(question)}`);
  }
};
