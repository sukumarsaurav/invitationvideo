import { useNavigate } from 'react-router-dom';

/** Back to wherever the person came from inside the app, or to `fallback` on a direct visit. */
export const useBack = (fallback: string) => {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback);
  };
};
