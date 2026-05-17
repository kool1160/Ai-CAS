import type { WorkflowStep } from '../types/wocSessionTypes';

type HomeScreenProps = {
  workflow: WorkflowStep[];
  onStartCapture: () => void;
};

export function HomeScreen({ workflow, onStartCapture }: HomeScreenProps) {
  return (
    <section className="stack home-screen">
      <div className="hero">
        <span className="status-pill"><span className="status-dot" />Vectis Active</span>
        <div className="brand-mark">
          <h1 className="brand-title">Vectis</h1>
          <p className="brand-subtitle">Corrective Action System</p>
          <p className="brand-subtitle">Let’s weld.</p>
        </div>
        <p className="helper-text">Let’s weld.</p>
        <button className="button primary full-width" type="button" onClick={onStartCapture}>Start Correction</button>
      </div>

      <div className="card-grid workflow-preview">
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
