import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import { Button } from "../../../shared/ui/button";

export const NotFoundPage = () => {
  return (
    <section className="flex min-h-[40vh] flex-col items-start justify-center gap-4 rounded-xl border border-border bg-surface p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        Error 404
      </p>
      <h2 className="tracking-tighter text-4xl font-bold text-foreground">
        Route not found
      </h2>
      <p className="text-sm text-muted-foreground">
        The requested route does not exist in this mission workspace.
      </p>
      <Button asChild>
        <Link to={ROUTES.home}>Back to dashboard</Link>
      </Button>
    </section>
  );
};
