import { useDispatch, useSelector } from "react-redux";
import { Compass, RefreshCw } from "lucide-react";

import {
  incrementMissionCounter,
  resetMissionCounter,
} from "../../../app/store/slices/appSlice";
import { Button } from "../../../shared/ui/button";

export const HomePage = () => {
  const dispatch = useDispatch();
  const { projectName, missionCounter } = useSelector((state) => state.app);

  return (
    <section className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <article className="rounded-xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Active Project
        </p>
        <h2 className="mt-3 tracking-tighter text-4xl font-semibold text-foreground">
          {projectName}
        </h2>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Boilerplate nay da setup theo clean architecture, su dung React
          Router, Redux Toolkit, va component foundation theo phong cach shadcn
          de team phat trien nhanh.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => dispatch(incrementMissionCounter())}>
            <Compass className="size-4" />
            Launch Mission
          </Button>
          <Button
            variant="secondary"
            onClick={() => dispatch(resetMissionCounter())}
          >
            <RefreshCw className="size-4" />
            Reset
          </Button>
        </div>
      </article>

      <aside className="rounded-xl border border-border bg-white p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Mission Counter
        </p>
        <p className="mt-3 tracking-tighter text-6xl font-bold text-foreground">
          {missionCounter}
        </p>
      </aside>
    </section>
  );
};
