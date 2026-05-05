import type { WorkflowStep } from '../types/wocSessionTypes';

type HomeScreenProps = {
  workflow: WorkflowStep[];
  onStartCapture: () => void;
};

export function HomeScreen({ workflow, onStartCapture }: HomeScreenProps) {
  return (
    <section className="stack">
      <div className="hero">
        <span className="status-pill"><span className="status-dot" />SYSTEM ACTIVE</span>
        <div className="brand-mark">
          <span className="brand-kicker">REFAB CONNECT</span>
          <h1 className="brand-title">Correction System Active</h1>
          <p className="brand-subtitle">Work Order Correction System</p>
          <p className="brand-subtitle">Powered by Applied Intelligence Framework</p>
        </div>
        <p className="helper-text">Clear. Guided. Fast.</p>
        <button className="button primary full-width" type="button" onClick={onStartCapture}>Start Capture</button>
      </div>

      <div className="card-grid">
        {workflow.map(([number, title, description]) => (
          <article className="card workflow-card" key={title}>
            <span className="step-number">{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
